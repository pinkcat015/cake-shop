const db = require('../config/db');

// Map application `user_id` (User) to `customer_id` (Customer) and use Cart.customer_id
const getCustomerIdByUserId = async (userId) => {
  const [rows] = await db.query('SELECT customer_id FROM `Customer` WHERE user_id = ? LIMIT 1', [userId]);
  return rows[0] ? rows[0].customer_id : null;
};

const ensureCustomerForUser = async (userId) => {
  let customerId = await getCustomerIdByUserId(userId);
  if (customerId) return customerId;
  // try to get username to use as name
  const [urows] = await db.query('SELECT username FROM `User` WHERE user_id = ? LIMIT 1', [userId]);
  const username = urows[0] ? urows[0].username : `user_${userId}`;
  const [res] = await db.query('INSERT INTO `Customer` (user_id, name) VALUES (?, ?)', [userId, username]);
  return res.insertId;
};

const findCartByUserId = async (userId) => {
  const customerId = await ensureCustomerForUser(userId);
  if (!customerId) return null;
  const [rows] = await db.query('SELECT cart_id, customer_id FROM `Cart` WHERE customer_id = ? LIMIT 1', [customerId]);
  return rows[0] || null;
};

const createCart = async (userId) => {
  const customerId = await ensureCustomerForUser(userId);
  if (customerId) {
    const [result] = await db.query('INSERT INTO `Cart` (customer_id) VALUES (?)', [customerId]);
    return { cart_id: result.insertId, customer_id: customerId };
  }
  // Fallback (shouldn't happen since ensureCustomerForUser creates one)
  const [result] = await db.query('INSERT INTO `Cart` () VALUES ()');
  return { cart_id: result.insertId };
};

const findCartItem = async (cartId, productId) => {
  const [rows] = await db.query('SELECT * FROM `CartItem` WHERE cart_id = ? AND product_id = ? LIMIT 1', [cartId, productId]);
  return rows[0];
};

const addOrUpdateCartItem = async (cartId, productId, quantity) => {
  const existing = await findCartItem(cartId, productId);
  if (existing) {
    const newQty = existing.quantity + quantity;
    await db.query('UPDATE `CartItem` SET quantity = ? WHERE cart_id = ? AND product_id = ?', [newQty, cartId, productId]);
    return { cart_id: cartId, product_id: productId, quantity: newQty };
  }

  await db.query('INSERT INTO `CartItem` (cart_id, product_id, quantity) VALUES (?, ?, ?)', [cartId, productId, quantity]);
  return { cart_id: cartId, product_id: productId, quantity };
};

const updateCartItemQuantity = async (cartId, productId, quantity) => {
  await db.query('UPDATE `CartItem` SET quantity = ? WHERE cart_id = ? AND product_id = ?', [quantity, cartId, productId]);
};

const removeCartItem = async (cartId, productId) => {
  await db.query('DELETE FROM `CartItem` WHERE cart_id = ? AND product_id = ?', [cartId, productId]);
};

const getCartWithItems = async (cartId) => {
  const [items] = await db.query(
    `SELECT ci.cart_id, ci.product_id, ci.quantity, p.name, p.image, p.price
     FROM CartItem ci
     LEFT JOIN Product p ON p.product_id = ci.product_id
     WHERE ci.cart_id = ?`,
    [cartId]
  );

  const [cartRows] = await db.query('SELECT cart_id, customer_id FROM `Cart` WHERE cart_id = ? LIMIT 1', [cartId]);
  const cart = cartRows[0] || null;
  return { cart, items };
};

const clearCartItems = async (cartId) => {
  await db.query('DELETE FROM `CartItem` WHERE cart_id = ?', [cartId]);
};

module.exports = {
  findCartByUserId,
  createCart,
  findCartItem,
  addOrUpdateCartItem,
  updateCartItemQuantity,
  removeCartItem,
  getCartWithItems,
  clearCartItems
};
