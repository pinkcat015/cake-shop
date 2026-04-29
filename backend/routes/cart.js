const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const cartController = require('../controllers/cartController');

// Thêm vào giỏ
router.post('/add', authenticateToken, cartController.addToCart);

// Xem giỏ
router.get('/', authenticateToken, cartController.getCart);

// Cập nhật số lượng
router.put('/update', authenticateToken, cartController.updateCart);

// Xóa khỏi giỏ
router.delete('/remove', authenticateToken, cartController.removeFromCart);

module.exports = router;
