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

//because flickr is dumb and only gives ids, no names
var photoset_ids = {}; //name : id
var photo_ids = {}; //photoset: {photoname : id}

/**
Basic documentation
_________

convertToStega(file) -> turns ./raw_files/$(file) into a stega-file, moves to ./upload/root/$(file)
convertToStega(item, parentFolder) -> turns ./raw_files/$(parentFolder)/$(item) into a stega-file, moves to ./upload/$(parentFolder)/$(file)
convert() -> applies convertToStega to everything in ./raw_files
upload(folderName) -> uploads everything in ./upload/$(folderName) to Flickr
upload(folderName, file) -> uploads ./upload/$(folderName)/$(file) to Flickr
download(photoset_id) -> downloads photoset from Flickr
download(photoset_id, photo_id) -> downloads photo inside photoset from Flickr
**/


Flickr.authenticate(flickrOptions, function(error, flickr) {
  _.extend(flickrOptions, flickr.options);
  upload = upload.bind(this, flickr);
  download = download.bind(this, flickr);
  deleteEverything = deleteEverything.bind(this, flickr);
  //update photoset_ids
  flickr.photosets.getList(flickrOptions, function(error, results) {
    results.photosets.photoset.forEach(function(meta) {
      photoset_ids[meta.title._content] =  meta.id;
      photo_ids[meta.title._content] = {};
      flickr.photosets.getPhotos(_.extend(flickrOptions, {photoset_id: meta.id}), function(error, results) {
        results.photoset.photo.forEach(function(photo) {
          photo_ids[meta.title._content][photo.title] = photo.id;
        });
      })
    });
  });
  // setTimeout(() => {
  //   console.log(photo_ids);
  // }, 5000);
  upload('testing1%2FPhotos-2%20copy%2FSnapchat-8684322450223756621.jpg.png');
  // setTimeout(deleteEverything, 5000);
  // upload('Photos-3');
  // upload('root', 'test1.pdf.png');
  // download('72157660179585674');
  // download('72157662347009042', '23709554182');
});

// one file per image
// for each file, convertToStega(file); for each folder, convert(folderName)
// hide all files in raw_files (or specific path) into stega-files and move to upload

function convert() {
  // run convertToStega on every file/folder in raw_files
  recursive('raw_files', function(err, items) {
    // get rid of hidden files
    items = items.filter(function(item) {return path.basename(item).split('.')[0] !== '';});
    // note that these all contain raw_files/ at the beginning, e.g. raw_files/foo/bar/file.txt

    //for each item, convertToStega(item)
    items.forEach((item) => {
      convertToStega(item);
    });
  })
}
// convert();
// recursive(path.join('raw_files'), (err, items) => {
//   items = items.map(function(item) {return item.split('/').slice(1).join('/');}).filter(function(item) {return item.split('.')[0] !== '';});
//   console.log(items);
// });

// hide individual file/folder at given dir into a stega-file and move to upload, then uploads
function convertToStega(item) {
  var n = parseInt(Math.random() * 23);
  var file = encodeURIComponent(item.split('/').slice(1).join('/')); //eliminates raw_files at the front and converts to uri component (escapes slashes at least)
  // create upload/ and upload/.tmp
  exec('mkdir -p "upload/.tmp/"', shellhelper.bind(this, function() {
    // zip folder and move to tmp
    exec('zip -r "'+path.join('upload/.tmp/', file)+'.zip" "'+item+'"', shellhelper.bind(this, function() {
      // stegafy the zip file in tmp
      exec(`cat stegosaurus/steg${n}.png "${path.join('upload/.tmp/', file)}.zip" > "${path.join('upload/', file)}.png"`, shellhelper.bind(this, function() {
        // remove old file in tmp
        exec('rm "'+path.join('upload/.tmp/', file)+'.zip"', shellhelper.bind(this, function() {
          console.log(`finished with ${item}`);
          // upload(parentFolder, parentFolder); //keep photoset names the same as their folder name
          // upload(parentFolder, item); //probably going to use this more often, upload individual file then delete it from upload and raw_files
        }));
      }));
    }));
  }));
}
// convertToStega('raw_files/test1.pdf');


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
  Flickr.upload(uploadOptions, flickrOptions, function(error, photo_ids) {
    console.log('finished uploading', file, 'with photo_id', photo_ids);
    if(error) { console.log(error.stack);}
    // if(folderName && photoset_ids[folderName]) {
    //   //move to specified photoset
    //   photo_ids.forEach(function (photo_id) {
    //     flickr.photosets.addPhoto(_.extend(flickrOptions, {
    //       photoset_id: photoset_ids[folderName],
    //       photo_id: photo_id
    //     }),
    //       function(error) { if(error) console.log(error);}
    //     );

    //     //remove file/folder from upload and raw_files

    //   });
    // } else {
    //   //create photoset with first image, then add rest in
    //   flickr.photosets.create(_.extend(flickrOptions, {title: folderName, primary_photo_id: photo_ids[0]}), function(error, result) {
    //     if(error) {console.log(error.stack);}
    //     for(var i = 1; i<photo_ids.length; i++) {
    //       flickr.photosets.addPhoto(_.extend(flickrOptions, {
    //         photoset_id: result.photoset.id,
    //         photo_id: photo_ids[i]
    //       }),
    //         function(error) { if(error) console.log(error.stack());}
    //       );

    //       //remove file/filder from upload and raw_files

    //     }
    //   });
    // }
  });
}

// downloads all photos (or specified photo) of user in specified photoset, then unzips all of them into downloads folder
function download(flickr, photoset_id, photo_id) {
  flickr.photosets.getPhotos(_.extend(flickrOptions, {extras: 'url_o', photoset_id: photoset_id}), function(error, result) {
    if(error) console.log(error.stack);
    console.log(result);
    exec('mkdir -p download/.tmp', shellhelper.bind(this, function() {
      result.photoset.photo
      .filter(function(photoMeta) {return (photo_id ? photoMeta.id === photo_id : true);})
      .forEach(function(photoMeta) {
        console.log(photoMeta);
        var file = fs.createWriteStream(path.join('download', '.tmp', photoMeta.title));
        request
        .get(photoMeta.url_o)
        .on('error', function(err) {
          console.log(err);
        })
        .pipe(file)
        .on('finish', function(err) {
          if(err) console.log(err);
          else {
            exec('unzip -u "'+path.join('download','.tmp',photoMeta.title)+'" -d download', shellhelper.bind(this, function() {
              exec('rm "'+path.join('download','.tmp',photoMeta.title)+'"', shellhelper.bind(this, function() {
                console.log('removed file '+photoMeta.title);
              }));
            }));
          }
        });
      });
    }));
  });
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
  console.log(photo_ids);
  Object.keys(photo_ids).forEach(function(photoset) {
    Object.keys(photo_ids[photoset]).forEach(function(photo) {
      flickr.photos.delete(_.extend(flickrOptions, {photo_id: photo_ids[photoset][photo]}), function(error, result) {
        console.log("deleted photo", photo_ids[photoset][photo]);
      });
    });
  });
}
// downloads what you don't have locally, use this to sync?
// Flickr.authenticate(flickrOptions, Flickr.downsync());

