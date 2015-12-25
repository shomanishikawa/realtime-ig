import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import bodyParser from 'body-parser'
import Instagram from 'instagram-node-lib'
import dotenv from 'dotenv'

let port = process.env.PORT || 8080;
let static_path = './dist';
let app = express();
let server = http.Server(app);
let io = socketio(server);

dotenv.load();

Instagram.set('client_id', process.env.CLIENT_ID);
Instagram.set('client_secret', process.env.CLIENT_SECRET);
Instagram.set('callback_url', process.env.CALLBACK_URL);
Instagram.set('redirect_uri', process.env.REDIRECT_URI);
Instagram.set('access_token', process.env.ACCESS_TOKEN);
Instagram.set('maxSockets', 10);

// Instagram.tags.subscribe({
//   object: 'tag',
//   object_id: 'catsofinstagram',
//   aspect: 'media',
//   callback_url: process.env.CALLBACK_URL,
//   type: 'subscription'
// });

Instagram.tags.info({
  name: 'blue',
  complete: function(data){
    console.log(data);
  }
});

app.use(express.static(static_path));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: static_path
  })
});

app.get('/gimmecats', (req, res) => {
  Instagram.subscriptions.handshake(req, res);
});

app.post('/gimmecats', (req, res) => {
  res.send();
  Instagram.tags.recent({
    name: req.body[0].object_id,
    complete: (data) => {
      io.sockets.emit('cats', { cat: data } );
    }
  });
});

// io.sockets.on('connection', function (socket) {
//   Instagram.tags.recent({ 
//       name: 'lollapalooza',
//       complete: function(data) {
//         socket.emit('firstShow', { firstShow: data });
//       }
//   });
// });

server.listen(port);
console.log('Listening ...');