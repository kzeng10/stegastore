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

var testDir = {
  'Photos-3':
  { '0926151802.jpg': '23752462982',
    'Snapchat-5945277042755912440.jpg': '23860851675',
    'Snapchat-1217353164332172533.jpg': '23565101530',
    'Snapchat-4081983583106818276.jpg': '23752468712',
    '1106152046.jpg': '23232672264',
    'Snapchat-1468478545431066180.jpg': '23234024493',
    'Snapchat-5802216128329788294.jpg': '23234026583',
    '1114152149.jpg': '23565099240',
    '1103151336.jpg': '23834724376',
    'Snapchat-7112407981189257950.jpg': '23834731586',
    'Snapchat-4839398511899364055.jpg': '23234026433',
    'Snapchat-227021860759234106.jpg': '23778330111',
    'Snapchat-6014685995134358413.jpg': '23565105470',
    'Snapchat-3680763548128044883.jpg': '23834729286',
    'Snapchat-607219513280778293.jpg': '23234027813',
    'Snapchat-2962356809407015906.jpg': '23834728596',
    'Snapchat-8167755334479518288.jpg': '23860853215',
    'Snapchat-2820648695066216137.jpg': '23232676224',
    'Snapchat-7292084256756261750.jpg': '23492916479',
    '1121151400.jpg': '23778327571',
    '1121151608a.jpg': '23232673584',
    '1121151704d.jpg': '23860847385',
    '1114152150.jpg': '23565099550',
    '1128151944a.jpg': '23752466052',
    'Snapchat-1240055329673400646.jpg': '23834727556',
    'Snapchat-8684322450223756621.jpg': '23752471662',
    'Snapchat-58579172752683650.jpg': '23492914959' },
  root:
  { '0926151802.jpg': '23752462982',
    'Snapchat-5945277042755912440.jpg': '23860851675',
    'Snapchat-1217353164332172533.jpg': '23565101530',
    'Snapchat-4081983583106818276.jpg': '23752468712',
    '1106152046.jpg': '23232672264',
    'Snapchat-1468478545431066180.jpg': '23234024493',
    'Snapchat-5802216128329788294.jpg': '23234026583',
    '1114152149.jpg': '23565099240',
    '1103151336.jpg': '23834724376',
    'Snapchat-7112407981189257950.jpg': '23834731586',
    'Snapchat-4839398511899364055.jpg': '23234026433',
    'Snapchat-227021860759234106.jpg': '23778330111',
    'Snapchat-6014685995134358413.jpg': '23565105470',
    'Snapchat-3680763548128044883.jpg': '23834729286',
    'Snapchat-607219513280778293.jpg': '23234027813',
    'Snapchat-2962356809407015906.jpg': '23834728596',
    'Snapchat-8167755334479518288.jpg': '23860853215',
    'Snapchat-2820648695066216137.jpg': '23232676224',
    'Snapchat-7292084256756261750.jpg': '23492916479',
    '1121151400.jpg': '23778327571',
    '1121151608a.jpg': '23232673584',
    '1121151704d.jpg': '23860847385',
    '1114152150.jpg': '23565099550',
    '1128151944a.jpg': '23752466052',
    'Snapchat-1240055329673400646.jpg': '23834727556',
    'Snapchat-8684322450223756621.jpg': '23752471662',
    'Snapchat-58579172752683650.jpg': '23492914959' ,
    'test1.pdf': '23492908419' }};

io.on('connection', (socket) => {
  socket.emit('directory', testDir);


  // socket.on('hello', () => {
  //   socket.emit("hello");
  //   console.log("hello");
  // });
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
