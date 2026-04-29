const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles, ROLES } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// Tạo order từ giỏ hàng
router.post('/', authenticateToken, orderController.createOrderFromCart);

// Cập nhật trạng thái (admin)
router.put('/:id/status', authenticateToken, authorizeRoles(ROLES.ADMIN), orderController.updateOrderStatus);

module.exports = router;
