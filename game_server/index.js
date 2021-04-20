const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
    path: '/game',
    serveClient: false,
    // below are engine.IO options
    // pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false,
    cors: false
});

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

server.listen(4000, () => {
  console.log('listening on *:4000');
});

io.on('connection', (socket) => {
  console.log('a new user connected')
  require('./src/server.js')(io, socket);
});