const express = require('express');
const {
    listProducts,
    getProductDetail,
    addProduct,
    editProduct,
    removeProduct
} = require('../controllers/productController');
const { authenticateToken, authorizeRoles, ROLES } = require('../middleware/auth');
const { uploadProductImage } = require('../middleware/upload');

const router = express.Router();

// Ai cung xem duoc danh sach va chi tiet san pham.
router.get('/', listProducts);
router.get('/:id', getProductDetail);

// Employee va admin duoc them/sua san pham.
router.post(
    '/',
    authenticateToken,
    authorizeRoles(ROLES.ADMIN, ROLES.EMPLOYEE),
    uploadProductImage.single('image'),
    addProduct
);

router.put(
    '/:id',
    authenticateToken,
    authorizeRoles(ROLES.ADMIN, ROLES.EMPLOYEE),
    uploadProductImage.single('image'),
    editProduct
);

// Chi admin moi duoc xoa san pham.
router.delete('/:id', authenticateToken, authorizeRoles(ROLES.ADMIN), removeProduct);

module.exports = router;
