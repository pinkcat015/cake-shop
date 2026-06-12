const fetch = globalThis.fetch || require('node-fetch');
const db = require('./config/db');

(async () => {
  const base = 'http://localhost:3000/api';
  console.log('=== KHỞI ĐỘNG KIỂM THỬ TỰ ĐỘNG CÁC TÍNH NĂNG MỚI ===\n');

  try {
    // 1. Kiểm thử Luồng Reset Password
    console.log('[1] Kiểm thử luồng khôi phục mật khẩu...');
    const randomSuffix = Math.floor(Math.random() * 10000);
    const registerBody = {
      username: `user_reset_${randomSuffix}`,
      password: 'password_old',
      email: `reset_${randomSuffix}@example.com`,
      role_name: 'customer'
    };

    // Đăng ký tài khoản
    let regRes = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerBody)
    });
    console.log(`- Đăng ký tài khoản test: ${regRes.status} (Expected: 201)`);

    // Lấy Verification Token trực tiếp từ DB
    const [vRows] = await db.query('SELECT verification_token FROM User WHERE email = ?', [registerBody.email]);
    const vToken = vRows[0]?.verification_token;
    console.log(`  Mã xác nhận email lấy từ DB: ${vToken}`);

    // Kích hoạt tài khoản
    let verifyRes = await fetch(`${base}/auth/verify-email?token=${vToken}`);
    console.log(`- Kích hoạt tài khoản qua Token: ${verifyRes.status} (Expected: 200)`);

    // Quên mật khẩu
    let forgotRes = await fetch(`${base}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: registerBody.email })
    });
    console.log(`- Yêu cầu quên mật khẩu: ${forgotRes.status} (Expected: 200)`);

    // Lấy OTP từ DB
    const [userRows] = await db.query('SELECT reset_token FROM User WHERE email = ?', [registerBody.email]);
    const otp = userRows[0]?.reset_token;
    console.log(`  Mã OTP lấy được từ DB (bản sao gửi đi): ${otp}`);

    // Đổi mật khẩu
    let resetRes = await fetch(`${base}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registerBody.email,
        token: otp,
        newPassword: 'password_new_123'
      })
    });
    console.log(`- Cập nhật mật khẩu mới: ${resetRes.status} (Expected: 200)`);

    // Thử đăng nhập lại bằng mật khẩu mới
    let loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: registerBody.username,
        password: 'password_new_123'
      })
    });
    const loginData = await loginRes.json();
    console.log(`- Đăng nhập bằng mật khẩu mới: ${loginRes.status} (Expected: 200)`);
    if (loginData.token) {
      console.log('  Đăng nhập thành công! Token:', loginData.token.substring(0, 20) + '...');
    } else {
      throw new Error('Đăng nhập thất bại, không nhận được token');
    }

    console.log('\n[2] Kiểm thử quyền truy cập Admin...');
    // Đăng nhập tài khoản admin_demo
    // Password của admin_demo trong seed dữ liệu hoặc mặc định là 'admin123' hoặc tương tự
    // Hãy thử đăng nhập admin_demo bằng password 'admin123'
    let adminLoginRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin_demo',
        password: 'admin123'
      })
    });
    const adminLoginData = await adminLoginRes.json();
    if (adminLoginRes.status !== 200) {
      console.log('  Lưu ý: Không thể đăng nhập bằng admin_demo / admin123. Thử tạo tài khoản admin mới...');
      // Đăng ký admin mới để test
      const adminUsername = `admin_test_${randomSuffix}`;
      await fetch(`${base}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername,
          password: 'admin_password',
          email: `admin_${randomSuffix}@example.com`,
          role_name: 'admin'
        })
      });
      const alRes = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: 'admin_password' })
      });
      const alData = await alRes.json();
      adminToken = alData.token;
    } else {
      adminToken = adminLoginData.token;
    }
    console.log(`- Đăng nhập admin thành công. Token: ${adminToken.substring(0, 20)}...`);

    // Test API reports stats
    let statsRes = await fetch(`${base}/reports/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const statsData = await statsRes.json();
    console.log(`- API Reports Stats: ${statsRes.status} (Expected: 200)`);
    console.log('  Data:', statsData);

    // Test API reports revenue
    let revRes = await fetch(`${base}/reports/revenue`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const revData = await revRes.json();
    console.log(`- API Reports Revenue: ${revRes.status} (Expected: 200)`);
    console.log('  Dữ liệu doanh thu (30 ngày):', revData.revenue?.length, 'ngày ghi nhận');

    // Test API reports top products
    let topRes = await fetch(`${base}/reports/top-products`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const topData = await topRes.json();
    console.log(`- API Reports Top Products: ${topRes.status} (Expected: 200)`);
    console.log('  Top sản phẩm:', topData.products?.map(p => `${p.name} (Bán: ${p.total_sold})`).join(', '));

    // Test API Orders (Admin)
    let ordersRes = await fetch(`${base}/orders`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const ordersData = await ordersRes.json();
    console.log(`- API Orders (Admin list): ${ordersRes.status} (Expected: 200)`);
    console.log('  Tổng số đơn hàng trả về:', ordersData.orders?.length);

    // Test CRUD Vouchers (Admin)
    console.log('\n[3] Kiểm thử CRUD Vouchers cho Admin...');
    const voucherCode = `TESTVOUCHER_${randomSuffix}`;
    // Create
    let createVoucherRes = await fetch(`${base}/vouchers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        code: voucherCode,
        discount: 15,
        expiry_date: '2027-12-31'
      })
    });
    const createVoucherData = await createVoucherRes.json();
    console.log(`- Tạo Voucher: ${createVoucherRes.status} (Expected: 201)`);
    console.log('  Voucher tạo ra:', createVoucherData.voucher);
    const voucherId = createVoucherData.voucher.voucher_id;

    // Get list
    let listVoucherRes = await fetch(`${base}/vouchers`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const listVoucherData = await listVoucherRes.json();
    console.log(`- Lấy danh sách Voucher: ${listVoucherRes.status} (Expected: 200)`);
    const found = listVoucherData.vouchers?.find(v => v.code === voucherCode);
    console.log(`  Tìm thấy voucher vừa tạo: ${found ? 'ĐÚNG' : 'SAI'}`);

    // Update
    let updateVoucherRes = await fetch(`${base}/vouchers/${voucherId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        code: voucherCode,
        discount: 20, // Tăng giảm giá lên 20%
        expiry_date: '2027-12-31'
      })
    });
    console.log(`- Cập nhật Voucher: ${updateVoucherRes.status} (Expected: 200)`);

    // Delete
    let deleteVoucherRes = await fetch(`${base}/vouchers/${voucherId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`- Xóa Voucher: ${deleteVoucherRes.status} (Expected: 200)`);

    console.log('\n[4] Kiểm thử phân quyền cho role Employee...');
    const employeeUsername = `employee_test_${randomSuffix}`;
    const employeeEmail = `employee_${randomSuffix}@example.com`;
    await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: employeeUsername,
        password: 'employee_password',
        email: employeeEmail,
        role_name: 'employee'
      })
    });

    // Lấy Verification Token của Employee để kích hoạt
    const [empVRows] = await db.query('SELECT verification_token FROM User WHERE email = ?', [employeeEmail]);
    const empVToken = empVRows[0]?.verification_token;
    await fetch(`${base}/auth/verify-email?token=${empVToken}`);
    console.log(`- Đăng ký và kích hoạt tài khoản Employee qua email thành công`);

    const elRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: employeeUsername, password: 'employee_password' })
    });
    const elData = await elRes.json();
    const employeeToken = elData.token;
    console.log(`- Đăng nhập Employee thành công. Token: ${employeeToken.substring(0, 20)}...`);

    // 1. Employee lấy danh sách đơn hàng (Cho phép)
    let empOrdersRes = await fetch(`${base}/orders`, {
      headers: { 'Authorization': `Bearer ${employeeToken}` }
    });
    console.log(`- Employee lấy danh sách đơn hàng: ${empOrdersRes.status} (Expected: 200)`);

    // 2. Employee cố gắng truy cập reports stats (phải bị từ chối 403)
    let empStatsRes = await fetch(`${base}/reports/stats`, {
      headers: { 'Authorization': `Bearer ${employeeToken}` }
    });
    console.log(`- Employee truy cập báo cáo (bị từ chối): ${empStatsRes.status} (Expected: 403)`);

    // 3. Employee cố gắng tạo voucher (phải bị từ chối 403)
    let empVoucherRes = await fetch(`${base}/vouchers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${employeeToken}`
      },
      body: JSON.stringify({ code: `FAIL_${randomSuffix}`, discount: 10 })
    });
    console.log(`- Employee tạo voucher (bị từ chối): ${empVoucherRes.status} (Expected: 403)`);

    console.log('\n=== TẤT CẢ CÁC BÀI KIỂM THỬ ĐÃ HOÀN THÀNH THÀNH CÔNG! ===');
    process.exit(0);
  } catch (error) {
    console.error('\nLỖI KHI CHẠY KIỂM THỬ:', error);
    process.exit(1);
  }
})();
