const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const Vimeo = require('vimeo').Vimeo;
const fs = require('fs');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
let client = new Vimeo("aae0391f6b06fb363b87898c5e7b0102314dbc5a", "0ORmBprANtQ2WN+UMCR+AGnhF4IY4Qc4iU1mJ9YbJfJdgQiMnxxeg9ou8iztK/1hZlxoDYBiS4qkBuucYIF6ceI4NqXWKK1rbqPydqlUA0me6vqijwVidE4w5ItKfq+R", "21bffdce16d56c3ebd3a28b08a955c6b");

const Video = require('./models/Video');
const User = require('./models/User');
// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://<vimeoapp>:<test@123>@ds223509.mlab.com:23509/heroku_s6gmmjp2';

mongoose.connect(MONGODB_URI);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
  console.log("we're connected!");
})
// Init Upload
const upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /mp4|mov|wmv|avi|flv/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Only MP4, MOV, WMV, AVI, and FLV files!');
  }
}

// Init app
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());
// EJS
app.set('view engine', 'ejs');

// Public Folder
app.use(express.static('./public'));

app.get('/', (req, res) => res.render('login'));

app.post('/login', (req, res) => {

     User.find({ email: req.body.email, password: req.body.password }, function(err, user){

        // console.log(user);
      if(err)
      {
        res.redirect('/');
      }
      else{
        for (let i = 0; i < user.length; i++) {
          if (user[i].role == "admin") {
            res.redirect('/upload-video');
          }
          else if (user[i].role == "user") {
            res.redirect('/get-videos');
          }

        } 
      }    
     });


})

app.get('/upload-video', (req, res) => res.render('index'));

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if(err){
      res.render('index', {
        msg: err
      });
    } else {
      if(req.file == undefined){
        res.render('index', {
          msg: 'Error: No File Selected!'
        });
      } else {
        res.render('index', {
          msg: 'File Uploaded!',
          file: `uploads/${req.file.filename}`
        });
        var videoFile = './public/uploads/'+req.file.filename;
        client.upload(
          videoFile,
		      {
            'name': req.body.name,
            'description': req.body.description,
            'privacy': {
              'view': 'password'
            },
            'password': req.body.vidpassword,
          },
          function (uri) {
            console.log('Your video URI is: ' + uri);
            var video = new Video();

            video.videourl = uri;
            video.videopassword = req.body.vidpassword;
            video.name = req.body.name;
            video.description = req.body.description;
            video.save(function (err, video) {
              if (err)
                console.log(err);
            });
          },
          function (bytes_uploaded, bytes_total) {
            var percentage = (bytes_uploaded / bytes_total * 100).toFixed(2)
            console.log(bytes_uploaded, bytes_total, percentage + '%');
            if (bytes_uploaded == bytes_total)
            {
              fs.unlinkSync(videoFile);
            }
          },
          function (error) {
            console.log('Failed because: ' + error)
          }
        )   
      }
    }
  });
});


app.get('/get-videos', (req, res) => { 
  
  Video.get((err, videos) => {
    if(err){
      res.send('404 Not found');
    }
    else{
          res.render('videos', { videoid: videos });
          // videos.forEach(video => {

          //     // client.request({
          //     //   method: 'GET',
          //     //   path: video.videourl,
          //     //   query: {
          //     //     'privacy': {
          //     //       'view': 'password'
          //     //     },
          //     //     'password': video.videopassword
          //     //   }
          //     // },
          //     //   function (error, body, status_code, headers) {
          //     //     if (error) {
          //     //       console.log('error');
          //     //       console.log(error);
          //     //     } else {
          //     //       vidlink.push(body.link);
          //     //     }
          //     //   });

          // });
    }
  });

    // console.log(vidlink);
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));