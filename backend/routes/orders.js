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

// Khách hàng hủy đơn hàng hoặc gửi yêu cầu hủy
router.put('/:id/cancel', authenticateToken, orderController.requestCancelOrder);

// Admin duyệt hủy hoặc từ chối hủy
router.put('/:id/approve-cancel', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.EMPLOYEE), orderController.approveCancelOrder);
router.put('/:id/reject-cancel', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.EMPLOYEE), orderController.rejectCancelOrder);

module.exports = router;
