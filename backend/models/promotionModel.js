const db = require('../config/db');

const getAllPromotions = async () => {
  const [promotions] = await db.query(
    'SELECT promotion_id, name, discount, start_date, end_date, start_time, end_time FROM Promotion ORDER BY promotion_id DESC'
  );

  // Fetch product IDs for all promotions in one go or sequentially
  for (const promo of promotions) {
    const [rows] = await db.query(
      'SELECT product_id FROM ProductPromotion WHERE promotion_id = ?',
      [promo.promotion_id]
    );
    promo.product_ids = rows.map(r => r.product_id);
  }

  return promotions;
};

const getPromotionById = async (id) => {
  const [rows] = await db.query(
    'SELECT promotion_id, name, discount, start_date, end_date, start_time, end_time FROM Promotion WHERE promotion_id = ? LIMIT 1',
    [id]
  );
  if (!rows[0]) return null;

  const promo = rows[0];
  const [prodRows] = await db.query(
    'SELECT product_id FROM ProductPromotion WHERE promotion_id = ?',
    [id]
  );
  promo.product_ids = prodRows.map(r => r.product_id);
  return promo;
};

const createPromotion = async ({ name, discount, start_date, end_date, start_time, end_time, product_ids = [] }) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      'INSERT INTO Promotion (name, discount, start_date, end_date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)',
      [name, discount, start_date || null, end_date || null, start_time || null, end_time || null]
    );
    const promotionId = result.insertId;

    if (product_ids.length > 0) {
      const values = product_ids.map(productId => [productId, promotionId]);
      await connection.query(
        'INSERT INTO ProductPromotion (product_id, promotion_id) VALUES ?',
        [values]
      );
    }

    await connection.commit();
    return promotionId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const updatePromotion = async (id, { name, discount, start_date, end_date, start_time, end_time, product_ids = [] }) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      'UPDATE Promotion SET name = ?, discount = ?, start_date = ?, end_date = ?, start_time = ?, end_time = ? WHERE promotion_id = ?',
      [name, discount, start_date || null, end_date || null, start_time || null, end_time || null, id]
    );

    // Delete old mappings
    await connection.query(
      'DELETE FROM ProductPromotion WHERE promotion_id = ?',
      [id]
    );

    // Insert new mappings
    if (product_ids.length > 0) {
      const values = product_ids.map(productId => [productId, id]);
      await connection.query(
        'INSERT INTO ProductPromotion (product_id, promotion_id) VALUES ?',
        [values]
      );
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const deletePromotion = async (id) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      'DELETE FROM ProductPromotion WHERE promotion_id = ?',
      [id]
    );

    await connection.query(
      'DELETE FROM Promotion WHERE promotion_id = ?',
      [id]
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion
};
