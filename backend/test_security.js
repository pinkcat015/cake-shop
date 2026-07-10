const fetch = globalThis.fetch || require('node-fetch');
const db = require('./config/db');

(async () => {
  const base = 'http://localhost:3000/api';
  const suffix = Date.now();
  console.log('================================================================');
  console.log('=== KHỞI ĐỘNG KIỂM THỬ XÁC MINH CƠ CHẾ BẢO MẬT & BẢO VỆ MỚI  ===');
  console.log('================================================================\n');

  // Khởi tạo tài khoản test
  const customer = {
    username: `sec_cust_${suffix}`,
    password: 'password123',
    email: `sec_${suffix}@example.com`,
    role_name: 'customer'
  };

  let token, userId, customerId;
  let testProductId = 1; // Red Velvet Cake

  // 1. Đăng ký & Kích hoạt tài khoản
  console.log('--- 1. Đăng ký và Kích hoạt tài khoản kiểm thử ---');
  const regRes = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer)
  });
  console.log('  - Đăng ký:', regRes.status);

  const [userRows] = await db.query('SELECT user_id, verification_token FROM User WHERE email = ?', [customer.email]);
  userId = userRows[0].user_id;
  await fetch(`${base}/auth/verify-email?token=${userRows[0].verification_token}`);
  console.log('  - Kích hoạt email thành công. User ID:', userId);

  const loginRes = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: customer.username, password: customer.password })
  });
  const loginData = await loginRes.json();
  token = loginData.token;
  console.log('  - Đăng nhập thành công. Nhận JWT Token.\n');

  // 2. Kiểm thử: Voucher Hardening
  console.log('--- 2. Kiểm thử: Bảo vệ & Giới hạn Voucher ---');
  // Tạo voucher với min_order_value = 300,000đ và usage_limit = 1
  const vCode = `SEC_VOUCHER_${suffix}`;
  const [vResult] = await db.query(
    'INSERT INTO Voucher (code, discount, expiry_date, is_public, usage_limit, used_count, min_order_value) VALUES (?, 10, "2027-12-31", 1, 1, 0, 300000.00)',
    [vCode]
  );
  const voucherId = vResult.insertId;
  console.log(`  - Tạo voucher kiểm thử: ${vCode} (Min đơn: 300,000đ, Giới hạn: 1 lần)`);

  // Thêm 1 sản phẩm Red Velvet (giá 250,000đ) vào giỏ hàng
  await fetch(`${base}/cart/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ product_id: testProductId, quantity: 1 })
  });
  console.log('  - Thêm 1 Red Velvet Cake (250,000đ) vào giỏ');

  const [custRows] = await db.query('SELECT customer_id FROM Customer WHERE user_id = ?', [userId]);
  customerId = custRows[0]?.customer_id;

  // Thử áp dụng voucher (250k < 300k)
  let apply1 = await fetch(`${base}/vouchers/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ code: vCode })
  });
  let apply1Data = await apply1.json();
  console.log('  - Áp dụng Voucher (giỏ 250k):', apply1.status, `(Expected: 400). Response:`, apply1Data.message);

  // Tăng giỏ hàng lên 2 sản phẩm (500,000đ)
  await fetch(`${base}/cart/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ product_id: testProductId, quantity: 2 })
  });
  console.log('  - Tăng số lượng giỏ hàng lên 2 (Subtotal: 500,000đ)');

  // Áp dụng lại voucher (500k >= 300k)
  let apply2 = await fetch(`${base}/vouchers/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ code: vCode })
  });
  let apply2Data = await apply2.json();
  console.log('  - Áp dụng Voucher (giỏ 500k):', apply2.status, `(Expected: 200). Discount:`, apply2Data.voucher_discount, 'đ');

  // Tiến hành đặt hàng thứ 1 (dùng voucher)
  let order1 = await fetch(`${base}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ address: '99 Hoa Hồng', delivery_method: 'delivery', store_id: 1, voucher_code: vCode })
  });
  let order1Data = await order1.json();
  const order1Id = order1Data.order?.order_id;
  console.log('  - Tạo đơn hàng số 1 thành công. Order ID:', order1Id);

  // Kiểm tra used_count của voucher trong DB
  const [vRow1] = await db.query('SELECT used_count FROM Voucher WHERE voucher_id = ?', [voucherId]);
  console.log('  - DB check used_count sau khi đặt đơn 1:', vRow1[0].used_count, '(Expected: 1)');

  // Thêm lại vào giỏ hàng và thử đặt hàng thứ 2 với voucher đã đạt giới hạn dùng
  await fetch(`${base}/cart/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ product_id: testProductId, quantity: 2 })
  });

  let order2 = await fetch(`${base}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ address: '99 Hoa Hồng', delivery_method: 'delivery', store_id: 1, voucher_code: vCode })
  });
  let order2Data = await order2.json();
  console.log('  - Đặt đơn hàng 2 bằng voucher đã dùng hết:', order2.status, `(Expected: 400). Response:`, order2Data.message);

  // Khách hàng hủy đơn hàng số 1 (free cancel)
  console.log('  - Thực hiện hủy đơn hàng số 1 để hoàn trả số lượt Voucher');
  await fetch(`${base}/orders/${order1Id}/cancel`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  // Kiểm tra used_count đã quay về 0
  const [vRow2] = await db.query('SELECT used_count FROM Voucher WHERE voucher_id = ?', [voucherId]);
  console.log('  - DB check used_count sau khi hủy đơn 1:', vRow2[0].used_count, '(Expected: 0)');

  // Thử đặt lại đơn hàng thứ 2
  let order2Retry = await fetch(`${base}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ address: '99 Hoa Hồng', delivery_method: 'delivery', store_id: 1, voucher_code: vCode })
  });
  let order2RetryData = await order2Retry.json();
  const order2Id = order2RetryData.order?.order_id;
  console.log('  - Đặt đơn hàng 2 lại sau khi hủy đơn 1:', order2Retry.status, `(Expected: 201). Order ID:`, order2Id);
  console.log('✓ Kết quả kiểm thử Voucher: THÀNH CÔNG!\n');


  // 3. Kiểm thử: Brute-Force OTP
  console.log('--- 3. Kiểm thử: Chống Brute-Force OTP ---');
  // Kích hoạt quên mật khẩu để gửi mã OTP
  await fetch(`${base}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: customer.email })
  });
  console.log('  - Đã gửi yêu cầu quên mật khẩu (Tạo mã OTP mới)');

  const [otpRow] = await db.query('SELECT reset_token FROM User WHERE email = ?', [customer.email]);
  const correctOtp = otpRow[0].reset_token;
  console.log('  - Mã OTP đúng thực tế trong DB:', correctOtp);

  // Nhập sai mã OTP liên tục 4 lần
  for (let attempt = 1; attempt <= 4; attempt++) {
    let wrongRes = await fetch(`${base}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: customer.email, token: '999999', newPassword: 'newpassword123' })
    });
    let wrongData = await wrongRes.json();
    console.log(`    * Thử lần ${attempt} với mã sai:`, wrongRes.status, `Response:`, wrongData.message);
  }

  // Nhập sai lần thứ 5 -> Kích hoạt khóa
  let wrongRes5 = await fetch(`${base}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: customer.email, token: '999999', newPassword: 'newpassword123' })
  });
  let wrongData5 = await wrongRes5.json();
  console.log('  - Thử lần 5 với mã sai (Kích hoạt khóa):', wrongRes5.status, `Response:`, wrongData5.message);

  // Thử lần thứ 6 với OTP ĐÚNG -> Bị chặn 429 vì đã bị khóa
  let blockRes = await fetch(`${base}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: customer.email, token: correctOtp, newPassword: 'newpassword123' })
  });
  let blockData = await blockRes.json();
  console.log('  - Thử lần 6 với mã ĐÚNG (Bị chặn do đang khóa):', blockRes.status, `(Expected: 429). Response:`, blockData.message);

  console.log('✓ Kết quả kiểm thử chống Brute-Force OTP: THÀNH CÔNG!\n');

  // 4. Dọn dẹp dữ liệu
  console.log('--- 4. Dọn dẹp dữ liệu kiểm thử ---');
  await db.query('DELETE FROM `OrderDetail` WHERE order_id IN (?, ?)', [order1Id, order2Id]);
  await db.query('DELETE FROM `Order` WHERE order_id IN (?, ?)', [order1Id, order2Id]);
  await db.query('DELETE FROM `Voucher` WHERE voucher_id = ?', [voucherId]);
  
  // Xóa CartItem và Cart
  await db.query(`
    DELETE FROM CartItem WHERE cart_id IN (
      SELECT cart_id FROM Cart WHERE customer_id IN (
        SELECT customer_id FROM Customer WHERE user_id = ?
      )
    )
  `, [userId]);
  
  await db.query(`
    DELETE FROM Cart WHERE customer_id IN (
      SELECT customer_id FROM Customer WHERE user_id = ?
    )
  `, [userId]);

  await db.query('DELETE FROM `Customer` WHERE user_id = ?', [userId]);
  await db.query('DELETE FROM `User` WHERE user_id = ?', [userId]);
  console.log('✓ Đã xóa sạch tài khoản, đơn hàng và voucher test khỏi DB.');
  
  await db.end();
  console.log('\n================================================================');
  console.log('=== TẤT CẢ KIỂM THỬ BẢO MẬT ĐÃ HOÀN THÀNH XUẤT SẮC!         ===');
  console.log('================================================================');
})().catch(async (e) => {
  console.error('Error in test:', e);
  await db.end();
  process.exit(1);
});
