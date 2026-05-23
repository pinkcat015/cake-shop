const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles, ROLES } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// Tạo order từ giỏ hàng
router.post('/', authenticateToken, orderController.createOrderFromCart);

// Xem lịch sử đơn hàng của user hiện tại
router.get('/mine', authenticateToken, orderController.getMyOrders);

// Cập nhật trạng thái (admin)
router.put('/:id/status', authenticateToken, authorizeRoles(ROLES.ADMIN), orderController.updateOrderStatus);

module.exports = router;
