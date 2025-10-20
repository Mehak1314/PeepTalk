const socket = io("https://peep-talk.onrender.com");
const form = document.getElementById('send');
const messageInput = document.getElementById('send_msg');
const messageContainer = document.getElementById('msgbox');
let currentUsername = ''; // Store username globally
let audio = new Audio('/sounds/notification.mp3');

const appendMessage = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('msg', position);
    messageContainer.appendChild(messageElement);
    if (position === 'left') {
        audio.play();
    }
    // Auto scroll to bottom when new message arrives
    messageContainer.scrollTop = messageContainer.scrollHeight;
};

// Get username and emit join event
const username = prompt("Enter your name to join the chat:");
if (username) {
    currentUsername = username; // Store username
    // First append the join message
    appendMessage(`You joined as ${username}`, 'center');
    // Then emit the event
    socket.emit('new_user_joined', username);
}

// Send message when form is submitted
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message !== '') {
        // Append the message locally
        appendMessage(`You: ${message}`, 'right');
        // Emit the message to server
        socket.emit('send_message', { message, username });
        // Clear input field
        messageInput.value = '';
    }
});

// Handle incoming messages
socket.on('receive_message', (data) => {
    appendMessage(`${data.username}: ${data.message}`, 'left');
});

// Handle user join/leave events
socket.on('user_joined', (username) => {
    console.log('User joined event received:', username);
    appendMessage(`${username} joined the chat`, 'center');
});

socket.on('user_left', (username) => {
    console.log('User left event received:', username);
    if (username) {
        appendMessage(`${username} left the chat`, 'center');
    }
});
