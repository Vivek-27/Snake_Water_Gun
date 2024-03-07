const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const path = require('path');

app.use(express.static(path.join(__dirname, '/client')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/wecomeScreen.html');
});

var rooms = [];
io.on('connection', (socket) => {
  console.log('User Connected ' + socket.id);
  var roomIamIn = '';
  socket.on('disconnect', () => {
    console.log(roomIamIn);
    io.to(roomIamIn).emit('userDisconnected', socket.id);
    console.log(rooms);
    for (var r in rooms) {
      if (rooms[r].roomName == roomIamIn) {
        rooms.splice(r, 1);
      }
    }
    console.log(rooms);
    console.log('User dissconnected ' + socket.id);
  });

  socket.on('leave', () => {
    socket.leave(roomIamIn);
    for (var r in rooms) {
      if (rooms[r].roomName == roomIamIn) {
        rooms.splice(r, 1);
      }
    }
    io.to(roomIamIn).emit('userDisconnected', socket.id);
    console.log('User dissconnected ' + socket.id);
  });

  socket.on('playWithFriend', () => {
    console.log('play w f called');
    createPrivateRoom(socket);
  });

  socket.on('joinPrivateRoom', (privateKey) => {
    console.log(privateKey + ' room joined ');
    for (let i in rooms) {
      if (rooms[i].roomName == privateKey) {
        socket.join(privateKey);
        console.log('private room joined');
        roomIamIn = privateKey;
        io.to(roomIamIn).emit('privateRoomJoined', roomIamIn);
      }
    }
  });

  socket.on('playWithStrainger', () => {
    console.log('play w s called');
    var noRoomVacent = false;
    if (rooms.length != 0) {
      for (var r in rooms) {
        if (rooms[r].vacent == true && rooms[r].private == false) {
          socket.join(rooms[r].roomName);
          rooms[r].vacent = false;
          io.to(rooms[r].roomName).emit('publicRoomJoined', rooms[r].roomName);
          console.log('You joined public vacent room');
          roomIamIn = rooms[r].roomName;
          return;
        }
      }
      console.log('no vacent room');
      noRoomVacent = true;
      if (noRoomVacent == true) {
        createPublicRoom(socket);
      }
    } else if (rooms.length == 0) {
      createPublicRoom(socket);
    }
  });

  var choices = [];
  var turns = 0;

  socket.on('myChoice', (msg) => {
    if (turns == 2) {
      io.to(roomIamIn).emit('allTurnsCompleted', {});
    }
    turns++;
    console.log(msg);
    for (var r in rooms) {
      if (rooms[r].roomName == roomIamIn) {
        let choice = {
          player: socket.id,
          choice: msg
        };
        rooms[r].choices.push(choice);
        if (rooms[r].choices.length > 1) {
          console.log(rooms[r]);
          let winner = '';
          if (rooms[r].choices[0].choice === rooms[r].choices[1].choice) {
            io.to(roomIamIn).emit('tieResult', {
              yourChoice: rooms[r].choices[0].choice,
              oppChoice: rooms[r].choices[1].choice
            });
            rooms[r].choices.pop();
            rooms[r].choices.pop();
          } else if (
            (rooms[r].choices[0].choice === 'snake' &&
              rooms[r].choices[0].choice === 'water') ||
            (rooms[r].choices[0].choice === 'water' &&
              rooms[r].choices[1].choice === 'gun') ||
            (rooms[r].choices[0].choice === 'gun' &&
              rooms[r].choices[1].choice === 'snake')
          ) {
            io.sockets.in(rooms[r].choices[0].player).emit('wonResult', {
              yourChoice: rooms[r].choices[0].choice,
              oppChoice: rooms[r].choices[1].choice
            });

            io.sockets.in(rooms[r].choices[1].player).emit('loseResult', {
              yourChoice: rooms[r].choices[1].choice,
              oppChoice: rooms[r].choices[0].choice
            });
            rooms[r].choices.pop();
            rooms[r].choices.pop();
            return;
          } else {
            io.sockets.in(rooms[r].choices[1].player).emit('wonResult', {
              yourChoice: rooms[r].choices[1].choice,
              oppChoice: rooms[r].choices[0].choice
            });

            io.sockets.in(rooms[r].choices[0].player).emit('loseResult', {
              yourChoice: rooms[r].choices[0].choice,
              oppChoice: rooms[r].choices[1].choice
            });
            rooms[r].choices.pop();
            rooms[r].choices.pop();
            return;
          }
        }
      }
    }
  });

  function createPublicRoom(socket) {
    socket.join('publicRoom' + socket.id);
    const room = {
      roomName: 'publicRoom' + socket.id,
      vacent: true,
      choices: [],
      private: false
    };
    rooms.push(room);
    io.to('publicRoom' + socket.id).emit(
      'youCreatedPublicRoom',
      'publicRoom' + socket.id
    );
    roomIamIn = 'publicRoom' + socket.id;
    console.log(roomIamIn);
    console.log('You created public vacent room');
  }

  function createPrivateRoom(socket) {
    socket.join('privateRoom' + socket.id);
    const room = {
      roomName: 'privateRoom' + socket.id,
      vacent: true,
      choices: [],
      private: true
    };
    rooms.push(room);
    io.to('privateRoom' + socket.id).emit(
      'youCreatedPrivateRoom',
      'privateRoom' + socket.id
    );
    roomIamIn = 'privateRoom' + socket.id;
    console.log('You created private room');
  }
});

const PORT = process.env.port || 8080;
server.listen(PORT, () => {
  console.log('Running on port* ' + PORT);
});
