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

    // Only allow payment on PENDING orders
    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: 'Đơn hàng này không ở trạng thái chờ thanh toán' });
    }

    // Amount validation — must always be provided and match
    const amount = Number(req.body?.amount);
    if (!req.body?.amount || !Number.isFinite(amount)) {
      return res.status(400).json({ message: 'amount là bắt buộc' });
    }
    const expectedAmount = Number(order.total_price || order.total_amount || 0);
    if (Math.abs(amount - expectedAmount) > 0.01) {
      return res.status(400).json({ message: 'Số tiền thanh toán không khớp với tổng đơn hàng' });
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

// Called by Admin/Employee to confirm a bank transfer receipt
const confirmPayment = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const orderId = Number(req.body?.order_id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({ message: 'order_id is required' });
    }

    // Admin confirms for any order — no user_id filter
    const [orders] = await db.query(
      'SELECT o.* FROM `Order` o WHERE o.order_id = ? LIMIT 1',
      [orderId]
    );

    const order = orders[0];
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Must have an existing payment record
    const existingPayment = await paymentModel.getPaymentByOrderId(orderId);
    if (!existingPayment) {
      return res.status(400).json({ message: 'Không tìm thấy bản ghi thanh toán cho đơn hàng này' });
    }

    // Wrap in transaction
    await connection.beginTransaction();
    await connection.query(
      'UPDATE `Payment` SET status = ?, paid_at = NOW() WHERE payment_id = ?',
      ['PAID', existingPayment.payment_id]
    );
    await connection.query(
      'UPDATE `Order` SET status = ? WHERE order_id = ?',
      ['CONFIRMED', orderId]
    );
    await connection.commit();

    const updatedOrder = await orderModel.getOrderById(orderId);
    const updatedPayment = await paymentModel.getPaymentByOrderId(orderId);

    res.status(200).json({
      message: 'Payment confirmed successfully',
      payment: updatedPayment,
      order: updatedOrder,
    });
  } catch (error) {
    try { await connection.rollback(); } catch (_) {}
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

// Called by customer after simulated OTP in PaymentGateway (sandbox demo flow)
const customerSimulateConfirmPayment = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const userId = req.user.user_id;
    const orderId = Number(req.body?.order_id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({ message: 'order_id is required' });
    }

    // Verify order belongs to this customer
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

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: 'Đơn hàng này không thể được xác nhận thanh toán' });
    }

    const existingPayment = await paymentModel.getPaymentByOrderId(orderId);
    if (!existingPayment) {
      return res.status(400).json({ message: 'Không tìm thấy bản ghi thanh toán cho đơn hàng này' });
    }

    await connection.beginTransaction();
    await connection.query(
      'UPDATE `Payment` SET status = ?, paid_at = NOW() WHERE payment_id = ?',
      ['PAID', existingPayment.payment_id]
    );
    await connection.query(
      'UPDATE `Order` SET status = ? WHERE order_id = ?',
      ['CONFIRMED', orderId]
    );
    await connection.commit();

    const updatedOrder = await orderModel.getOrderById(orderId);
    const updatedPayment = await paymentModel.getPaymentByOrderId(orderId);

    res.status(200).json({
      message: 'Payment confirmed successfully',
      payment: updatedPayment,
      order: updatedOrder,
    });
  } catch (error) {
    try { await connection.rollback(); } catch (_) {}
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

module.exports = { createPayment, confirmPayment, customerSimulateConfirmPayment };