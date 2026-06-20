const db = require('../config/db');

const maskUsername = (username) => {
  if (!username) return 'Ẩn danh';
  if (username.length <= 2) return username[0] + '*';
  return username[0] + '*'.repeat(Math.min(username.length - 2, 4)) + username[username.length - 1];
};

const createReview = async ({ userId, productId, orderId, rating, comment }) => {
  const [result] = await db.query(
    'INSERT INTO Review (user_id, product_id, order_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
    [userId, productId, orderId, rating, comment]
  );
  return result.insertId;
};

const getReviewsByProductId = async (productId) => {
  const [rows] = await db.query(
    `SELECT r.review_id, r.user_id, r.product_id, r.order_id, r.rating, r.comment, r.created_at, u.username
     FROM Review r
     INNER JOIN User u ON u.user_id = r.user_id
     WHERE r.product_id = ?
     ORDER BY r.created_at DESC`,
    [productId]
  );
  
  return rows.map(r => ({
    ...r,
    username: maskUsername(r.username)
  }));
};

const getProductRatingStats = async (productId) => {
  const [rows] = await db.query(
    `SELECT IFNULL(AVG(rating), 0) AS average_rating, COUNT(*) AS total_reviews
     FROM Review
     WHERE product_id = ?`,
    [productId]
  );
  return {
    average_rating: parseFloat(Number(rows[0].average_rating).toFixed(1)),
    total_reviews: rows[0].total_reviews
  };
};

const hasUserPurchasedProduct = async (userId, productId, orderId) => {
  const [rows] = await db.query(
    `SELECT 1 FROM \`Order\` o
     INNER JOIN Customer c ON c.customer_id = o.customer_id
     INNER JOIN OrderDetail od ON od.order_id = o.order_id
     WHERE c.user_id = ?
       AND od.product_id = ?
       AND o.order_id = ?
       AND o.status = 'DELIVERED'
     LIMIT 1`,
    [userId, productId, orderId]
  );
  return rows.length > 0;
};

const getReviewsForUser = async (userId) => {
  const [rows] = await db.query(
    `SELECT review_id, product_id, order_id, rating, comment, created_at
     FROM Review
     WHERE user_id = ?`,
    [userId]
  );
  return rows;
};

module.exports = {
  createReview,
  getReviewsByProductId,
  getProductRatingStats,
  hasUserPurchasedProduct,
  getReviewsForUser
};
