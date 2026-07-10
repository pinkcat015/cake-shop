const cartModel = require('../models/cartModel');
const { calculateCartPricing, getAllVouchers, getPublicActiveVouchers, createVoucher, updateVoucher, deleteVoucher } = require('../models/voucherModel');

const applyVoucher = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const code = String(req.body?.code || '').trim();

    const cart = await cartModel.findCartByUserId(userId);
    if (!cart) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const fullCart = await cartModel.getCartWithItems(cart.cart_id);
    if (!fullCart.items.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const pricing = await calculateCartPricing(fullCart.items, code || null);

    if (code && !pricing.voucher) {
      return res.status(404).json({ message: 'Voucher not found' });
    }

    res.json({
      message: code ? 'Voucher applied successfully' : 'Pricing calculated successfully',
      code: pricing.voucher?.code || null,
      subtotal: pricing.subtotal,
      promotion_discount: pricing.promotionDiscount,
      voucher_discount: pricing.voucherDiscount,
      total_discount: pricing.totalDiscount,
      total_payable: pricing.totalPayable,
      voucher: pricing.voucher,
      promotions: pricing.promotions,
    });
  } catch (error) {
    if (error.message === 'VOUCHER_EXPIRED') {
      return res.status(400).json({ message: 'Voucher has expired' });
    }
    if (error.message === 'VOUCHER_LIMIT_EXCEEDED') {
      return res.status(400).json({ message: 'Voucher has reached its maximum usage limit' });
    }
    if (error.message === 'VOUCHER_MIN_ORDER_NOT_MET') {
      return res.status(400).json({ 
        message: `Order subtotal does not meet the minimum requirement of ${error.details.min_order_value}đ (current: ${error.details.actual_value}đ)` 
      });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getVouchers = async (req, res) => {
  try {
    const vouchers = await getAllVouchers();
    res.json({ vouchers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const addVoucher = async (req, res) => {
  try {
    const { code, discount, expiry_date, is_public, usage_limit, min_order_value } = req.body;
    if (!code || discount === undefined) {
      return res.status(400).json({ message: 'Code and discount are required' });
    }
    const parsedUsageLimit = usage_limit !== undefined && usage_limit !== '' && usage_limit !== null ? parseInt(usage_limit, 10) : null;
    const parsedMinOrderVal = min_order_value !== undefined && min_order_value !== '' && min_order_value !== null ? parseFloat(min_order_value) : 0;
    
    const voucher = await createVoucher(code, discount, expiry_date, !!is_public, parsedUsageLimit, parsedMinOrderVal);
    res.status(201).json({ message: 'Voucher created successfully', voucher });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Voucher code already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const editVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discount, expiry_date, is_public, usage_limit, min_order_value } = req.body;
    if (!code || discount === undefined) {
      return res.status(400).json({ message: 'Code and discount are required' });
    }
    const parsedUsageLimit = usage_limit !== undefined && usage_limit !== '' && usage_limit !== null ? parseInt(usage_limit, 10) : null;
    const parsedMinOrderVal = min_order_value !== undefined && min_order_value !== '' && min_order_value !== null ? parseFloat(min_order_value) : 0;

    const voucher = await updateVoucher(id, code, discount, expiry_date, !!is_public, parsedUsageLimit, parsedMinOrderVal);
    res.json({ message: 'Voucher updated successfully', voucher });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Voucher code already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getPublicVouchers = async (req, res) => {
  try {
    const vouchers = await getPublicActiveVouchers();
    res.json({ vouchers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const removeVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteVoucher(id);
    res.json({ message: 'Voucher deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  applyVoucher,
  getVouchers,
  getPublicVouchers,
  addVoucher,
  editVoucher,
  removeVoucher
};