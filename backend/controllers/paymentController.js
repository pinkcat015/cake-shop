const db = require('../config/db');
const orderModel = require('../models/orderModel');
const paymentModel = require('../models/paymentModel');

const normalizeMethod = (method) => {
  const value = String(method || '').trim().toLowerCase();
  if (['cash', 'bank_transfer', 'online'].includes(value)) return value;
  return null;
};

const getPaymentStatus = (method) => {
  if (method === 'bank_transfer') return 'PENDING';
  return 'PAID';
};

const createPayment = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const orderId = Number(req.body?.order_id);
    const method = normalizeMethod(req.body?.method);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({ message: 'order_id is required' });
    }

    if (!method) {
      return res.status(400).json({ message: 'method must be cash, bank_transfer, or online' });
    }

    const [orders] = await db.query(
      `SELECT o.*
       FROM \`Order\` o
       INNER JOIN Customer c ON c.customer_id = o.customer_id
       WHERE o.order_id = ? AND c.user_id = ? LIMIT 1`,
      [orderId, userId]
    );

    const order = orders[0];
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const amount = Number(req.body?.amount);
    const expectedAmount = Number(order.total_price || order.total_amount || 0);
    if (Number.isFinite(amount) && Math.abs(amount - expectedAmount) > 0.01) {
      return res.status(400).json({ message: 'Payment amount does not match order total' });
    }

    const paymentStatus = getPaymentStatus(method);
    const payment = await paymentModel.upsertPayment({ orderId, method, status: paymentStatus });

    if (paymentStatus === 'PAID') {
      await orderModel.updateOrderStatus(orderId, 'CONFIRMED');
    }

    const updatedOrder = await orderModel.getOrderById(orderId);
    const updatedPayment = await paymentModel.getPaymentByOrderId(orderId);

    res.status(201).json({
      message: paymentStatus === 'PAID' ? 'Payment completed' : 'Bank transfer pending',
      payment: updatedPayment || payment,
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { createPayment };