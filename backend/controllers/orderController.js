const cartModel = require('../models/cartModel');
const orderModel = require('../models/orderModel');

const createOrderFromCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const {
      address = null,
      delivery_method = null,
      store_id = null,
      delivery_latitude = null,
      delivery_longitude = null,
    } = req.body || {};
    const cart = await cartModel.findCartByUserId(userId);
    if (!cart) return res.status(400).json({ message: 'Cart is empty' });

    const full = await cartModel.getCartWithItems(cart.cart_id);
    const items = full.items;
    if (!items || items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const total = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0);
    const customerId = cart.customer_id;

    const order = await orderModel.createOrder(customerId, total, 'PENDING', {
      user_id: userId,
      address,
      delivery_method,
      store_id,
      delivery_latitude,
      delivery_longitude,
    });
    await orderModel.addOrderDetails(order.order_id, items);
    await cartModel.clearCartItems(cart.cart_id);

    const created = await orderModel.getOrderById(order.order_id);
    res.status(201).json({ order: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'status is required' });
    await orderModel.updateOrderStatus(id, status);
    const updated = await orderModel.getOrderById(id);
    res.json({ order: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { createOrderFromCart, updateOrderStatus };
