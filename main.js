var Flickr = require('flickrapi');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var request = require('request');
var exec = require('child_process').exec;
var secret = require('./secret.js');
var flickrOptions = {
  api_key: secret.api_key,
  secret: secret.secret,
  permissions: 'write',
  user_id: 'me',
  authenticated: true
};
//because flickr is dumb and only gives ids, no names
//perhaps use postgres?
var photoset_ids = {}; //name : id
var photo_ids = {}; //name : id

// Flickr.authenticate(flickrOptions, function(error, flickr) {
//   _.extend(flickrOptions, flickr.options);
//   upload = upload.bind(this, flickr);
//   download = download.bind(this, flickr);
//   //update photoset_ids
//   flickr.photosets.getList(flickrOptions, function(error, results) {
//     results.photosets.photoset.forEach(function(meta) {
//       photoset_ids[meta.title._content] =  meta.id;
//     });
//     // convertToStega('0926151802.jpg', 'Photos-3');
//     // convertToStega('Photos-2 copy', 'testing1');
//     // convertToStega('test1.pdf');
//   });
//   // upload('test');
// });

// because cloud storage is, imo, used more often for smaller files, e.g. documents and not movies, one file per image
// files in ./raw_files are considered in the root folder, files in ./raw_files/foo are in the foo folder, folders in ./raw_files/foo are to be zipped before converting
// hide all files in raw_files (or specific path) into stega-files and move to upload
function convert() {
  //basically run convertToStega on every file/folder in raw_files
  fs.readdir(path.join(__dirname, 'raw_files'), function(err, items) {
    //for each item,
    //if fileName.split('.')[0] === '', continue (ignore hidden files)
    //if file, convertToStega(fileName)
    //if folder, readdir
    //  for each item,
    //    if file, convertToStega(itemName, folderName)
    //    if folder, convertToStega(itemName, folderName)
    items.filter(function(item) {
      return item.split('.')[0] !== '';
    }).forEach(function(item) {
      console.log(item);
    })
  })
}
convert();

// hide individual file/folder at given dir into a stega-file and move to upload, then uploads
function convertToStega(item, parentFolder) {
  // create parentFolder in tmp and upload
  exec('mkdir "'+path.join('tmp/'+(parentFolder || 'root'))+'" ; '+'mkdir "'+path.join('upload/'+(parentFolder || 'root'))+'"', shellhelper.bind(this, function() {
    // zip folder and move to tmp
    exec('zip -r "'+path.join('tmp/'+(parentFolder || 'root'), item)+'.zip" "'+path.join('raw_files/'+(parentFolder || ''), item)+'"', shellhelper.bind(this, function() {
      // stegafy the zip file in tmp
      exec('cat Unknown.png "'+path.join('tmp/'+(parentFolder || 'root'), item)+'.zip" > "'+path.join('upload/'+(parentFolder || 'root'), item+'.png')+'"', shellhelper.bind(this, function() {
        // remove old file in tmp
        exec('rm "'+path.join('tmp/'+(parentFolder || 'root'), item+'.zip')+'"', shellhelper.bind(this, function() {
          console.log('finished!');
          upload(parentFolder, parentFolder); //keep photoset names the same as their folder name
        }));
      }));
    }));
  }));
}


// upload everything in upload (or specified) folder to specified photoset
function upload(flickr, folderName, photoset) {
  folderDir = path.join(__dirname, 'upload/'+(folderName || 'root'));
  var uploadOptions = { photos: fs.readdirSync(folderDir).filter(function (fileName) {return fileName.split('.')[0] !== '';}).map(function (fileName) {
    return {
      title: fileName.split('.')[0],
      tags: [fileName.split('.')[0]],
      is_public: 0,
      is_friend: 0,
      is_family: 0,
      photo: path.join(folderDir, fileName)
    }
  })};
  console.log(uploadOptions);
  Flickr.upload(uploadOptions, flickrOptions, function(error, photo_ids) {
    console.log('finished uploading', photo_ids, ', now moving to photoset', folderName || 'root');
    if(error) { console.log(error.stack);}
    if(photoset && photoset_ids[photoset]) {
      //move to specified photoset
      photo_ids.forEach(function (photo_id) {
        flickr.photosets.addPhoto(_.extend(flickrOptions, {
          photoset_id: photoset_ids[photoset],
          photo_id: photo_id
        }),
          function(error) { if(error) console.log(error);}
        );
      });
    } else {
      //create photoset with first image, then add rest in
      flickr.photosets.create(_.extend(flickrOptions, {title: folderName || 'root', primary_photo_id: photo_ids[0]}), function(error, result) {
        if(error) {console.log(error.stack);}
        for(var i = 1; i<photo_ids.length; i++) {
          flickr.photosets.addPhoto(_.extend(flickrOptions, {
            photoset_id: result.photoset.id,
            photo_id: photo_ids[i]
          }),
            function(error) { if(error) console.log(error.stack());}
          );
        }
      });
    }
  });
}

// downloads all photos of user in specified photoset, then unzips all of them into downloads folder
function download(flickr, photoset) {
  if(photoset && photoset_ids[photoset]) {
    flickr.photosets.getPhotos(_.extend(flickrOptions, {extras: 'url_o', photoset_id: photoset_ids[photoset]}), function(error, result) {
      if(error) console.log(error.stack);
      dlhelper(result);
    });
  } else {
    flickr.people.getPhotos(_.extend(flickrOptions, {extras: 'url_o'}), function(error, result) {
      if(error) console.log(error.stack);
      dlhelper(result);
    });
  }
}

function dlhelper(result) {
  result.photos.photo.forEach(function(photoMeta) {
    var file = fs.createWriteStream(photoMeta.title + '.tmp');
    request
    .get(photoMeta.url_o)
    .on('error', function(err) {
      console.log(err);
    })
    .pipe(file)
    .on('finish', function(err) {
      if(err) console.log(err);
      else {
        exec('unzip -u '+photoMeta.title+'.tmp -d download', shellhelper(error, stdout, stderr, function() {
          exec('rm '+photoMeta.title+'.tmp', shellhelper(error, stdout, stderr, function() {
            console.log('removed file '+photoMeta.title);
          }));
        }));
      }
    });
  });
}

// DRY
function shellhelper(callback, error, stdout, stderr) {
  console.log('stdout: ' + stdout);
  console.log('stderr: ' + stderr);
  if (error !== null) {
    console.log('exec error: ' + error);
  }
  callback();
}

// downloads what you don't have locally, use this to sync?
// Flickr.authenticate(flickrOptions, Flickr.downsync());

