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
var flickrapi;

//upload everything in upload folder

// Flickr.authenticate(flickrOptions, function(error, flickr) {
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
//   Flickr.upload(uploadOptions, flickrOptions, function(error, result) {
//     if(error) {
//       return console.error(error);
//     }
//     console.log("photos uploaded", result);
//   });
// });


// downloads all photos of user, then unzips all of them into downloads folder
// todo:
// - download from specific photoset/album? use albums as files or folders?

// Flickr.authenticate(flickrOptions, function(error, flickr) {
//   _.extend(flickrOptions, flickr.options);
//   flickrapi = flickr;
//   flickr.people.getPhotos(flickrOptions, function(error, result) {
//     result.photos.photo.forEach(function(photoMeta) {
//       flickr.photos.getSizes(_.extend(flickrOptions, {photo_id: photoMeta.id}), function(error, result) {
//         var file = fs.createWriteStream(photoMeta.title + ".tmp");
//         result.sizes.size.forEach(function(photo) {
//           if(photo.label !== "Original") {return;}
//           request
//             .get(photo.source)
//             .on('error', function(err) {
//               console.log(err);
//             })
//             .pipe(file)
//             .on('finish', function(err) {
//               if(err) console.log(err);
//               else {
//                 console.log("wrote " + photoMeta.title);
//                 console.log("beginning unzip of " + photoMeta.title);
//                 exec("unzip -u "+photoMeta.title+".tmp -d downloads", function(error, stdout, stderr) {
//                   console.log('stdout: ' + stdout);
//                   console.log('stderr: ' + stderr);
//                   if (error !== null) {
//                     console.log('exec error: ' + error);
//                   }
//                   exec("rm "+photoMeta.title+".tmp", function(error, stdout, stderr) {
//                     console.log("removed file "+photoMeta.title);
//                   });
//                 });
//               }
//             });
//         });
//       });
//     });
//   });
// });


// downloads what you don't have locally, use this to sync?
// Flickr.authenticate(flickrOptions, Flickr.downsync());

