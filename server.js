var express =   require('express');
var multer  =   require('multer');
var path    =   require('path');
var fs      =   require('fs');
var app     =   express();
var server  =   require('http').createServer(app);
var io      =   require('socket.io')(server);
var flickr  =   require('./main.js');

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join('./raw_files'));
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname)
  }
});
var upload   =   multer({storage, limits: {fileSize: 195*1024*1024}}).any(); //limit file size to 195mb

app.use('/api/upload', upload);
app.use('/dist', express.static('dist'));

//res.download(file) to download file to user!

var dir = {}; //fullPath: id
// function updateDir(photo_ids) {
//   // id: {title, url_o} -> folder1: {folder2: {file1:id1, file2:id2 } }, file:id
//   Object.keys(photo_ids).forEach((id) => {
//     var fileDir = photo_ids[id].title.split('/');
//     helper(dir, fileDir, 0, id);
//   });

//   function helper(curdir, filedir, i, id) {
//     if(i === filedir.length-1) {
//       curdir[filedir[i]] = id;
//     } else {
//       if(curdir[filedir[i]] === undefined) curdir[filedir[i]] = {};
//       helper(curdir[filedir[i]], filedir, i+1, id);
//     }
//   }
// }

function updateDir(photo_ids) {
  Object.keys(photo_ids).forEach((id) => {
    dir[photo_ids[id].title] = id;
  });
}

io.on('connection', (socket) => {
  // socket.emit('directory', testDir);


  // socket.on('hello', () => {
  //   socket.emit("hello");
  //   console.log("hello");
  // });
  // console.log('Connected!');
  flickr.signin(() => {
    updateDir(flickr.photo_ids);
    socket.emit('directory', dir);
  });
});



app.get('/',function(req,res){
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/download/:file*', (req, res) => {
  // res.download(path.join(__dirname, decodeURIComponent(req.path)));
  console.log(dir, req.path);
  flickr.download(dir[decodeURIComponent(req.path.split('/').slice(2).join('/'))], () => {
    res.download(path.join(__dirname, 'download', 'raw_files', decodeURIComponent(req.path.split('/').slice(2).join('/').split('.').slice(0,-1).join('.'))));
  });
});

app.post('/api/upload', function(req,res){
  console.log(req.files);
  upload(req, res, (err) => {
    if(err) {
      console.log("One of your files is too big.");
      res.send("error");
    }
  });
  res.send(req.files.map(function(file) {return file.filename;}).join(', '));
});

server.listen(3000,function(){
  console.log('Working on port 3000');
});
