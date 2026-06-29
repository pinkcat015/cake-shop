const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles, ROLES } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

router.post('/', authenticateToken, paymentController.createPayment);
// Admin/Employee only — confirms actual bank transfer receipt
router.post('/confirm', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.EMPLOYEE), paymentController.confirmPayment);
// Customer sandbox — simulates OTP-confirmed payment in demo mode
router.post('/simulate-confirm', authenticateToken, paymentController.customerSimulateConfirmPayment);

module.exports = router;
