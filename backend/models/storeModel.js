const db = require('../config/db');

const getAllStores = async () => {
  const [rows] = await db.query(
    `SELECT store_id, name, address, phone, rating, description,
            image_url, latitude, longitude, open_hours, active
     FROM \`Store\`
     ORDER BY store_id ASC`
  );
  return rows;
};

const getStoreById = async (storeId) => {
  const [rows] = await db.query(
    `SELECT store_id, name, address, phone, rating, description,
            image_url, latitude, longitude, open_hours, active
     FROM \`Store\` WHERE store_id = ? LIMIT 1`,
    [storeId]
  );
  return rows[0] || null;
};

const getNearestStores = async (lat, lng, limit = 1) => {
  const [rows] = await db.query(
    `SELECT store_id, name, address, image_url, latitude, longitude, open_hours, active,
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

const createStore = async ({ name, address, phone, open_hours, description, rating, image_url, latitude, longitude, active }) => {
  const [result] = await db.query(
    `INSERT INTO \`Store\` (name, address, phone, open_hours, description, rating, image_url, latitude, longitude, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, address || null, phone || null, open_hours || null, description || null,
     rating || null, image_url || null, latitude || null, longitude || null, active ?? 1]
  );
  return getStoreById(result.insertId);
};

const updateStore = async (storeId, { name, address, phone, open_hours, description, rating, image_url, latitude, longitude, active }) => {
  await db.query(
    `UPDATE \`Store\`
     SET name = ?, address = ?, phone = ?, open_hours = ?, description = ?,
         rating = ?, image_url = ?, latitude = ?, longitude = ?, active = ?
     WHERE store_id = ?`,
    [name, address || null, phone || null, open_hours || null, description || null,
     rating || null, image_url || null, latitude || null, longitude || null, active ?? 1, storeId]
  );
  return getStoreById(storeId);
};

const deleteStore = async (storeId) => {
  const [result] = await db.query(
    'DELETE FROM `Store` WHERE store_id = ?',
    [storeId]
  );
  return result.affectedRows > 0;
};

module.exports = {
  getAllStores,
  getStoreById,
  getNearestStores,
  createStore,
  updateStore,
  deleteStore,
};