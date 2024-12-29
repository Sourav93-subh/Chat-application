const socket = io();

// DOM Elements
const roomList = document.getElementById('room-list');
const messages = document.getElementById('messages');
const newRoomInput = document.getElementById('new-room');
const createRoomButton = document.getElementById('create-room');
const joinRoomInput = document.getElementById('join-room-name');
const joinRoomButton = document.getElementById('join-room');
const messageInput = document.getElementById('message-input');
const sendMessageButton = document.getElementById('send-message');

let currentRoom = null;

// Add a new room to the list
function addRoomToList(roomName) {
  const roomItem = document.createElement('li');
  roomItem.innerHTML = `<i class="fas fa-comments"></i> ${roomName}`;
  roomItem.addEventListener('click', () => joinRoom(roomName)); // Add click event to join room
  roomList.appendChild(roomItem);
}

// Join a room
function joinRoom(roomName) {
  if (currentRoom) {
    socket.emit('leave-room', currentRoom);
  }
  currentRoom = roomName;
  socket.emit('join-room', roomName);
  messages.innerHTML = ''; // Clear messages for the new room
  console.log(`Joined room: ${roomName}`);
}

// Add a message to the chat display
function addMessageToChat(sender, message, timestamp) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  messageDiv.innerHTML = `
    <div class="sender"><i class="fas fa-user"></i> ${sender}</div>
    <p>${message}</p>
    <div class="timestamp"><i class="fas fa-clock"></i> ${timestamp}</div>
  `;
  messages.appendChild(messageDiv);
  messages.scrollTop = messages.scrollHeight; // Auto-scroll to the latest message
}

// Create a new room
createRoomButton.addEventListener('click', () => {
  const roomName = newRoomInput.value.trim();
  if (roomName) {
    addRoomToList(roomName);
    joinRoom(roomName); // Automatically join after creating the room
    newRoomInput.value = ''; // Clear input
  }
});

// Join a room manually by entering room name and clicking the button
joinRoomButton.addEventListener('click', () => {
  const roomName = joinRoomInput.value.trim();
  if (roomName && roomName !== currentRoom) {
    joinRoom(roomName);
    joinRoomInput.value = ''; // Clear input
  }
});

// Send a message
sendMessageButton.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if (message && currentRoom) {
    const timestamp = new Date().toLocaleTimeString();
    socket.emit('message', { roomName: currentRoom, message });
    addMessageToChat('You', message, timestamp); // Display the message on the sender's side
    messageInput.value = ''; // Clear input
  }
});

// Listen for messages and display them
socket.on('room-messages', (messages) => {
  messages.forEach((msg) => {
    addMessageToChat(msg.sender, msg.message, msg.timestamp);
  });
});


