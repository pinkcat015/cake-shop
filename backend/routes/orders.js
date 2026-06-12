const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles, ROLES } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// Tạo order từ giỏ hàng
router.post('/', authenticateToken, orderController.createOrderFromCart);

// Xem lịch sử đơn hàng của user hiện tại
router.get('/mine', authenticateToken, orderController.getMyOrders);

// Lấy toàn bộ đơn hàng (admin & employee)
router.get('/', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.EMPLOYEE), orderController.getAllOrders);

// Cập nhật trạng thái (admin & employee)
router.put('/:id/status', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.EMPLOYEE), orderController.updateOrderStatus);

module.exports = router;
