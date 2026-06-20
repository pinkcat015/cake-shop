const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function run() {
    try {
        console.log('--- KHỞI ĐỘNG XÓA DỮ LIỆU USER & KHỞI TẠO LẠI ---');
        
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        
        console.log('1. Xóa sạch các bảng liên quan đến người dùng...');
        await db.query('TRUNCATE TABLE CartItem');
        await db.query('TRUNCATE TABLE Cart');
        await db.query('TRUNCATE TABLE OrderDetail');
        await db.query('TRUNCATE TABLE Payment');
        await db.query('TRUNCATE TABLE `Order`');
        await db.query('TRUNCATE TABLE Customer');
        await db.query('TRUNCATE TABLE User');
        
        console.log('2. Tạo lại các Role nếu chưa tồn tại...');
        await db.query('INSERT IGNORE INTO Role (role_name) VALUES (?)', ['customer']);
        await db.query('INSERT IGNORE INTO Role (role_name) VALUES (?)', ['employee']);
        await db.query('INSERT IGNORE INTO Role (role_name) VALUES (?)', ['admin']);
        
        // Lấy role_id
        const [roles] = await db.query('SELECT * FROM Role');
        const roleMap = {};
        roles.forEach(r => {
            roleMap[r.role_name] = r.role_id;
        });
        
        console.log('3. Băm mật khẩu...');
        const adminHash = await bcrypt.hash('admin123', 10);
        const employeeHash = await bcrypt.hash('employee123', 10);
        const customerHash = await bcrypt.hash('customer123', 10);
        
        console.log('4. Tạo tài khoản Admin demo...');
        const [adminResult] = await db.query(
            'INSERT INTO User (username, password, email, role_id, is_verified) VALUES (?, ?, ?, ?, ?)',
            ['admin_demo', adminHash, 'admin@example.com', roleMap['admin'], 1]
        );
        
        console.log('5. Tạo tài khoản Employee demo...');
        const [employeeResult] = await db.query(
            'INSERT INTO User (username, password, email, role_id, is_verified) VALUES (?, ?, ?, ?, ?)',
            ['employee_demo', employeeHash, 'employee@example.com', roleMap['employee'], 1]
        );
        await db.query('INSERT INTO Customer (user_id, name, phone, address) VALUES (?, ?, ?, ?)', 
            [employeeResult.insertId, 'Employee Demo', '0987654321', 'Scarlett Bakery Central Branch']);
        
        console.log('6. Tạo tài khoản Customer demo...');
        const [customerResult] = await db.query(
            'INSERT INTO User (username, password, email, role_id, is_verified) VALUES (?, ?, ?, ?, ?)',
            ['customer_demo', customerHash, 'customer@example.com', roleMap['customer'], 1]
        );
        await db.query('INSERT INTO Customer (user_id, name, phone, address) VALUES (?, ?, ?, ?)', 
            [customerResult.insertId, 'Khách Hàng Demo', '0123456789', '123 Hai Bà Trưng, Quận 1, TPHCM']);
            
        console.log('7. Tạo giỏ hàng trống...');
        await db.query('INSERT INTO Cart (customer_id) VALUES (?)', [customerResult.insertId]);
        
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log('\n✅ CẤU HÌNH LẠI DỮ LIỆU USER HOÀN TẤT THÀNH CÔNG!');
        console.log('Thông tin tài khoản kiểm thử:');
        console.log('  - ADMIN: username = "admin_demo", password = "admin123"');
        console.log('  - EMPLOYEE: username = "employee_demo", password = "employee123"');
        console.log('  - CUSTOMER: username = "customer_demo", password = "customer123"');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi khi reset dữ liệu:', error);
        process.exit(1);
    }
}

run();
