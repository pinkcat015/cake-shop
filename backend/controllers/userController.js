const db = require('../config/db');

const getProfile = async (req, res) => {
    try {
        const [users] = await db.query('SELECT u.username, u.email, r.role_name FROM User u JOIN Role r ON u.role_id = r.role_id WHERE u.user_id = ?', [req.user.user_id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateProfile = async (req, res) => {
    const { email } = req.body;

    try {
        await db.query('UPDATE User SET email = ? WHERE user_id = ?', [email, req.user.user_id]);
        res.json({ message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { getProfile, updateProfile };