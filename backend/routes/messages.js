const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { protect } = require('../middleware/auth');

// Send message
router.post('/', protect, async (req, res) => {
    try {
        const { chatId, content, image } = req.body;

        const message = await Message.create({
            chatId,
            sender: req.user._id,
            content,
            image
        });

        // Update last message in chat
        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

        const fullMessage = await Message.findById(message._id)
            .populate('sender', '-password');

        res.status(201).json(fullMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all messages for a chat
router.get('/:chatId', protect, async (req, res) => {
    try {
        const messages = await Message.find({ chatId: req.params.chatId })
            .populate('sender', '-password')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;