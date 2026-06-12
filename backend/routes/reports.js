const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles, ROLES } = require('../middleware/auth');
const { getReportStats, getRevenueReport, getTopProductsReport } = require('../controllers/reportController');

router.get('/stats', authenticateToken, authorizeRoles(ROLES.ADMIN), getReportStats);
router.get('/revenue', authenticateToken, authorizeRoles(ROLES.ADMIN), getRevenueReport);
router.get('/top-products', authenticateToken, authorizeRoles(ROLES.ADMIN), getTopProductsReport);

module.exports = router;
