var Flickr = require('flickrapi');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var recursive = require('recursive-readdir');
var request = require('request');
var exec = require('child_process').exec;
var secret = require('./secret.js');
var flickrOptions = {
  api_key: secret.api_key,
  secret: secret.secret,
  permissions: 'delete',
  user_id: 'me',
  authenticated: true
};

//local cache
var photo_ids = {}; //id: {title, url_o}

/**
Basic documentation
_________

convert(file) -> turns ./raw_files/$(file) into a stega-file, moves to ./upload/$(encodeURIComponent(file))
convertAll() -> applies convertToStega to everything in ./raw_files
upload(file) -> uploads ./upload/$(file) to Flickr as decodeURIComponent(file)
download(photo_id) -> downloads photo from Flickr, access from ./download/raw_files/$(decodeURIComponent(file))
**/

function signin(callback) {
  Flickr.authenticate(flickrOptions, function(error, flickr) {
    _.extend(flickrOptions, flickr.options);
    module.exports.upload = upload.bind(this, flickr);
    module.exports.download = download.bind(this, flickr);
    module.exports.deleteEverything = deleteEverything.bind(this, flickr);
    //update photo_ids
    flickr.people.getPhotos(_.extend(flickrOptions, {extras: 'url_o'}), function(error, results) {
      if(error) console.error(error.stack);
      results.photos.photo.forEach((meta) => {
        photo_ids[meta.id] = {
          title: meta.title,
          url_o: meta.url_o
        }
      });
      if(callback) callback();
      // console.log(photo_ids);
      // results.photosets.photoset.forEach(function(meta) {
      //   photoset_ids[meta.title._content] =  meta.id;
      //   photo_ids[meta.title._content] = {};
      //   flickr.photosets.getPhotos(_.extend(flickrOptions, {photoset_id: meta.id}), function(error, results) {
      //     results.photoset.photo.forEach(function(photo) {
      //       photo_ids[meta.title._content][photo.title] = photo.id;
      //     });
      //   })
      // });
    });
    // setTimeout(() => {
    //   console.log(photo_ids);
    // }, 1000);
    // upload('testing1%2FPhotos-2%20copy%2FSnapchat-8684322450223756621.jpg.png');
    // setTimeout(deleteEverything, 500);
    // upload('Photos-3');
    // upload('root', 'test1.pdf.png');
    // setTimeout(() => {
    //   download('23998206271');
    // }, 500);
    // download('72157662347009042', '23709554182');
  });
}
// signin();


// one file per image
// hide all files in raw_files (or specific path) into stega-files and move to upload

function convertAll() {
  // run convertToStega on every file/folder in raw_files
  recursive('raw_files', function(err, items) {
    // get rid of hidden files
    items = items.filter(function(item) {return path.basename(item).split('.')[0] !== '';});

    items.forEach((item) => {
      convert(item);
    });
  })
}
// convert();
// recursive(path.join('raw_files'), (err, items) => {
//   items = items.map(function(item) {return item.split('/').slice(1).join('/');}).filter(function(item) {return item.split('.')[0] !== '';});
//   console.log(items);
// });

// hide individual file/folder at given dir into a stega-file and move to upload, then uploads
function convert(item) {
  var n = parseInt(Math.random() * 23);
  var file = encodeURIComponent(item.split('/').slice(1).join('/')); //eliminates raw_files at the front and converts to uri component (escapes slashes at least)
  // create upload/ and upload/.tmp
  exec(`mkdir -p "upload/.tmp/"`, shellhelper.bind(this, function() {
    // zip folder and move to tmp
    exec(`zip "${path.join('upload/.tmp/', file)}.zip" "${item}"`, shellhelper.bind(this, function() {
      // stegafy the zip file in tmp
      exec(`cat stegosaurus/steg${n}.png "${path.join('upload/.tmp/', file)}.zip" > "${path.join('upload/', file)}.png"`, shellhelper.bind(this, function() {
        // remove old file in tmp
        exec(`rm "${path.join('upload/.tmp/', file)}.zip"`, shellhelper.bind(this, function() {
          console.log(`finished with ${item}`);
        }));
      }));
    }));
  }));
}
// convertToStega('raw_files/nyan1.png')

// upload all in upload
function uploadAll() {
  fs.readdir('upload', (err, files) => {
    files
    .filter(function(item) {return item.split('.')[0] !== '';})
    .forEach((item) => {
      upload(item);
    });
  });
}
// uploadAll();

// upload specified file (assume file name is already uri-encoded)
function upload(flickr, file) {
  var uploadOptions = {
    photos: [{
      title: decodeURIComponent(file),
      tags: decodeURIComponent(file),
      is_public: 0,
      is_friend: 0,
      is_family: 0,
      photo: path.join('upload', file)
    }]
  };
  console.log(uploadOptions);
  Flickr.upload(uploadOptions, flickrOptions, function(error, photo_id) {
    console.log(`finished uploading ${file} with photo_id ${photo_id}`);
    if(error) { console.error(error.stack);}
  });
}

// downloads specified photo, then unzips into downloads folder
function download(flickr, photo_id, callback) {
  console.log(photo_ids, photo_id);
  exec('mkdir -p download/.tmp', shellhelper.bind(this, function() {
    var file = fs.createWriteStream(path.join('download/.tmp', encodeURIComponent(photo_ids[photo_id].title)));
    request
    .get(photo_ids[photo_id].url_o)
    .on('error', function(err) {
      console.error(err);
    })
    .pipe(file)
    .on('finish', function(err) {
      if(err) console.error(err);
      else {
        exec(`unzip -u "${path.join('download/.tmp',encodeURIComponent(photo_ids[photo_id].title))}" -d download`, shellhelper.bind(this, function() {
          exec(`rm "${path.join('download/.tmp',encodeURIComponent(photo_ids[photo_id].title))}"`, shellhelper.bind(this, function() {
            console.log('downloaded file '+photo_ids[photo_id].title);
            // request.get('http://localhost:3000/download/'+photo_ids[photo_id].title));
            if(callback) callback();
          }));
        }));
      }
    });
  }));
}

// DRY
function shellhelper(callback, error, stdout, stderr) {
  // console.log('stdout: ' + stdout);
  // console.log('stderr: ' + stderr);
  if (error !== null) {
    console.error('exec error: ' + error);
  }
  callback();
}

// delete everything
function deleteEverything(flickr) {
  Object.keys(photo_ids).forEach(function(photo_id) {
    flickr.photos.delete(_.extend(flickrOptions, {photo_id}), function(error, result) {
      if(error) console.error(error.stack);
      console.log("deleted photo", photo_ids[photo_id].title);
    });
  });
}
// downloads what you don't have locally, use this to sync?
// Flickr.authenticate(flickrOptions, Flickr.downsync());


module.exports = {
  signin,
  flickrOptions,
  photo_ids,
  convertAll,
  convert,
  uploadAll
}
