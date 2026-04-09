const { findUserById, updateUserEmail } = require('../models/userModel');

const getProfile = async (req, res) => {
    try {
        const user = await findUserById(req.user.user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateProfile = async (req, res) => {
    const { email } = req.body;

    try {
        await updateUserEmail(req.user.user_id, email);
        res.json({ message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { getProfile, updateProfile };