const cartModel = require('../models/cartModel');
const { calculateCartPricing } = require('../models/voucherModel');

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
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { applyVoucher };