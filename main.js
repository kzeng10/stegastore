var Flickr = require("flickrapi");
var _ = require("underscore");
var fs = require('fs');
var path = require('path');
var request = require('request');
var exec = require('child_process').exec;
var secret = require('./secret.js');
var flickrOptions = {
  api_key: secret.api_key,
  secret: secret.secret,
  permissions: "write",
  user_id: "me",
  authenticated: true
};
//because flickr is dumb and only gives ids, no names
var photoset_ids = {}; //name : id
var photo_ids = {}; //name : id

Flickr.authenticate(flickrOptions, function(error, flickr) {
  _.extend(flickrOptions, flickr.options);
  download(flickr, 72157662310752692);
})

//upload everything in upload folder in specified photoset

// function upload(flickr, photoset) {
//   var uploadOptions = { photos: fs.readdirSync("upload").filter(function (fileName) {return fileName.split(".")[0] !== '';}).map(function (fileName) {
//     return {
//       title: fileName.split(".")[0],
//       tags: [fileName.split(".")[0]],
//       is_public: 0,
//       is_friend: 0,
//       is_family: 0,
//       photo: path.join(__dirname, "/upload/"+fileName)
//     }
//   })};
//   Flickr.upload(uploadOptions, flickrOptions, function(error, photo_ids) {
//     if(error) { console.log(error.stack);}
//     if(photoset) {
//       //move to specified photoset
//       photo_ids.forEach(function (photo_id) {
//         flickr.photosets.addPhoto(_.extend(flickrOptions, {
//           photoset_id: photoset_ids[photoset],
//           photo_id: photo_id
//         }),
//           function(error) { if(error) console.log(error);}
//         );
//       });
//     } else {
//       //create photoset with first image, then add rest in
//       flickr.photosets.create(_.extend(flickrOptions, {title: Date.now(), primary_photo_id: photo_ids[0]}), function(error, result) {
//         if(error) {console.log(error.stack);}
//         for(var i = 1; i<photo_ids.length; i++) {
//           flickr.photosets.addPhoto(_.extend(flickrOptions, {
//             photoset_id: result.photoset.id,
//             photo_id: photo_ids[i]
//           }),
//             function(error) { if(error) console.log(error.stack());}
//           );
//         }
//       });
//     }
//   });
// }

// upload();

// downloads all photos of user in specified photoset, then unzips all of them into downloads folder
// todo:
// - download from specific photoset/album? use albums as files or folders?
function download(flickr, photoset) {
  if(photoset && photoset_ids[photoset]) {
    flickr.photosets.getPhotos(_.extend(flickrOptions, {extras: "url_o", photoset_id: photoset_ids[photoset]}), function(error, result) {
      if(error) console.log(error.stack);
      helper(result);
    });
  } else {
    flickr.people.getPhotos(_.extend(flickrOptions, {extras: "url_o"}), function(error, result) {
      if(error) console.log(error.stack);
      helper(result);
    });
  }
}

function helper(result) {
  result.photos.photo.forEach(function(photoMeta) {
    var file = fs.createWriteStream(photoMeta.title + ".tmp");
    request
    .get(photoMeta.url_o)
    .on('error', function(err) {
      console.log(err);
    })
    .pipe(file)
    .on('finish', function(err) {
      if(err) console.log(err);
      else {
        exec("unzip -u "+photoMeta.title+".tmp -d download", function(error, stdout, stderr) {
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
          if (error !== null) {
            console.log('exec error: ' + error);
          }
          exec("rm "+photoMeta.title+".tmp", function(error, stdout, stderr) {
            console.log("removed file "+photoMeta.title);
          });
        });
      }
    });
  });
}

// downloads what you don't have locally, use this to sync?
// Flickr.authenticate(flickrOptions, Flickr.downsync());

