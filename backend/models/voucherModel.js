const db = require('../config/db');

const roundMoney = (value) => Number(Number(value || 0).toFixed(2));

const getVoucherByCode = async (code) => {
  if (!code) return null;
  const [rows] = await db.query(
    'SELECT voucher_id, code, discount, expiry_date FROM `Voucher` WHERE UPPER(code) = UPPER(?) LIMIT 1',
    [String(code).trim()]
  );
  return rows[0] || null;
};

const getActivePromotionsForProducts = async (productIds) => {
  if (!productIds || productIds.length === 0) return [];

  const [rows] = await db.query(
    `SELECT
      pp.product_id,
      p.promotion_id,
      p.name,
      p.discount,
      p.start_date,
      p.end_date
    FROM ProductPromotion pp
    INNER JOIN Promotion p ON p.promotion_id = pp.promotion_id
    WHERE pp.product_id IN (?)
      AND (p.start_date IS NULL OR p.start_date <= CURDATE())
      AND (p.end_date IS NULL OR p.end_date >= CURDATE())`,
    [productIds]
  );

  return rows;
};

const calculateCartPricing = async (items, voucherCode = null) => {
  const normalizedItems = Array.isArray(items) ? items : [];
  const subtotal = roundMoney(
    normalizedItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0)
  );

  const productIds = [...new Set(normalizedItems.map((item) => item.product_id).filter(Boolean))];
  const promotions = await getActivePromotionsForProducts(productIds);

  const promotionByProduct = promotions.reduce((accumulator, promotion) => {
    const current = accumulator[promotion.product_id];
    if (!current || Number(promotion.discount) > Number(current.discount)) {
      accumulator[promotion.product_id] = promotion;
    }
    return accumulator;
  }, {});

  const promotionDiscount = roundMoney(
    normalizedItems.reduce((sum, item) => {
      const promotion = promotionByProduct[item.product_id];
      if (!promotion) return sum;
      const lineSubtotal = Number(item.price || 0) * Number(item.quantity || 0);
      return sum + (lineSubtotal * Number(promotion.discount || 0)) / 100;
    }, 0)
  );

  const voucher = voucherCode ? await getVoucherByCode(voucherCode) : null;
  let voucherDiscount = 0;

  if (voucher) {
    const expiryDate = voucher.expiry_date ? new Date(voucher.expiry_date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expiryDate && expiryDate < today) {
      const error = new Error('VOUCHER_EXPIRED');
      error.details = { code: voucher.code };
      throw error;
    }

    const afterPromotion = Math.max(subtotal - promotionDiscount, 0);
    voucherDiscount = roundMoney((afterPromotion * Number(voucher.discount || 0)) / 100);
  }

  const totalDiscount = roundMoney(promotionDiscount + voucherDiscount);
  const totalPayable = roundMoney(Math.max(subtotal - totalDiscount, 0));

  return {
    subtotal,
    promotionDiscount,
    voucherDiscount,
    totalDiscount,
    totalPayable,
    voucher,
    promotions,
  };
};

module.exports = {
  getVoucherByCode,
  getActivePromotionsForProducts,
  calculateCartPricing,
};