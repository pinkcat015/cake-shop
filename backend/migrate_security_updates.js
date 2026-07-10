const db = require('./config/db');

(async () => {
  console.log('--- KHỞI ĐỘNG MIGRATION BẢO MẬT CƠ SỞ DỮ LIỆU ---');
  
  try {
    // 1. Kiểm tra và bổ sung cột cho bảng Voucher
    const [voucherColumns] = await db.query("SHOW COLUMNS FROM `Voucher`");
    const voucherColNames = voucherColumns.map(c => c.Field);
    
    if (!voucherColNames.includes('usage_limit')) {
      console.log('-> Thêm cột usage_limit vào bảng Voucher');
      await db.query("ALTER TABLE `Voucher` ADD COLUMN `usage_limit` INT DEFAULT NULL");
    }
    
    if (!voucherColNames.includes('used_count')) {
      console.log('-> Thêm cột used_count vào bảng Voucher');
      await db.query("ALTER TABLE `Voucher` ADD COLUMN `used_count` INT DEFAULT 0");
    }
    
    if (!voucherColNames.includes('min_order_value')) {
      console.log('-> Thêm cột min_order_value vào bảng Voucher');
      await db.query("ALTER TABLE `Voucher` ADD COLUMN `min_order_value` DECIMAL(10,2) DEFAULT 0.00");
    }

    // 2. Kiểm tra và bổ sung cột cho bảng User
    const [userColumns] = await db.query("SHOW COLUMNS FROM `User`");
    const userColNames = userColumns.map(c => c.Field);
    
    if (!userColNames.includes('otp_attempts')) {
      console.log('-> Thêm cột otp_attempts vào bảng User');
      await db.query("ALTER TABLE `User` ADD COLUMN `otp_attempts` INT DEFAULT 0");
    }
    
    if (!userColNames.includes('otp_blocked_until')) {
      console.log('-> Thêm cột otp_blocked_until vào bảng User');
      await db.query("ALTER TABLE `User` ADD COLUMN `otp_blocked_until` TIMESTAMP NULL DEFAULT NULL");
    }

    console.log('✓ Hoàn thành migration cơ sở dữ liệu thành công!');
  } catch (err) {
    console.error('Lỗi khi chạy migration bảo mật:', err);
    process.exit(1);
  } finally {
    await db.end();
  }
})();
