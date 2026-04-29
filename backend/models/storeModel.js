const db = require('../config/db');

const getAllStores = async () => {
  const [rows] = await db.query(
    'SELECT store_id, name, address, phone, rating, description, latitude, longitude, open_hours, active FROM `Store` WHERE active = 1 ORDER BY store_id ASC'
  );
  return rows;
};

const getStoreById = async (storeId) => {
  const [rows] = await db.query(
    'SELECT store_id, name, address, phone, rating, description, latitude, longitude, open_hours, active FROM `Store` WHERE store_id = ? LIMIT 1',
    [storeId]
  );
  return rows[0] || null;
};

const getNearestStores = async (lat, lng, limit = 1) => {
  const [rows] = await db.query(
    `SELECT store_id, name, address, latitude, longitude, open_hours, active,
      (6371 * ACOS(
        COS(RADIANS(?)) * COS(RADIANS(latitude)) * COS(RADIANS(longitude) - RADIANS(?)) +
        SIN(RADIANS(?)) * SIN(RADIANS(latitude))
      )) AS distance_km
     FROM \`Store\`
     WHERE active = 1
     ORDER BY distance_km ASC
     LIMIT ?`,
    [lat, lng, lat, Number(limit)]
  );
  return rows;
};

module.exports = {
  getAllStores,
  getStoreById,
  getNearestStores
};
