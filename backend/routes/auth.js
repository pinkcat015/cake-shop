const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { username, password, email, role_name } = req.body;

    try {
        // Check if user exists
        const [existingUser] = await db.promise().query('SELECT * FROM User WHERE username = ? OR email = ?', [username, email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Get role_id
        const [role] = await db.promise().query('SELECT role_id FROM Role WHERE role_name = ?', [role_name]);
        if (role.length === 0) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.promise().query('INSERT INTO User (username, password, email, role_id) VALUES (?, ?, ?, ?)', [username, hashedPassword, email, role[0].role_id]);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [users] = await db.promise().query('SELECT u.*, r.role_name FROM User u JOIN Role r ON u.role_id = r.role_id WHERE u.username = ?', [username]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ user_id: user.user_id, role: user.role_name }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Forgot password - placeholder, need email setup
router.post('/forgot-password', (req, res) => {
    // Implement email sending logic
    res.json({ message: 'Forgot password functionality not implemented yet' });
});

// Reset password - placeholder
router.post('/reset-password', (req, res) => {
    // Implement reset logic
    res.json({ message: 'Reset password functionality not implemented yet' });
});

module.exports = router;