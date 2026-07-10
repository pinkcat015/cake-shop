const fetch = globalThis.fetch || require('node-fetch');
const db = require('./config/db');

(async () => {
  const base = 'http://localhost:3000/api';
  console.log('=== KHỞI ĐỘNG KIỂM THỬ THANH TOÁN BANK TRANSFER & XÁC NHẬN REALTIME ===\n');

  try {
    const randomSuffix = Math.floor(Math.random() * 10000);
    const registerBody = {
      username: `pay_user_${randomSuffix}`,
      password: 'password123',
      email: `pay_${randomSuffix}@example.com`,
      role_name: 'customer'
    };

    // 1. Đăng ký tài khoản
    let regRes = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerBody)
    });
    console.log(`- Đăng ký tài khoản test: ${regRes.status} (Expected: 201)`);

    // 2. Kích hoạt tài khoản qua DB
    const [vRows] = await db.query('SELECT verification_token FROM User WHERE email = ?', [registerBody.email]);
    const vToken = vRows[0]?.verification_token;
    console.log(`  Verification token: ${vToken}`);
    let verifyRes = await fetch(`${base}/auth/verify-email?token=${vToken}`);
    console.log(`- Kích hoạt tài khoản: ${verifyRes.status} (Expected: 200)`);

    // 3. Đăng nhập
    let loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: registerBody.username,
        password: registerBody.password
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log(`- Đăng nhập thành công. Token: ${token.substring(0, 15)}...`);

    // 4. Chọn sản phẩm mẫu: ưu tiên sản phẩm còn hàng trong kho (quantity > 3)
    const [stockRows] = await db.query(
      'SELECT p.product_id, p.name, p.price, i.quantity FROM Product p JOIN Inventory i ON p.product_id = i.product_id WHERE i.quantity > 3 ORDER BY i.quantity DESC LIMIT 1'
    );
    if (!stockRows.length) {
      throw new Error('Cơ sở dữ liệu không có sản phẩm nào còn hàng để test');
    }
    const product = stockRows[0];
    const productId = product.product_id;
    console.log(`- Sử dụng sản phẩm ID: ${productId} (${product.name}, Còn: ${product.quantity} cái)`);

    // 5. Thêm vào giỏ hàng
    let addCartRes = await fetch(`${base}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: productId, quantity: 1 })
    });
    console.log(`- Thêm vào giỏ hàng: ${addCartRes.status} (Expected: 200)`);

    // 6. Lấy store ID hợp lệ
    let storeRes = await fetch(`${base}/stores`);
    const storeData = await storeRes.json();
    const storeList = storeData.stores || storeData || [];
    if (storeList.length === 0) {
      throw new Error('Không có chi nhánh cửa hàng nào trong DB để test');
    }
    const store = storeList[0];
    const storeId = store.store_id || store.id;
    console.log(`- Sử dụng cửa hàng ID: ${storeId} (${store.name})`);

    // 7. Tạo đơn hàng (Checkout)
    let orderRes = await fetch(`${base}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        address: '123 Test Street, Hanoi',
        delivery_method: 'delivery',
        store_id: storeId
      })
    });
    const orderData = await orderRes.json();
    console.log(`- Đặt hàng từ giỏ hàng: ${orderRes.status} (Expected: 200/201)`);
    const order = orderData.order;
    const orderId = order.order_id || order.id;
    const payable = Number(orderData.pricing?.total_payable ?? order.total_price ?? order.total_amount ?? 0);
    console.log(`  Mã đơn hàng vừa tạo: ${orderId}, Số tiền: ${payable}`);

    // 8. Tạo payment với bank_transfer (PENDING)
    let createPaymentRes = await fetch(`${base}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        order_id: orderId,
        method: 'bank_transfer',
        amount: payable
      })
    });
    const paymentData = await createPaymentRes.json();
    console.log(`- Tạo Payment PENDING: ${createPaymentRes.status} (Expected: 201)`);
    console.log(`  Phương thức: ${paymentData.payment?.method || 'N/A'}, Trạng thái: ${paymentData.payment?.status || 'N/A'}`);

    // Kiểm tra trạng thái đơn hàng (phải là PENDING)
    const [orderRowBefore] = await db.query('SELECT status FROM `Order` WHERE order_id = ?', [orderId]);
    console.log(`  Trạng thái đơn hàng trong DB trước xác nhận: ${orderRowBefore[0]?.status} (Expected: PENDING)`);

    // Get Admin Token for confirmation
    let adminToken = token;
    try {
      let adminLoginRes = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin_demo', password: 'admin123' })
      });
      const adminLoginData = await adminLoginRes.json();
      if (adminLoginRes.status === 200 && adminLoginData.token) {
        adminToken = adminLoginData.token;
      } else {
        const adminUsername = `admin_pay_${randomSuffix}`;
        await fetch(`${base}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: adminUsername,
            password: 'admin_password',
            email: `admin_pay_${randomSuffix}@example.com`,
            role_name: 'admin'
          })
        });
        const [admRows] = await db.query('SELECT verification_token FROM User WHERE username = ?', [adminUsername]);
        const admToken = admRows[0]?.verification_token;
        await fetch(`${base}/auth/verify-email?token=${admToken}`);
        let admLogin = await fetch(`${base}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: adminUsername, password: 'admin_password' })
        });
        const admLoginData = await admLogin.json();
        if (admLoginData.token) {
          adminToken = admLoginData.token;
        }
      }
    } catch (e) {
      console.error('Lỗi chuẩn bị admin token:', e);
    }

    // 9. Giả lập xác nhận thanh toán qua API confirmPayment
    let confirmRes = await fetch(`${base}/payments/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ order_id: orderId })
    });
    const confirmData = await confirmRes.json();
    console.log(`- Gọi API xác nhận thanh toán (Confirm): ${confirmRes.status} (Expected: 200)`);
    
    // Kiểm tra kết quả trả về
    console.log(`  Trạng thái thanh toán mới: ${confirmData.payment?.status} (Expected: PAID)`);
    console.log(`  Trạng thái đơn hàng mới: ${confirmData.order?.status} (Expected: CONFIRMED)`);

    // 10. Truy vấn DB trực tiếp để đối soát dữ liệu
    const [orderRowAfter] = await db.query('SELECT status FROM `Order` WHERE order_id = ?', [orderId]);
    const [paymentRowAfter] = await db.query('SELECT status, paid_at FROM `Payment` WHERE order_id = ?', [orderId]);
    
    console.log(`\n- Kết quả thực tế trong DB sau khi chạy confirm:`);
    console.log(`  + Trạng thái đơn hàng: ${orderRowAfter[0]?.status} (Expected: CONFIRMED)`);
    console.log(`  + Trạng thái thanh toán: ${paymentRowAfter[0]?.status} (Expected: PAID)`);
    console.log(`  + Thời gian thanh toán: ${paymentRowAfter[0]?.paid_at}`);

    if (orderRowAfter[0]?.status === 'CONFIRMED' && paymentRowAfter[0]?.status === 'PAID') {
      console.log('\n=== KIỂM THỬ CỔNG THANH TOÁN THÀNH CÔNG RỰC RỠ! ===');
      process.exit(0);
    } else {
      console.error('\n=== THẤT BẠI: DỮ LIỆU DB CHƯA ĐÚNG KỲ VỌNG! ===');
      process.exit(1);
    }
  } catch (error) {
    console.error('\nLỖI KHI CHẠY KIỂM THỬ:', error);
    process.exit(1);
  }
})();
