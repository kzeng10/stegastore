var express  =   require('express');
var multer   =   require('multer');
var path     =   require('path');
var fs       =   require('fs');
var app      =   express();

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    console.log(req.files, file);
    cb(null, path.join('./raw_files', file, req));
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname)
  }
});
var upload   =   multer({storage: storage});

app.use(upload.any());

// app.use('/api/upload', upload.single('file'));

//res.download(file) to download file to user!


app.get('/',function(req,res){
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/api/upload', function(req,res){
  console.log(req.files);
  // fs.readFile(req.files.displayImage.path, function (err, data) {
  //   var newPath = path.join(__dirname, 'raw_files');
  //   fs.writeFile(newPath, data, function (err) {
  //     res.redirect("back");
  //   });
  // });
  res.send(req.files.map(function(file) {return file.filename;}).join(', '));
});

app.listen(3000,function(){
  console.log('Working on port 3000');
});
