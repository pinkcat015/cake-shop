const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

router.post('/', authenticateToken, reviewController.addReview);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/user', authenticateToken, reviewController.getUserReviews);

module.exports = router;
