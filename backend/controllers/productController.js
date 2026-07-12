const {
    getAllProducts,
    getProductById,
    findOrCreateCategoryId,
    createProduct,
    createOrUpdateInventory,
    updateProduct,
    deleteProduct,
    getNutritionByProductId,
    replaceNutritionForProduct
} = require('../models/productModel');

const parsePrice = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const parseQuantity = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
};

const resolveQuantityInput = (body) => {
    if (body.quantity !== undefined) return body.quantity;
    if (body.stock !== undefined) return body.stock;
    if (body.stock_quantity !== undefined) return body.stock_quantity;
    return undefined;
};

const resolveImageUrl = (req) => {
    // Neu co file upload thi uu tien file do.
    if (req.file) {
        return `/uploads/products/${req.file.filename}`;
    }
    return req.body.image || null;
};

const resolveCategoryId = async (body, currentCategoryId = null) => {
    // Ho tro gui category_id hoac category (ten danh muc).
    if (body.category_id !== undefined) {
        const categoryId = Number(body.category_id);
        return Number.isInteger(categoryId) && categoryId > 0 ? categoryId : null;
    }

    if (body.category) {
        return findOrCreateCategoryId(body.category);
    }

    return currentCategoryId;
};

const listProducts = async (req, res) => {
    try {
        const products = await getAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getProductDetail = async (req, res) => {
    try {
        const product = await getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const nutritionFacts = await getNutritionByProductId(product.product_id);
        product.nutritionFacts = nutritionFacts || [];

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const addProduct = async (req, res) => {
    const { name, description, ingredients } = req.body;
    const price = parsePrice(req.body.price);
    const quantityRaw = resolveQuantityInput(req.body);
    const quantity = parseQuantity(quantityRaw);
    const image = resolveImageUrl(req);

    let nutritionArray = undefined;
    if (req.body.nutrition !== undefined) {
        try {
            nutritionArray = typeof req.body.nutrition === 'string' ? JSON.parse(req.body.nutrition) : req.body.nutrition;
        } catch (_e) {
            nutritionArray = [];
        }
    }

    if (!name || price === null) {
        return res.status(400).json({ message: 'name and valid price are required' });
    }

    if (quantity === null && quantityRaw !== undefined) {
        return res.status(400).json({ message: 'quantity must be a non-negative integer' });
    }

    try {
        const categoryId = await resolveCategoryId(req.body, null);

        // Tao san pham moi.
        const productId = await createProduct({
            name,
            price,
            description: description || null,
            ingredients: ingredients || null,
            image,
            categoryId
        });

        if (nutritionArray !== undefined) {
            await replaceNutritionForProduct(productId, nutritionArray);
        }

        if (quantity !== null) {
            await createOrUpdateInventory(productId, quantity);
        }

        const product = await getProductById(productId);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const editProduct = async (req, res) => {
    try {
        const currentProduct = await getProductById(req.params.id);
        if (!currentProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update tung phan: field nao khong gui len thi giu gia tri cu.
        const nextPrice = req.body.price === undefined
            ? currentProduct.price
            : parsePrice(req.body.price);

        if (nextPrice === null) {
            return res.status(400).json({ message: 'price must be a non-negative number' });
        }

        const quantityRaw = resolveQuantityInput(req.body);
        const nextQuantity = quantityRaw === undefined
            ? currentProduct.quantity
            : parseQuantity(quantityRaw);

        if (nextQuantity === null) {
            return res.status(400).json({ message: 'quantity must be a non-negative integer' });
        }

        const image = req.file
            ? resolveImageUrl(req)
            : (req.body.image !== undefined ? req.body.image : currentProduct.image);

        const categoryId = await resolveCategoryId(req.body, currentProduct.category_id);
        if (req.body.category_id !== undefined && categoryId === null) {
            return res.status(400).json({ message: 'category_id must be a positive integer' });
        }

        await updateProduct(req.params.id, {
            name: req.body.name !== undefined ? req.body.name : currentProduct.name,
            price: nextPrice,
            description: req.body.description !== undefined ? req.body.description : currentProduct.description,
            ingredients: req.body.ingredients !== undefined ? req.body.ingredients : currentProduct.ingredients,
            image,
            categoryId
        });

        if (req.body.nutrition !== undefined) {
            let nutritionArray = [];
            try {
                nutritionArray = typeof req.body.nutrition === 'string' ? JSON.parse(req.body.nutrition) : req.body.nutrition;
            } catch (_e) {
                nutritionArray = [];
            }
            await replaceNutritionForProduct(req.params.id, nutritionArray);
        }

        await createOrUpdateInventory(req.params.id, nextQuantity);

        const updatedProduct = await getProductById(req.params.id);
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const removeProduct = async (req, res) => {
    try {
        const product = await getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await deleteProduct(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || (error.message && error.message.includes('foreign key constraint fails'))) {
            return res.status(400).json({ 
                message: 'Sản phẩm này đã phát sinh đơn hàng trong hệ thống. Để bảo toàn lịch sử giao dịch và doanh thu, bạn không thể xóa sản phẩm này. Hãy chỉnh sửa số lượng tồn kho về 0 hoặc gỡ sản phẩm khỏi danh sách bán.' 
            });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    listProducts,
    getProductDetail,
    addProduct,
    editProduct,
    removeProduct
};
