const express = require('express');
const { getProfile, updateProfile } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get profile
router.get('/profile', authenticateToken, getProfile);

// Update profile
router.put('/profile', authenticateToken, updateProfile);

module.exports = router;