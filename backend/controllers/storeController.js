const storeModel = require('../models/storeModel');

const listStores = async (req, res) => {
  try {
    const stores = await storeModel.getAllStores();
    res.json({ stores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const nearestStores = async (req, res) => {
  try {
    const { lat, lng, limit = 3 } = req.query;
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    const parsedLimit = Number(limit);

    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
      return res.status(400).json({ message: 'lat and lng are required' });
    }

    const stores = await storeModel.getNearestStores(parsedLat, parsedLng, parsedLimit || 3);
    res.json({ stores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getStoreDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'store id is required' });
    
    const store = await storeModel.getStoreById(Number(id));
    if (!store) return res.status(404).json({ message: 'Store not found' });
    
    res.json({ store });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  listStores,
  getStoreDetail,
  nearestStores
};
