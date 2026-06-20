const db = require('../config/db');

const getAllProducts = async () => {
    // Lay san pham kem danh muc va ton kho de frontend hien thi cho gon.
    const [rows] = await db.query(
        `SELECT
            p.product_id,
            p.name,
            p.price,
            p.description,
            p.ingredients,
            p.image,
            p.category_id,
            c.name AS category,
            IFNULL(i.quantity, 0) AS quantity,
            CASE
                WHEN IFNULL(i.quantity, 0) > 0 THEN 'ACTIVE'
                ELSE 'OUT_OF_STOCK'
            END AS status,
            IFNULL(r.average_rating, 0) AS average_rating,
            IFNULL(r.total_reviews, 0) AS total_reviews
        FROM Product p
        LEFT JOIN Category c ON c.category_id = p.category_id
        LEFT JOIN Inventory i ON i.product_id = p.product_id
        LEFT JOIN (
            SELECT product_id, ROUND(AVG(rating), 1) AS average_rating, COUNT(*) AS total_reviews
            FROM Review
            GROUP BY product_id
        ) r ON r.product_id = p.product_id
        ORDER BY p.product_id DESC`
    );
    return rows.map(row => ({
        ...row,
        average_rating: parseFloat(row.average_rating),
        total_reviews: parseInt(row.total_reviews, 10)
    }));
};

const getProductById = async (productId) => {
    // Lay chi tiet 1 san pham theo id.
    const [rows] = await db.query(
        `SELECT
            p.product_id,
            p.name,
            p.price,
            p.description,
            p.ingredients,
            p.image,
            p.category_id,
            c.name AS category,
            IFNULL(i.quantity, 0) AS quantity,
            CASE
                WHEN IFNULL(i.quantity, 0) > 0 THEN 'ACTIVE'
                ELSE 'OUT_OF_STOCK'
            END AS status,
            IFNULL(r.average_rating, 0) AS average_rating,
            IFNULL(r.total_reviews, 0) AS total_reviews
        FROM Product p
        LEFT JOIN Category c ON c.category_id = p.category_id
        LEFT JOIN Inventory i ON i.product_id = p.product_id
        LEFT JOIN (
            SELECT product_id, ROUND(AVG(rating), 1) AS average_rating, COUNT(*) AS total_reviews
            FROM Review
            GROUP BY product_id
        ) r ON r.product_id = p.product_id
        WHERE p.product_id = ?`,
        [productId]
    );
    if (!rows[0]) return null;
    return {
        ...rows[0],
        average_rating: parseFloat(rows[0].average_rating),
        total_reviews: parseInt(rows[0].total_reviews, 10)
    };
};

const findOrCreateCategoryId = async (categoryName) => {
    // Co danh muc roi thi lay id, chua co thi tao moi.
    const [existingRows] = await db.query('SELECT category_id FROM Category WHERE name = ?', [categoryName]);
    if (existingRows[0]) {
        return existingRows[0].category_id;
    }

    const [result] = await db.query('INSERT INTO Category (name) VALUES (?)', [categoryName]);
    return result.insertId;
};

const createProduct = async ({ name, price, description, ingredients, image, categoryId }) => {
    const [result] = await db.query(
        'INSERT INTO Product (name, price, description, ingredients, image, category_id) VALUES (?, ?, ?, ?, ?, ?)',
        [name, price, description, ingredients, image, categoryId]
    );
    return result.insertId;
};

const updateProduct = async (productId, { name, price, description, ingredients, image, categoryId }) => {
    await db.query(
        'UPDATE Product SET name = ?, price = ?, description = ?, ingredients = ?, image = ?, category_id = ? WHERE product_id = ?',
        [name, price, description, ingredients, image, categoryId, productId]
    );
};

// NutritionFact helpers
const getNutritionByProductId = async (productId) => {
    const [rows] = await db.query(
        'SELECT nutrition_id, product_id, name, value, unit, per, sort_order FROM NutritionFact WHERE product_id = ? ORDER BY sort_order, nutrition_id',
        [productId]
    );
    return rows;
};

const replaceNutritionForProduct = async (productId, items) => {
    // delete existing
    await db.query('DELETE FROM NutritionFact WHERE product_id = ?', [productId]);
    if (!items || !Array.isArray(items) || items.length === 0) return;

    const insertSql = 'INSERT INTO NutritionFact (product_id, name, value, unit, per, sort_order) VALUES ?';
    const values = items.map((it, idx) => [productId, it.name || '', it.value || '', it.unit || null, it.per || null, it.sort_order ?? idx]);
    await db.query(insertSql, [values]);
};

const createOrUpdateInventory = async (productId, quantity) => {
    // Inventory row co the da ton tai hoac chua; xu ly ca hai truong hop.
    const [rows] = await db.query('SELECT product_id FROM Inventory WHERE product_id = ? LIMIT 1', [productId]);

    if (rows.length > 0) {
        await db.query('UPDATE Inventory SET quantity = ? WHERE product_id = ?', [quantity, productId]);
        return;
    }

    await db.query('INSERT INTO Inventory (product_id, quantity) VALUES (?, ?)', [productId, quantity]);
};

const deleteProduct = async (productId) => {
    // Xoa ton kho truoc de khong bi loi khoa ngoai.
    await db.query('DELETE FROM Inventory WHERE product_id = ?', [productId]);
    await db.query('DELETE FROM Product WHERE product_id = ?', [productId]);
};

module.exports = {
    getAllProducts,
    getProductById,
    findOrCreateCategoryId,
    createProduct,
    createOrUpdateInventory,
    updateProduct,
    deleteProduct,
    getNutritionByProductId,
    replaceNutritionForProduct
};
