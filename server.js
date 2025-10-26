// ~/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from home directory
const homeDir = process.env.HOME || os.homedir();
app.use(express.static(homeDir));

// Ensure index.html loads at root
app.get('/', (req, res) => {
  res.sendFile(path.join(homeDir, 'index.html'));
});

// Rooms: { roomCode: { history: [], users: { socketId: {nickname, canDraw} }, host: socketId } }
const rooms = {};

io.on('connection', (socket) => {
  console.log('👤 A user connected:', socket.id);
  let currentRoom = null;

  socket.on('joinRoom', ({ roomCode, nickname }) => {
    roomCode = roomCode.toUpperCase();
    currentRoom = roomCode;

    if (!rooms[roomCode]) {
      rooms[roomCode] = { history: [], users: {}, host: socket.id };
    }

    rooms[roomCode].users[socket.id] = { nickname: nickname || 'Anon', canDraw: true };
    socket.join(roomCode);

    // Send room history
    socket.emit('init', rooms[roomCode].history);

    // Send updated user list with host info
    io.to(roomCode).emit('userList', { users: rooms[roomCode].users, host: rooms[roomCode].host });
  });

  // ===== Drawing events =====
  socket.on('draw', (data) => {
    if (!currentRoom) return;
    const user = rooms[currentRoom].users[socket.id];
    if (!user || !user.canDraw) return; // enforce Painter permission
    rooms[currentRoom].history.push(data);
    socket.to(currentRoom).emit('draw', data);
  });

  socket.on('fill', (data) => {
    if (!currentRoom) return;
    const user = rooms[currentRoom].users[socket.id];
    if (!user || !user.canDraw) return;
    rooms[currentRoom].history.push({ ...data, tool: 'fill' });
    socket.to(currentRoom).emit('fill', data);
  });

  socket.on('clear', () => {
    if (!currentRoom) return;
    const user = rooms[currentRoom].users[socket.id];
    if (!user || !user.canDraw) return;
    rooms[currentRoom].history = [];
    io.to(currentRoom).emit('clear');
  });

  // ===== Host-only: change permissions =====
  socket.on('setPermission', ({ socketId, canDraw }) => {
    if (!currentRoom) return;
    if (rooms[currentRoom].host !== socket.id) return; // only host
    if (rooms[currentRoom].users[socketId]) {
      rooms[currentRoom].users[socketId].canDraw = canDraw;
      io.to(currentRoom).emit('userList', { users: rooms[currentRoom].users, host: rooms[currentRoom].host });
    }
  });

  // ===== Host-only: kick user =====
  socket.on('kickUser', (socketId) => {
    if (!currentRoom) return;
    if (rooms[currentRoom].host !== socket.id) return;
    if (rooms[currentRoom].users[socketId]) {
      io.to(socketId).emit('kicked');
      io.sockets.sockets.get(socketId)?.leave(currentRoom);
      delete rooms[currentRoom].users[socketId];
      io.to(currentRoom).emit('userList', { users: rooms[currentRoom].users, host: rooms[currentRoom].host });
    }
  });

  // ===== Disconnect =====
  socket.on('disconnect', () => {
    if (currentRoom && rooms[currentRoom].users[socket.id]) {
      delete rooms[currentRoom].users[socket.id];

      // If host left, assign new host
      if (rooms[currentRoom].host === socket.id) {
        const userIds = Object.keys(rooms[currentRoom].users);
        rooms[currentRoom].host = userIds.length ? userIds[0] : null;
      }

      io.to(currentRoom).emit('userList', { users: rooms[currentRoom].users, host: rooms[currentRoom].host });

      // Delete room if empty
      if (!Object.keys(rooms[currentRoom].users).length) {
        delete rooms[currentRoom];
      }
    }
    console.log('❌ A user disconnected:', socket.id);
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Collaborative Paint running at http://0.0.0.0:${PORT}`);
  console.log(`📁 Serving files from: ${homeDir}`);
});
