const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles, ROLES } = require('../middleware/auth');
const promotionController = require('../controllers/promotionController');

// Public routes to view active promotions
router.get('/', promotionController.listPromotions);
router.get('/:id', promotionController.getPromotion);

// Admin-only CRUD operations
router.post('/', authenticateToken, authorizeRoles(ROLES.ADMIN), promotionController.addPromotion);
router.put('/:id', authenticateToken, authorizeRoles(ROLES.ADMIN), promotionController.editPromotion);
router.delete('/:id', authenticateToken, authorizeRoles(ROLES.ADMIN), promotionController.removePromotion);

module.exports = router;
