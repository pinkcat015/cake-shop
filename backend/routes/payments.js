const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

router.post('/', authenticateToken, paymentController.createPayment);

module.exports = router;