let express = require('express');
let app = express();
const port=3000;

let http = require('http').Server(app);
let io = require('socket.io')(http);

const path=require('path');
const mainfile=path.join(__dirname, '../');
app.use(express.static(mainfile));

app.get('/', (req, res)=>{
    res.sendFile(mainfile + '/index.html');
});

const activerUsers = {};

io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle new user joining
    socket.on('new_user_joined', (username) => {
        console.log('User joined:', username);
        activerUsers[socket.id] = username;
        socket.broadcast.emit('user_joined', username);
    });

    socket.on('disconnect', () => {
        const username = activerUsers[socket.id];
        if (username) {
            console.log('A user disconnected:', username);
            // Emit to all clients, including the one disconnecting
            io.emit('user_left', username);
            delete activerUsers[socket.id];
        }
    });
    // Handle incoming messages
    socket.on('send_message', (data) => {
        console.log('Message received:', data); 
        socket.broadcast.emit('receive_message', data);
    });

});
http.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});