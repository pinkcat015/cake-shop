const db = require('../config/db');

const findUserByUsername = async (username) => {
    const [rows] = await db.query('SELECT u.*, r.role_name FROM User u JOIN Role r ON u.role_id = r.role_id WHERE u.username = ?', [username]);
    return rows[0];
};

const findUserByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM User WHERE email = ?', [email]);
    return rows[0];
};

const findUserById = async (userId) => {
    const [rows] = await db.query('SELECT u.username, u.email, r.role_name FROM User u JOIN Role r ON u.role_id = r.role_id WHERE u.user_id = ?', [userId]);
    return rows[0];
};

const createUser = async (username, hashedPassword, email, roleId) => {
    const [result] = await db.query('INSERT INTO User (username, password, email, role_id) VALUES (?, ?, ?, ?)', [username, hashedPassword, email, roleId]);
    return result.insertId;
};

const updateUserEmail = async (userId, email) => {
    await db.query('UPDATE User SET email = ? WHERE user_id = ?', [email, userId]);
};

const getRoleByName = async (roleName) => {
    const [rows] = await db.query('SELECT role_id FROM Role WHERE role_name = ?', [roleName]);
    return rows[0];
};

module.exports = {
    findUserByUsername,
    findUserByEmail,
    findUserById,
    createUser,
    updateUserEmail,
    getRoleByName
};