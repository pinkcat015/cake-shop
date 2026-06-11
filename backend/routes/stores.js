const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// Public routes
router.get('/',        storeController.listStores);
router.get('/nearest', storeController.nearestStores);

// Admin routes (tạm bỏ auth để test)
router.get(   '/admin',     storeController.adminListStores);
router.post(  '/admin',     storeController.adminCreateStore);
router.put(   '/admin/:id', storeController.adminUpdateStore);
router.delete('/admin/:id', storeController.adminDeleteStore);

// Route động — cuối cùng
router.get('/:id', storeController.getStoreDetail);

module.exports = router;