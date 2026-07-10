    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const crypto = require('crypto');
    const { findUserByUsername, findUserByEmail, createUser, getRoleByName, updateUserResetToken, findUserByResetToken, updateUserPassword, verifyUserEmail, incrementOtpAttempts, blockUserOtp, resetOtpAttempts } = require('../models/userModel');
    const { sendVerificationEmail, sendResetOtpEmail } = require('../config/mailer');

    const register = async (req, res) => {
        const { username, password, email, role_name } = req.body;

        try {
            // Check if user exists
            const existingUser = await findUserByUsername(username) || await findUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Get role_id
            const role = await getRoleByName(role_name);
            if (!role) {
                return res.status(400).json({ message: 'Invalid role' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Generate verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');

            // Insert user
            await createUser(username, hashedPassword, email, role.role_id, verificationToken);

            // Send verification email
            await sendVerificationEmail(email, verificationToken);

            res.status(201).json({ message: 'Đăng ký tài khoản thành công! Vui lòng kiểm tra email của bạn để kích hoạt tài khoản.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error });
        }
    };

    const login = async (req, res) => {
        const { username, password } = req.body;

        try {
            const user = await findUserByUsername(username);
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Check if user is verified
            if (!user.is_verified) {
                return res.status(400).json({ message: 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email của bạn để kích hoạt tài khoản.' });
            }

            const token = jwt.sign({ user_id: user.user_id, role: user.role_name }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    };

    const verifyEmail = async (req, res) => {
        const token = String(req.query.token || '').trim();
        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }
        try {
            const success = await verifyUserEmail(token);
            if (!success) {
                return res.status(400).json({ message: 'Mã xác thực không hợp lệ hoặc tài khoản đã được kích hoạt trước đó.' });
            }
            res.json({ message: 'Tài khoản của bạn đã được kích hoạt thành công! Bây giờ bạn có thể đăng nhập.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error });
        }
    };

    const forgotPassword = async (req, res) => {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        try {
            const user = await findUserByEmail(email);
            if (!user) {
                return res.status(404).json({ message: 'User with this email does not exist' });
            }

            // Generate 6-digit OTP code
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            // Expiry: 15 minutes
            const expiry = new Date(Date.now() + 15 * 60 * 1000);

            await updateUserResetToken(email, otp, expiry);

            // Send reset OTP email
            await sendResetOtpEmail(email, otp);

            console.log(`[SMTP SENDER] Reset OTP for ${email}: ${otp}`);

            res.json({
                message: 'Mã xác thực OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hòm thư.'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error });
        }
    };

    const resetPassword = async (req, res) => {
        const { email, token, newPassword } = req.body;
        if (!email || !token || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP token, and newPassword are required' });
        }
        try {
            const user = await findUserByEmail(email);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check if user is currently blocked from OTP attempts
            if (user.otp_blocked_until) {
                const blockedTime = new Date(user.otp_blocked_until);
                if (blockedTime > new Date()) {
                    const remainingMins = Math.ceil((blockedTime.getTime() - Date.now()) / 60000);
                    return res.status(429).json({ 
                        message: `Tài khoản đang bị tạm khóa tính năng này. Vui lòng thử lại sau ${remainingMins} phút.` 
                    });
                }
            }

            const resetUser = await findUserByResetToken(email, token);
            if (!resetUser) {
                await incrementOtpAttempts(email);
                const updatedUser = await findUserByEmail(email);
                const attempts = updatedUser.otp_attempts || 0;
                
                if (attempts >= 5) {
                    await blockUserOtp(email, 15);
                    return res.status(400).json({ 
                        message: 'Tài khoản bị tạm khóa 15 phút do nhập sai mã OTP quá 5 lần. Vui lòng yêu cầu mã OTP mới.' 
                    });
                }
                
                return res.status(400).json({ 
                    message: `Mã OTP không hợp lệ hoặc đã hết hạn. Còn lại ${5 - attempts} lượt nhập.` 
                });
            }

            // Reset attempts on successful reset
            await resetOtpAttempts(email);

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await updateUserPassword(email, hashedPassword);

            res.json({ message: 'Password has been reset successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error });
        }
    };

    module.exports = { register, login, verifyEmail, forgotPassword, resetPassword };