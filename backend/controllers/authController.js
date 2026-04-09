const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByUsername, findUserByEmail, createUser, getRoleByName } = require('../models/userModel');

const register = async (req, res) => {
    const { username, password, email, role_name } = req.body;

    try {
        // Check if user exists
        const existingUser = await findUserByUsername(username) || await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Get role_id
        const role = await getRoleByName(role_name);
        if (!role) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        await createUser(username, hashedPassword, email, role.role_id);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await findUserByUsername(username);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ user_id: user.user_id, role: user.role_name }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const forgotPassword = (req, res) => {
    // Placeholder
    res.json({ message: 'Forgot password functionality not implemented yet' });
};

const resetPassword = (req, res) => {
    // Placeholder
    res.json({ message: 'Reset password functionality not implemented yet' });
};

module.exports = { register, login, forgotPassword, resetPassword };