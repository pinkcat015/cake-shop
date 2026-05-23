const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const voucherController = require('../controllers/voucherController');

router.post('/apply', authenticateToken, voucherController.applyVoucher);

module.exports = router;