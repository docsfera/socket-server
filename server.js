var express = require('express'); // Express contains some boilerplate to for routing and such
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http); // вставьте это после определения http


let stack = {
  nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  playersReady: [],
  order: 1,
  skips: 0,
  wins1: 0,
  wins2: 0,
  score1: 0,
  score2: 0,

}

// Serve the index page 
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/index.html');
});

let playersCount = 0

app.use('/static', express.static('static'));

io.on('connection', (socket) => { 
  io.emit('message', {msg: "Connected", player: 0})
  console.log('Client connected') 
  playersCount++
  console.log(playersCount)
  io.emit("new player", playersCount)

  stack.playersReady = []

  socket.on('disconnect', () => { 
    playersCount--
    console.log('Client disconnected') 

    io.emit('message', {msg: "Disconnected", player: -1})
    
    stack = {
      nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      playersReady: [],
      order: 1,
      skips: 0,
      wins1: 0,
      wins2: 0,
      score1: 0,
      score2: 0,
    }

  }) 
  socket.on('message', data => { 
    io.emit('message', data) 
  }) 


  socket.on("hit", (playersCount) => {
    if(playersCount != stack.order && stack.nums.length < 11 - 3) return;

    if(stack.order == 1){
      stack.order = 2
    }else{
      stack.order = 1
    }

    const randomIndex = Math.floor(Math.random() * stack.nums.length)
    const value = stack.nums[randomIndex]

    stack['score' + playersCount] += value

    io.emit('hit', {playersCount, value: value, order: stack.order}) 
    stack.nums.splice(randomIndex, 1)
    stack.skips = 0
  })

  socket.on("skip", playersCount => {
    stack.skips++
    if(stack.skips < 2){
      if(stack.order == 1){
        stack.order = 2
      }else{
        stack.order = 1
      }
      io.emit("skip", stack.order)
    }else{

      let w1 = 21 - stack.score1
      let w2 = 21 - stack.score2

      if(w1 < 0) stack.wins2++
      if(w2 < 0) stack.wins1++

      if(w1 > 0 && w2 > 0 && w1 < w2) stack.wins1++
      if(w1 > 0 && w2 > 0 && w2 < w1) stack.wins2++

      io.emit("end", {wins1: stack.wins1, wins2: stack.wins2})

      stack = {
        nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        playersReady: [],
        order: 1,
        skips: 0,
        score1: 0,
        score2: 0,
        wins1: stack.wins1,
        wins2: stack.wins2,
      }
    }
    
  })
  socket.on("ready", (playersCount) => {
    stack.playersReady.push(playersCount)
    io.emit('ready', {playersCount, playersReady: stack.playersReady})
  })
}) 

// Listen on port 5000
app.set('port', (process.env.PORT || 5000));
http.listen(app.get('port'), function(){
  console.log('listening on port',app.get('port'));
});

