const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

const PORT = 7580;

// Rooms storage
const rooms = {};

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('create_room', () => {
    let roomCode = generateRoomCode();
    while (rooms[roomCode]) {
      roomCode = generateRoomCode();
    }
    
    rooms[roomCode] = {
      id: roomCode,
      players: [socket.id],
      host: socket.id
    };
    
    socket.join(roomCode);
    socket.emit('room_created', roomCode);
    console.log(`Room created: ${roomCode} by ${socket.id}`);
  });

  socket.on('join_room', (roomCode) => {
    roomCode = roomCode.toUpperCase();
    const room = rooms[roomCode];
    if (room) {
      if (room.players.length < 4) {
        room.players.push(socket.id);
        socket.join(roomCode);
        socket.emit('room_joined', roomCode);
        
        // Notify host to sync state with the new player
        io.to(room.host).emit('player_joined', socket.id);
        console.log(`User ${socket.id} joined room ${roomCode}`);
      } else {
        socket.emit('error_message', 'Room is full');
      }
    } else {
      socket.emit('error_message', 'Room not found');
    }
  });

  // Host sends the initial game state to the new player
  socket.on('sync_state', ({ targetSocketId, stateData }) => {
    io.to(targetSocketId).emit('initial_state', stateData);
  });

  // Any player requests a dice roll
  socket.on('request_roll', (roomCode) => {
    const roll = Math.floor(Math.random() * 6) + 1;
    // Broadcast the roll to everyone in the room (including the sender)
    io.to(roomCode).emit('perform_roll', {
      playerId: socket.id,
      roll: roll
    });
  });

  // Relay generic game actions (like reverse mode toggle, restarting)
  socket.on('game_action', ({ roomCode, action, data }) => {
    socket.to(roomCode).emit('game_action', { action, data });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove from rooms
    for (const roomCode in rooms) {
      const room = rooms[roomCode];
      const index = room.players.indexOf(socket.id);
      if (index !== -1) {
        room.players.splice(index, 1);
        if (room.players.length === 0) {
          delete rooms[roomCode]; // Clean up empty rooms
        } else {
          io.to(roomCode).emit('player_left', socket.id);
          // If host left, assign new host
          if (room.host === socket.id) {
            room.host = room.players[0];
            io.to(room.host).emit('you_are_host');
          }
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Multiplayer Server running on http://localhost:${PORT}`);
});
