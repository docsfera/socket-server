var express = require('express'); // Express contains some boilerplate to for routing and such
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http); // вставьте это после определения http

// Serve the index page 
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/index.html');
});

let playersCount = 0

app.use('/static', express.static('static'));

io.on('connection', (socket) => { 
  console.log('Client connected') 
  playersCount++
  console.log(playersCount)
  io.emit("new player", playersCount)

  socket.on('disconnect', () => { 
    playersCount--
    console.log('Client disconnected') 
  }) 
  socket.on('message', (msg) => { 
    console.log({msg})
    io.emit('message', msg) 
  }) 
}) 

// Listen on port 5000
app.set('port', (process.env.PORT || 5000));
http.listen(app.get('port'), function(){
  console.log('listening on port',app.get('port'));
});

