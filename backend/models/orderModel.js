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

const getOrdersByUserId = async (userId) => {
  // Build a safe select based on existing columns to support schema drift
  const available = await getOrderColumns();
  const selectParts = [
    'o.order_id',
    'o.customer_id',
    'o.total_price',
    'o.status',
    'o.order_date',
    'o.delivery_method',
  ];

  if (available.includes('address')) selectParts.push('o.address');
  if (available.includes('store_id')) selectParts.push('o.store_id');

  // Add store fields only if store_id exists
  let joinStore = false;
  if (available.includes('store_id')) {
    joinStore = true;
    selectParts.push('s.name AS store_name', 's.address AS store_address');
  }

  const sql = `SELECT\n    ${selectParts.join(',\n    ')}\n  FROM \`Order\` o\n  INNER JOIN Customer c ON c.customer_id = o.customer_id${joinStore ? '\n  LEFT JOIN Store s ON s.store_id = o.store_id' : ''}\n  WHERE c.user_id = ?\n  ORDER BY o.order_date DESC, o.order_id DESC`;

  const [orders] = await db.query(sql, [userId]);

  if (!orders.length) {
    return [];
  }

  const orderIds = orders.map((order) => order.order_id);
  const [details] = await db.query(
    `SELECT
      od.order_id,
      od.product_id,
      od.quantity,
      od.price,
      p.name,
      p.image
    FROM OrderDetail od
    LEFT JOIN Product p ON p.product_id = od.product_id
    WHERE od.order_id IN (?)
    ORDER BY od.order_detail_id ASC`,
    [orderIds]
  );

  const detailMap = details.reduce((accumulator, item) => {
    if (!accumulator[item.order_id]) {
      accumulator[item.order_id] = [];
    }
    accumulator[item.order_id].push(item);
    return accumulator;
  }, {});

  return orders.map((order) => ({
    ...order,
    items: detailMap[order.order_id] || [],
  }));
};

module.exports = {
  createOrder,
  addOrderDetails,
  updateOrderStatus,
  getOrderById,
  getOrdersByUserId
};
