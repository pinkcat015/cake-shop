const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.promise().query('SELECT u.username, u.email, r.role_name FROM User u JOIN Role r ON u.role_id = r.role_id WHERE u.user_id = ?', [req.user.user_id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
    const { email } = req.body; // Add more fields as needed

    try {
        await db.promise().query('UPDATE User SET email = ? WHERE user_id = ?', [email, req.user.user_id]);
        res.json({ message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;