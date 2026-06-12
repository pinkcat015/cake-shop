const express = require('express');
const { register, login, verifyEmail, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Verify Email
router.get('/verify-email', verifyEmail);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);

module.exports = router;