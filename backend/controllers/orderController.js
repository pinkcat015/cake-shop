const cartModel = require('../models/cartModel');
const orderModel = require('../models/orderModel');
const db = require('../config/db');
const { calculateCartPricing, getVoucherByCode } = require('../models/voucherModel');

// Allowed order statuses whitelist
const ALLOWED_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED'];

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
        // BE3: Return 400 with meaningful message instead of 500
        await connection.rollback();
        connection.release();
        return res.status(400).json({ message: 'Số lượng sản phẩm trong giỏ hàng không hợp lệ' });
      }

      if (requestedQty > stockQty) {
        const error = new Error('OUT_OF_STOCK');
        error.details = { productName: item.name, available: stockQty, requested: requestedQty };
        throw error;
      }
    }

    let pricing;
    try {
      pricing = await calculateCartPricing(items, voucher_code);
    } catch (vErr) {
      await connection.rollback();
      connection.release();
      // BE4: Catch Voucher validation errors and return 400 instead of 500
      if (vErr.message === 'VOUCHER_EXPIRED') {
        return res.status(400).json({ message: 'Mã voucher đã hết hạn' });
      }
      if (vErr.message === 'VOUCHER_NOT_FOUND') {
        return res.status(400).json({ message: 'Mã voucher không tồn tại' });
      }
      if (vErr.message === 'VOUCHER_LIMIT_EXCEEDED') {
        return res.status(400).json({ message: 'Mã voucher đã đạt giới hạn số lần sử dụng tối đa' });
      }
      if (vErr.message === 'VOUCHER_MIN_ORDER_NOT_MET') {
        return res.status(400).json({ 
          message: `Đơn hàng chưa đạt giá trị tối thiểu ${vErr.details.min_order_value}đ để áp dụng voucher này (giá trị hiện tại: ${vErr.details.actual_value}đ)` 
        });
      }
      throw vErr;
    }

    const customerId = cart.customer_id;
    // BE2: Check voucher BEFORE transaction work continues (avoid leak)
    const voucher = pricing.voucher || (voucher_code ? await getVoucherByCode(voucher_code) : null);

    if (voucher_code && !voucher) {
      await connection.rollback();
      connection.release();
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

    if (voucher) {
      // Tăng số lần sử dụng của Voucher
      await connection.query(
        'UPDATE `Voucher` SET used_count = used_count + 1 WHERE voucher_id = ?',
        [voucher.voucher_id]
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
    try { connection.release(); } catch (_) {}
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
    // BE5: Whitelist validation
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Trạng thái không hợp lệ. Cho phép: ${ALLOWED_STATUSES.join(', ')}` });
    }

    const order = await orderModel.getOrderById(id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Chặn không cho hoàn tác nếu đơn hàng đã ở trạng thái DELIVERED
    if (order.status === 'DELIVERED' && status !== 'DELIVERED') {
      return res.status(400).json({ message: 'Đơn hàng đã được giao thành công (DELIVERED). Trạng thái này là cuối cùng và không thể hoàn tác hoặc thay đổi khác.' });
    }

    await orderModel.updateOrderStatus(id, status);
    const updated = await orderModel.getOrderById(id);
    res.json({ order: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel.getAllOrders();
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const requestCancelOrder = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({ message: 'order_id is required' });
    }

    const order = await orderModel.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify order belongs to customer
    const [customerRows] = await db.query('SELECT customer_id FROM Customer WHERE user_id = ? LIMIT 1', [userId]);
    const customerId = customerRows[0]?.customer_id;
    // BE7: Explicit null check for customerId
    if (!customerId) {
      return res.status(403).json({ message: 'Không tìm thấy thông tin khách hàng' });
    }
    if (order.customer_id !== customerId) {
      return res.status(403).json({ message: 'Unauthorized to cancel this order' });
    }

    if (order.status === 'PENDING') {
      // BE7: Free cancel — restore inventory in transaction
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        await connection.query("UPDATE `Order` SET status = 'CANCELLED' WHERE order_id = ?", [orderId]);
        // Restore inventory
        const [details] = await connection.query('SELECT product_id, quantity FROM `OrderDetail` WHERE order_id = ?', [orderId]);
        for (const detail of details) {
          await connection.query('UPDATE Inventory SET quantity = quantity + ? WHERE product_id = ?', [detail.quantity, detail.product_id]);
        }
        // Hoàn trả số lần dùng Voucher
        if (order.voucher_id) {
          await connection.query('UPDATE `Voucher` SET used_count = GREATEST(0, used_count - 1) WHERE voucher_id = ?', [order.voucher_id]);
        }
        await connection.commit();
      } catch (txErr) {
        await connection.rollback();
        throw txErr;
      } finally {
        connection.release();
      }
      const updated = await orderModel.getOrderById(orderId);
      return res.json({ message: 'Hủy đơn hàng thành công', order: updated });
    } else if (order.status === 'CONFIRMED') {
      // Need seller acceptance
      await orderModel.updateCancelRequest(orderId, 1);
      const updated = await orderModel.getOrderById(orderId);
      return res.json({ message: 'Đã gửi yêu cầu hủy đơn hàng. Vui lòng chờ người bán duyệt.', order: updated });
    } else {
      return res.status(400).json({ message: 'Đơn hàng đang được giao hoặc đã hoàn thành, không thể hủy' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const approveCancelOrder = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({ message: 'order_id is required' });
    }

    const order = await orderModel.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // BE6: Must have an active cancel request and be in CONFIRMED status
    if (!order.cancel_requested || order.cancel_requested !== 1) {
      return res.status(400).json({ message: 'Đơn hàng này không có yêu cầu hủy đang chờ xử lý' });
    }
    if (order.status !== 'CONFIRMED') {
      return res.status(400).json({ message: 'Chỉ có thể đồng ý hủy đơn hàng đang ở trạng thái Đã xác nhận' });
    }

    // BE7: Approve cancel + restore inventory in transaction
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        "UPDATE `Order` SET status = 'CANCELLED', cancel_requested = 0 WHERE order_id = ?",
        [orderId]
      );
      // Restore inventory
      const [details] = await connection.query('SELECT product_id, quantity FROM `OrderDetail` WHERE order_id = ?', [orderId]);
      for (const detail of details) {
        await connection.query('UPDATE Inventory SET quantity = quantity + ? WHERE product_id = ?', [detail.quantity, detail.product_id]);
      }
      // Hoàn trả số lần dùng Voucher
      if (order.voucher_id) {
        await connection.query('UPDATE `Voucher` SET used_count = GREATEST(0, used_count - 1) WHERE voucher_id = ?', [order.voucher_id]);
      }
      await connection.commit();
    } catch (txErr) {
      await connection.rollback();
      throw txErr;
    } finally {
      connection.release();
    }

    const updated = await orderModel.getOrderById(orderId);
    res.json({ message: 'Đồng ý yêu cầu hủy đơn hàng thành công', order: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const rejectCancelOrder = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({ message: 'order_id is required' });
    }

    const order = await orderModel.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // BE6: Must have an active cancel request
    if (!order.cancel_requested || order.cancel_requested !== 1) {
      return res.status(400).json({ message: 'Đơn hàng này không có yêu cầu hủy đang chờ xử lý' });
    }

    await orderModel.rejectCancelOrderModel(orderId);
    const updated = await orderModel.getOrderById(orderId);
    res.json({ message: 'Từ chối yêu cầu hủy đơn hàng thành công', order: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { 
  createOrderFromCart, 
  getMyOrders, 
  updateOrderStatus, 
  getAllOrders,
  requestCancelOrder,
  approveCancelOrder,
  rejectCancelOrder
};
