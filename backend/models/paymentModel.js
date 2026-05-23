const db = require('../config/db');

const getPaymentByOrderId = async (orderId) => {
  const [rows] = await db.query('SELECT * FROM `Payment` WHERE order_id = ? LIMIT 1', [orderId]);
  return rows[0] || null;
};

const upsertPayment = async ({ orderId, method, status }) => {
  const existing = await getPaymentByOrderId(orderId);

  if (existing) {
    await db.query(
      'UPDATE `Payment` SET method = ?, status = ?, paid_at = ? WHERE payment_id = ?',
      [method, status, status === 'PAID' ? new Date() : null, existing.payment_id]
    );
    return { payment_id: existing.payment_id, order_id: orderId, method, status };
  }

  const [result] = await db.query(
    'INSERT INTO `Payment` (order_id, method, status, paid_at) VALUES (?, ?, ?, ?)',
    [orderId, method, status, status === 'PAID' ? new Date() : null]
  );

  return { payment_id: result.insertId, order_id: orderId, method, status };
};

module.exports = {
  getPaymentByOrderId,
  upsertPayment,
};