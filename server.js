var express = require('express'),
    http = require('http');
var app = express();
var server = http.createServer(app);
const port = 8077
const io = require('socket.io')(server);


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})
io.on('connection', (socket) => { 
  console.log('Client connected') 
  socket.on('disconnect', () => { 
    console.log('Client disconnected') 
  }) 
  socket.on('message', (msg) => { 
    console.log({msg})
    io.emit('message', msg) 
  }) 
}) 
// app.listen(port, () => {
//     console.log(`App listening on port ${port}`)
// })
server.listen(port, () => { 
  console.log(`App listening on port ${port}`)
})