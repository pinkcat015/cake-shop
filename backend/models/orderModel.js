const db = require('../config/db');

const getOrderColumns = async () => {
  const [rows] = await db.query('SHOW COLUMNS FROM `Order`');
  return rows.map((row) => row.Field);
};

const createOrder = async (customerId, totalPrice, status = 'PENDING', extras = {}) => {
  const columns = await getOrderColumns();
  const insertColumns = [];
  const valuePlaceholders = [];
  const values = [];

  const addColumn = (columnName, value) => {
    if (columns.includes(columnName) && value !== undefined) {
      insertColumns.push(columnName);
      valuePlaceholders.push('?');
      values.push(value);
    }
  };

  const addNowColumn = (columnName) => {
    if (columns.includes(columnName)) {
      insertColumns.push(columnName);
      valuePlaceholders.push('NOW()');
    }
  };

  addColumn('customer_id', customerId);
  addColumn('user_id', extras.user_id);
  addColumn('total_price', totalPrice);
  addColumn('total_amount', totalPrice);
  addColumn('status', status);
  addColumn('store_id', extras.store_id);
  addColumn('delivery_latitude', extras.delivery_latitude);
  addColumn('delivery_longitude', extras.delivery_longitude);
  addColumn('delivery_method', extras.delivery_method);
  addColumn('address', extras.address);
  addColumn('voucher_id', extras.voucher_id);
  addNowColumn('order_date');
  addNowColumn('created_at');

  if (insertColumns.length === 0) {
    throw new Error('Order table has no writable columns');
  }

  const sql = `INSERT INTO \`Order\` (${insertColumns.map((column) => `\`${column}\``).join(', ')}) VALUES (${valuePlaceholders.join(', ')})`;
  const [result] = await db.query(sql, values);
  return { order_id: result.insertId };
};

const addOrderDetails = async (orderId, items) => {
  if (!items || items.length === 0) return;
  const values = items.map(it => [orderId, it.product_id, it.quantity, it.price]);
  await db.query('INSERT INTO `OrderDetail` (order_id, product_id, quantity, price) VALUES ?', [values]);
};

const updateOrderStatus = async (orderId, status) => {
  await db.query('UPDATE `Order` SET status = ? WHERE order_id = ?', [status, orderId]);
};

const getOrderById = async (orderId) => {
  const [rows] = await db.query('SELECT * FROM `Order` WHERE order_id = ? LIMIT 1', [orderId]);
  return rows[0];
};

module.exports = {
  createOrder,
  addOrderDetails,
  updateOrderStatus,
  getOrderById
};
