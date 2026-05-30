const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { protect } = require('../middleware/auth');

// Create or get one-to-one chat
router.post('/', protect, async (req, res) => {
    try {
        const { userId } = req.body;

        let chat = await Chat.findOne({
            isGroup: false,
            participants: { $all: [req.user._id, userId] }
        }).populate('participants', '-password')
          .populate('lastMessage');

        if (chat) return res.json(chat);

        chat = await Chat.create({
            participants: [req.user._id, userId],
            isGroup: false
        });

        chat = await Chat.findById(chat._id)
            .populate('participants', '-password');

        res.status(201).json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all chats for logged in user
router.get('/', protect, async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: { $in: [req.user._id] }
        })
        .populate('participants', '-password')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });

        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create group chat
router.post('/group', protect, async (req, res) => {
    try {
        const { name, participants } = req.body;

        const chat = await Chat.create({
            groupName: name,
            participants: [...participants, req.user._id],
            isGroup: true,
            admin: req.user._id
        });

        const fullChat = await Chat.findById(chat._id)
            .populate('participants', '-password');

        res.status(201).json(fullChat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

