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

const createUser = async (username, hashedPassword, email, roleId, verificationToken = null) => {
    const [result] = await db.query(
        'INSERT INTO User (username, password, email, role_id, is_verified, verification_token) VALUES (?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, email, roleId, verificationToken ? 0 : 1, verificationToken]
    );
    return result.insertId;
};

const updateUserEmail = async (userId, email) => {
    await db.query('UPDATE User SET email = ? WHERE user_id = ?', [email, userId]);
};

const getRoleByName = async (roleName) => {
    const [rows] = await db.query('SELECT role_id FROM Role WHERE role_name = ?', [roleName]);
    return rows[0];
};

const updateUserResetToken = async (email, token, expiry) => {
    await db.query('UPDATE User SET reset_token = ?, reset_token_expiry = ? WHERE email = ?', [token, expiry, email]);
};

const findUserByResetToken = async (email, token) => {
    const [rows] = await db.query(
        'SELECT * FROM User WHERE email = ? AND reset_token = ? AND reset_token_expiry > NOW()',
        [email, token]
    );
    return rows[0];
};

const updateUserPassword = async (email, hashedNewPassword) => {
    await db.query(
        'UPDATE User SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?',
        [hashedNewPassword, email]
    );
};

const verifyUserEmail = async (token) => {
    const [result] = await db.query(
        'UPDATE User SET is_verified = 1, verification_token = NULL WHERE verification_token = ? AND is_verified = 0',
        [token]
    );
    return result.affectedRows > 0;
};

module.exports = {
    findUserByUsername,
    findUserByEmail,
    findUserById,
    createUser,
    updateUserEmail,
    getRoleByName,
    updateUserResetToken,
    findUserByResetToken,
    updateUserPassword,
    verifyUserEmail
};