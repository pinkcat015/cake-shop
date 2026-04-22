const express = require('express');
const {
    listProducts,
    getProductDetail,
    addProduct,
    editProduct,
    removeProduct
} = require('../controllers/productController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { uploadProductImage } = require('../middleware/upload');

const router = express.Router();

// Ai cung xem duoc danh sach va chi tiet san pham.
router.get('/', listProducts);
router.get('/:id', getProductDetail);

// Chi admin moi duoc them/sua/xoa san pham.
router.post(
    '/',
    authenticateToken,
    authorizeRoles('admin'),
    uploadProductImage.single('image'),
    addProduct
);

router.put(
    '/:id',
    authenticateToken,
    authorizeRoles('admin'),
    uploadProductImage.single('image'),
    editProduct
);

router.delete('/:id', authenticateToken, authorizeRoles('admin'), removeProduct);

module.exports = router;
