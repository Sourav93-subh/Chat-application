const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store chat rooms and messages
let rooms = {};

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room
  socket.on('join-room', (roomName) => {
    socket.join(roomName);
    if (!rooms[roomName]) {
      rooms[roomName] = []; // Initialize the room's message history
    }
    io.to(socket.id).emit('room-messages', rooms[roomName]); // Send messages of the room to the user
  });

  // Leave a room
  socket.on('leave-room', (roomName) => {
    socket.leave(roomName);
  });

  // Handle incoming messages
  socket.on('message', ({ roomName, message }) => {
    const timestamp = new Date().toLocaleTimeString();
    const msg = { sender: socket.id, message, timestamp };
    rooms[roomName].push(msg); // Store the message in the room history
    io.to(roomName).emit('room-messages', rooms[roomName]); // Broadcast message to the room
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
