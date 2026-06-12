const nodemailer = require('nodemailer');
require('dotenv').config();

// Create SMTP Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test SMTP connection on startup
let isSmtpReady = false;
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error (Gmail):', error.message);
    console.log('------------------------------------------------------------');
    console.log('⚠️  CẢNH BÁO: Gmail SMTP chưa kết nối được (sai email/mật khẩu ứng dụng).');
    console.log('👉 Chế độ FALLBACK đã kích hoạt: OTP và Link xác thực sẽ IN RA CONSOLE để bạn test.');
    console.log('------------------------------------------------------------');
  } else {
    console.log('SMTP Connection Successful. Mailer is ready.');
    isSmtpReady = true;
  }
});

/**
 * Gửi email xác thực khi đăng ký tài khoản mới
 * @param {string} toEmail 
 * @param {string} token 
 */
const sendVerificationEmail = async (toEmail, token) => {
  const verifyUrl = `http://localhost:5173/verify-email?token=${token}`;
  
  // Always log to console as backup/fallback
  console.log('============================================================');
  console.log(`📧 [EMAIL VERIFICATION] Gửi tới: ${toEmail}`);
  console.log(`🔗 Liên kết xác thực: ${verifyUrl}`);
  console.log('============================================================');

  if (!isSmtpReady) return;

  const mailOptions = {
    from: `"Scarlett Cake Shop" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Xác thực tài khoản Scarlett Cake Shop của bạn',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e8e0d5; border-radius: 10px;">
        <h2 style="color: #6b1111; text-align: center; font-family: serif;">Chào mừng bạn đến với Scarlett Cake Shop!</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng bấm vào liên kết dưới đây để xác thực địa chỉ email và kích hoạt tài khoản của mình:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #6b1111; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Kích hoạt tài khoản</a>
        </div>
        <p>Nếu nút bấm trên không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt của mình:</p>
        <p style="color: #666; word-break: break-all;">${verifyUrl}</p>
        <hr style="border: 0; border-top: 1px solid #e8e0d5; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">Thư này được gửi tự động, vui lòng không phản hồi lại email này.</p>
      </div>
    `,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error(`Gửi mail kích hoạt thất bại tới ${toEmail}:`, err.message);
  }
};

/**
 * Gửi email chứa mã OTP khôi phục mật khẩu
 * @param {string} toEmail 
 * @param {string} otp 
 */
const sendResetOtpEmail = async (toEmail, otp) => {
  // Always log to console as backup/fallback
  console.log('============================================================');
  console.log(`📧 [RESET PASSWORD OTP] Gửi tới: ${toEmail}`);
  console.log(`🔑 Mã OTP xác nhận: ${otp}`);
  console.log('============================================================');

  if (!isSmtpReady) return;

  const mailOptions = {
    from: `"Scarlett Cake Shop" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Mã OTP khôi phục mật khẩu - Scarlett Cake Shop',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e8e0d5; border-radius: 10px;">
        <h2 style="color: #6b1111; text-align: center; font-family: serif;">Yêu Cầu Khôi Phục Mật Khẩu</h2>
        <p>Chúng tôi nhận được yêu cầu lấy lại mật khẩu cho tài khoản liên kết với địa chỉ email này.</p>
        <p>Dưới đây là mã xác thực OTP của bạn. Mã này có hiệu lực trong vòng <b>15 phút</b>:</p>
        <div style="text-align: center; margin: 25px 0;">
          <div style="background-color: #f7f5f2; border: 1px dashed #6b1111; color: #6b1111; font-size: 28px; font-weight: bold; letter-spacing: 5px; padding: 15px; display: inline-block; border-radius: 5px;">
            ${otp}
          </div>
        </div>
        <p style="color: #ff3b30; font-weight: 500;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc đổi mật khẩu để bảo vệ tài khoản.</p>
        <hr style="border: 0; border-top: 1px solid #e8e0d5; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">Scarlett Cake Shop - Ngọt ngào từng khoảnh khắc.</p>
      </div>
    `,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error(`Gửi mail OTP thất bại tới ${toEmail}:`, err.message);
  }
};

module.exports = {
  sendVerificationEmail,
  sendResetOtpEmail,
};
