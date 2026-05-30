const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Search users
router.get('/search', protect, async (req, res) => {
    try {
        const keyword = req.query.q;
        const users = await User.find({
            $or: [
                { username: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } }
            ],
            _id: { $ne: req.user._id }
        }).select('-password');

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user profile
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
    try {
        const { username, bio, avatar } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { username, bio, avatar },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;