const cartModel = require('../models/cartModel');
const orderModel = require('../models/orderModel');
const db = require('../config/db');
const { calculateCartPricing, getVoucherByCode } = require('../models/voucherModel');

const createOrderFromCart = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const userId = req.user.user_id;
    const {
      address = null,
      delivery_method = null,
      store_id = null,
      delivery_latitude = null,
      delivery_longitude = null,
      voucher_code = null,
    } = req.body || {};
    const cart = await cartModel.findCartByUserId(userId);
    if (!cart) return res.status(400).json({ message: 'Cart is empty' });

    const full = await cartModel.getCartWithItems(cart.cart_id);
    const items = full.items;
    if (!items || items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    await connection.beginTransaction();

    for (const item of items) {
      const [inventoryRows] = await connection.query(
        'SELECT quantity FROM Inventory WHERE product_id = ? LIMIT 1 FOR UPDATE',
        [item.product_id]
      );
      const stockQty = Number(inventoryRows[0]?.quantity ?? 0);
      const requestedQty = Number(item.quantity || 0);

      if (requestedQty <= 0) {
        throw new Error('INVALID_CART_ITEM');
      }

      if (requestedQty > stockQty) {
        const error = new Error('OUT_OF_STOCK');
        error.details = { productName: item.name, available: stockQty, requested: requestedQty };
        throw error;
      }
    }

    const pricing = await calculateCartPricing(items, voucher_code);
    const customerId = cart.customer_id;
    const voucher = pricing.voucher || (voucher_code ? await getVoucherByCode(voucher_code) : null);

    if (voucher_code && !voucher) {
      return res.status(400).json({ message: 'Voucher not found' });
    }

    const [orderColumns] = await connection.query('SHOW COLUMNS FROM `Order`');
    const availableColumns = orderColumns.map((column) => column.Field);
    const insertColumns = [];
    const placeholders = [];
    const values = [];

    const addColumn = (columnName, value) => {
      if (availableColumns.includes(columnName) && value !== undefined) {
        insertColumns.push(`\`${columnName}\``);
        placeholders.push('?');
        values.push(value);
      }
    };

    const addNowColumn = (columnName) => {
      if (availableColumns.includes(columnName)) {
        insertColumns.push(`\`${columnName}\``);
        placeholders.push('NOW()');
      }
    };

    addColumn('customer_id', customerId);
    addColumn('user_id', userId);
    addColumn('total_price', pricing.totalPayable);
    addColumn('total_amount', pricing.totalPayable);
    addColumn('status', 'PENDING');
    addColumn('store_id', store_id);
    addColumn('delivery_latitude', delivery_latitude);
    addColumn('delivery_longitude', delivery_longitude);
    addColumn('delivery_method', delivery_method);
    addColumn('address', address);
    addColumn('voucher_id', voucher ? voucher.voucher_id : null);
    addNowColumn('order_date');
    addNowColumn('created_at');

    const [orderResult] = await connection.query(
      `INSERT INTO \`Order\` (${insertColumns.join(', ')}) VALUES (${placeholders.join(', ')})`,
      values
    );

    const orderId = orderResult.insertId;
    const orderDetailValues = items.map((it) => [orderId, it.product_id, it.quantity, it.price]);
    await connection.query(
      'INSERT INTO `OrderDetail` (order_id, product_id, quantity, price) VALUES ?',
      [orderDetailValues]
    );

    for (const item of items) {
      await connection.query(
        'UPDATE Inventory SET quantity = quantity - ? WHERE product_id = ?',
        [item.quantity, item.product_id]
      );
    }

    await connection.query('DELETE FROM `CartItem` WHERE cart_id = ?', [cart.cart_id]);

    await connection.commit();

    const created = await orderModel.getOrderById(orderId);
    res.status(201).json({
      order: created,
      pricing: {
        subtotal: pricing.subtotal,
        promotion_discount: pricing.promotionDiscount,
        voucher_discount: pricing.voucherDiscount,
        total_discount: pricing.totalDiscount,
        total_payable: pricing.totalPayable,
      },
    });
  } catch (err) {
    try {
      await connection.rollback();
    } catch {
      // ignore rollback failures
    }
    console.error(err);
    if (err.message === 'OUT_OF_STOCK') {
      return res.status(400).json({
        message: 'Một hoặc nhiều sản phẩm không đủ hàng trong kho',
        details: err.details,
      });
    }
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const orders = await orderModel.getOrdersByUserId(userId);
    res.json({ orders });
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

module.exports = { createOrderFromCart, getMyOrders, updateOrderStatus };
