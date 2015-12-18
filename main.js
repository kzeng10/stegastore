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
  permissions: 'delete',
  user_id: 'me',
  authenticated: true
};
//because flickr is dumb and only gives ids, no names
//perhaps use postgres?
var photoset_ids = {}; //name : id
var photo_ids = {}; //photoset: {photoname : id}

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
    // convertToStega('0926151802.jpg', 'Photos-3');
    // convertToStega('Photos-2 copy', 'testing1');
    // convertToStega('test1.pdf');
  });
  // upload('root');
  // setTimeout(deleteEverything, 5000);
  // upload('testing1');
  // upload('root', 'test1.pdf.png');
  // download('72157660179585674');
  // download('72157662347009042', '23709554182');
});

// because cloud storage is, imo, used more often for smaller files, e.g. documents and not movies, one file per image
// files in ./raw_files are considered in the root folder, files in ./raw_files/foo are in the foo folder, folders in ./raw_files/foo are to be zipped before converting
// hide all files in raw_files (or specific path) into stega-files and move to upload
function convert() {
  //basically run convertToStega on every file/folder in raw_files
  fs.readdir(path.join(__dirname, 'raw_files'), function(err, items) {
    // get rid of hidden files
    items = items.filter(function(item) {return item.split('.')[0] !== '';}).map(function(item) {return path.join('raw_files', item)});

    //for each item,
    //if fileName.split('.')[0] === '', continue (ignore hidden files)
    //if file, convertToStega(fileName)
    //if folder, readdir
    //  for each item,
    //    if file, convertToStega(itemName, folderName)
    //    if folder, convertToStega(itemName, folderName)

    // files in root
    items.filter(function(item) {
      return fs.statSync(item).isFile();
    }).forEach(function(file) {
      convertToStega(path.basename(file));
    });

    // folders in root
    items.filter(function(item) {
      return fs.statSync(item).isDirectory();
    }).forEach(function(parentFolder) {
      fs.readdir(path.join(__dirname, parentFolder), function(err, items) {
        items = items.filter(function(item) {return item.split('.')[0] !== '';}).map(function(item) {return path.join(parentFolder, item)});
        // files in folder
        items.filter(function(item) {
          return fs.statSync(item).isFile();
        }).forEach(function(file) {
          convertToStega(path.basename(file), path.basename(parentFolder));
        });

        // folders in folder
        items.filter(function(item) {
          return fs.statSync(item).isDirectory();
        }).forEach(function(folder) {
          convertToStega(path.basename(folder), path.basename(parentFolder));
        });
      });
    });
  })
}
// convert();

// hide individual file/folder at given dir into a stega-file and move to upload, then uploads
function convertToStega(item, parentFolder) {
  // create .tmp/parentFolder and parentFolder in upload
  exec('mkdir -p "'+path.join('upload/.tmp/'+(parentFolder || 'root'))+'" ; '+'mkdir "'+path.join('upload/'+(parentFolder || 'root'))+'"', shellhelper.bind(this, function() {
    // zip folder and move to tmp
    exec('zip -r "'+path.join('upload/.tmp/'+(parentFolder || 'root'), item)+'.zip" "'+path.join('raw_files/'+(parentFolder || ''), item)+'"', shellhelper.bind(this, function() {
      // stegafy the zip file in tmp
      exec('cat Unknown.png "'+path.join('upload/.tmp/'+(parentFolder || 'root'), item)+'.zip" > "'+path.join('upload/'+(parentFolder || 'root'), item+'.png')+'"', shellhelper.bind(this, function() {
        // remove old file in tmp
        exec('rm "'+path.join('upload/.tmp/'+(parentFolder || 'root'), item+'.zip')+'"', shellhelper.bind(this, function() {
          console.log('finished!');
          // upload(parentFolder, parentFolder); //keep photoset names the same as their folder name
        }));
      }));
    }));
  }));
}

// upload everything (or specified file) in specified folder to specified photoset (of the same name)
function upload(flickr, folderName, file) {
  var folderDir = path.join(__dirname, 'upload', folderName);
  var uploadOptions = {
    photos: fs.readdirSync(folderDir).filter(function (fileName) {return fileName.split('.')[0] !== '' && (file ? fileName === file : true);}).map(function (fileName) {
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
    console.log('finished uploading', photo_ids, ', now moving to photoset', folderName);
    if(error) { console.log(error.stack);}
    if(folderName && photoset_ids[folderName]) {
      //move to specified photoset
      photo_ids.forEach(function (photo_id) {
        flickr.photosets.addPhoto(_.extend(flickrOptions, {
          photoset_id: photoset_ids[folderName],
          photo_id: photo_id
        }),
          function(error) { if(error) console.log(error);}
        );
      });
    } else {
      //create photoset with first image, then add rest in
      flickr.photosets.create(_.extend(flickrOptions, {title: folderName, primary_photo_id: photo_ids[0]}), function(error, result) {
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
  console.log('stdout: ' + stdout);
  console.log('stderr: ' + stderr);
  if (error !== null) {
    console.log('exec error: ' + error);
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

