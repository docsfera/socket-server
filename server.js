var express = require('express'); // Express contains some boilerplate to for routing and such
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http); // вставьте это после определения http


let stack = {
  nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  playersReady: []
}

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

  stack.playersReady = []

  socket.on('disconnect', () => { 
    playersCount--
    console.log('Client disconnected') 
    
    stack = {
      nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      playersReady: []
    }

  }) 
  socket.on('message', data => { 
    console.log(data.msg)

    io.emit('message', data) 
  }) 


  socket.on("hit", (playersCount) => {
    //Math.random() * (max - min) + min;
    const randomIndex = Math.floor(Math.random() * stack.nums.length)
    console.log({randomIndex})

    io.emit('hit', {playersCount, value: stack.nums[randomIndex]}) 
    stack.nums.splice(randomIndex, 1)
  })
  socket.on("ready", (playersCount) => {
    console.log(stack)
    stack.playersReady.push(playersCount)
    io.emit('ready', {playersCount, playersReady: stack.playersReady})
  })
}) 

// Listen on port 5000
app.set('port', (process.env.PORT || 5000));
http.listen(app.get('port'), function(){
  console.log('listening on port',app.get('port'));
});

