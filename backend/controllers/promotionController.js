const promotionModel = require('../models/promotionModel');

const listPromotions = async (req, res) => {
  try {
    const list = await promotionModel.getAllPromotions();
    res.json({ promotions: list });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getPromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await promotionModel.getPromotionById(id);
    if (!promo) return res.status(404).json({ message: 'Promotion not found' });
    res.json({ promotion: promo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const addPromotion = async (req, res) => {
  try {
    const { name, discount, start_date, end_date, start_time, end_time, product_ids } = req.body || {};
    if (!name || discount === undefined) {
      return res.status(400).json({ message: 'Name and discount are required' });
    }

    const discountNum = Number(discount);
    if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
      return res.status(400).json({ message: 'Discount must be between 0 and 100' });
    }

    const promoId = await promotionModel.createPromotion({
      name,
      discount: discountNum,
      start_date,
      end_date,
      start_time: start_time || null,
      end_time: end_time || null,
      product_ids: Array.isArray(product_ids) ? product_ids : []
    });

    const created = await promotionModel.getPromotionById(promoId);
    res.status(201).json({ message: 'Promotion created successfully', promotion: created });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const editPromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, discount, start_date, end_date, start_time, end_time, product_ids } = req.body || {};
    
    const promo = await promotionModel.getPromotionById(id);
    if (!promo) return res.status(404).json({ message: 'Promotion not found' });

    if (!name || discount === undefined) {
      return res.status(400).json({ message: 'Name and discount are required' });
    }

    const discountNum = Number(discount);
    if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
      return res.status(400).json({ message: 'Discount must be between 0 and 100' });
    }

    await promotionModel.updatePromotion(id, {
      name,
      discount: discountNum,
      start_date,
      end_date,
      start_time: start_time || null,
      end_time: end_time || null,
      product_ids: Array.isArray(product_ids) ? product_ids : []
    });

    const updated = await promotionModel.getPromotionById(id);
    res.json({ message: 'Promotion updated successfully', promotion: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const removePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await promotionModel.getPromotionById(id);
    if (!promo) return res.status(404).json({ message: 'Promotion not found' });

    await promotionModel.deletePromotion(id);
    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  listPromotions,
  getPromotion,
  addPromotion,
  editPromotion,
  removePromotion
};
