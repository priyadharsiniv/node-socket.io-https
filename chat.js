var fs = require('fs');
var https = require('https');
var http = require('http');

var express = require('express');
var app = express();

var options = {
  key: fs.readFileSync('privatekey.pem'),
  cert: fs.readFileSync('cert.pem'),
  ca: fs.readFileSync('chain.pem'),
  secure: true,reconnect: true,
  rejectUnauthorized : false
};
var serverPort = 488;


var server = https.createServer(options, app);
//var server = http.createServer(app);
var io = require('socket.io')(server);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  console.log('connection: ', socket.connected);
  socket.emit('message', 'This is a message from the dark side.');

  socket.on('subscribe', function(id) {
    console.log('joining id', id);
    socket.join(id);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('message', function(msg){
    console.log("income message: ", msg);
    var data = JSON.parse(msg)
    socket.broadcast.to(data.toid).emit('message', msg);
  });

});

server.listen(serverPort, function() {
  console.log('server up and running at %s port', serverPort);
});
