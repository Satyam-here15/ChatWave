const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/chats', require('./routes/chats'));

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'ChatWave API is running!' });
});

// Socket.io
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
        onlineUsers.set(userId, socket.id);
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });

    socket.on('sendMessage', (message) => {
        const receiverSocket = onlineUsers.get(message.receiverId);
        if (receiverSocket) {
            io.to(receiverSocket).emit('receiveMessage', message);
        }
    });

    socket.on('disconnect', () => {
        onlineUsers.forEach((value, key) => {
            if (value === socket.id) onlineUsers.delete(key);
        });
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
        console.log('User disconnected:', socket.id);
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connected!');
        server.listen(process.env.PORT || 5000, () => {
            console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
        });
    })
    .catch((err) => console.log('MongoDB error:', err));