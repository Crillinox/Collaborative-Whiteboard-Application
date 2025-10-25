// ~/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve files from home directory
const homeDir = process.env.HOME || os.homedir();
app.use(express.static(homeDir));

// Ensure index.html loads at root
app.get('/', (req, res) => {
  res.sendFile(path.join(homeDir, 'index.html'));
});

// Store all current drawing lines
let drawHistory = [];

// Handle socket connections
io.on('connection', (socket) => {
  console.log('👤 A user connected:', socket.id);

  // Send existing drawing history
  socket.emit('init', drawHistory);

  // When a user draws
  socket.on('draw', (data) => {
    drawHistory.push(data);
    socket.broadcast.emit('draw', data);
  });

  // When a user clears the board
  socket.on('clear', () => {
    drawHistory = [];
    io.emit('clear');
  });

  socket.on('disconnect', () => {
    console.log('❌ A user disconnected:', socket.id);
  });
});

const PORT = 3000;

// Listen on all interfaces (0.0.0.0)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Collaborative Paint running at:`);
  console.log(`   http://0.0.0.0:${PORT}`);
  console.log(`📁 Serving files from: ${homeDir}`);
});
