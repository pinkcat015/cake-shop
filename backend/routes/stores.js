const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

router.get('/', storeController.listStores);
router.get('/nearest', storeController.nearestStores);
router.get('/:id', storeController.getStoreDetail);

module.exports = router;
