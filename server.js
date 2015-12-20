var express =   require('express');
var multer  =   require('multer');
var path    =   require('path');
var fs      =   require('fs');
var app     =   express();
var server  =   require('http').createServer(app);
var io      =   require('socket.io')(server);

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

io.on('connection', (socket) => {
  socket.emit('hello');
  socket.on('hello', () => {
    socket.emit("hello");
    console.log("hello");
  });
  console.log('Connected!');
});



app.get('/',function(req,res){
  res.sendFile(path.join(__dirname, 'index.html'));
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
