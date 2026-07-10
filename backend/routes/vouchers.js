const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles, ROLES } = require('../middleware/auth');
const voucherController = require('../controllers/voucherController');

router.get('/public', voucherController.getPublicVouchers);
router.post('/apply', authenticateToken, voucherController.applyVoucher);

// Admin CRUD routes
router.get('/', authenticateToken, authorizeRoles(ROLES.ADMIN), voucherController.getVouchers);
router.post('/', authenticateToken, authorizeRoles(ROLES.ADMIN), voucherController.addVoucher);
router.put('/:id', authenticateToken, authorizeRoles(ROLES.ADMIN), voucherController.editVoucher);
router.delete('/:id', authenticateToken, authorizeRoles(ROLES.ADMIN), voucherController.removeVoucher);

module.exports = router;