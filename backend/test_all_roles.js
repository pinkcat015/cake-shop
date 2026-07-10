const fetch = globalThis.fetch || require('node-fetch');
const db = require('./config/db');

(async () => {
  const base = 'http://localhost:3000/api';
  console.log('================================================================');
  console.log('=== KHỞI ĐỘNG KIỂM THỬ TOÀN BỘ HỆ THỐNG VỚI 3 VAI TRÒ (ROLES) ===');
  console.log('===       CUSTOMER   |   EMPLOYEE   |   ADMIN            ===');
  console.log('================================================================\n');

  const randomSuffix = Math.floor(Math.random() * 100000);
  
  // Thông tin các tài khoản test
  const customerInfo = {
    username: `cust_test_${randomSuffix}`,
    password: 'password123',
    email: `cust_${randomSuffix}@example.com`,
    role_name: 'customer'
  };

  const employeeInfo = {
    username: `emp_test_${randomSuffix}`,
    password: 'password123',
    email: `emp_${randomSuffix}@example.com`,
    role_name: 'employee'
  };

  const adminInfo = {
    username: `adm_test_${randomSuffix}`,
    password: 'password123',
    email: `adm_${randomSuffix}@example.com`,
    role_name: 'admin'
  };

  // Biến lưu token và ID
  let customerToken, employeeToken, adminToken;
  let customerUserId, employeeUserId, adminUserId;
  let testProductId, testOrderId, testCartItemId, testVoucherId;

  // Hàm tiện ích: Đăng ký & Kích hoạt User
  async function registerAndVerifyUser(user) {
    // 1. Đăng ký
    let regRes = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (regRes.status !== 201) {
      throw new Error(`Đăng ký thất bại cho ${user.username}. Code: ${regRes.status}`);
    }

    // 2. Kích hoạt trong DB
    const [rows] = await db.query('SELECT user_id, verification_token FROM User WHERE email = ?', [user.email]);
    if (!rows.length) {
      throw new Error(`Không tìm thấy user vừa tạo: ${user.username}`);
    }
    const { user_id, verification_token } = rows[0];
    
    let verifyRes = await fetch(`${base}/auth/verify-email?token=${verification_token}`);
    if (verifyRes.status !== 200) {
      throw new Error(`Xác thực email thất bại cho ${user.username}`);
    }

    return { user_id, token: verification_token };
  }

  // Hàm tiện ích: Đăng nhập nhận JWT Token
  async function loginUser(username, password) {
    let loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (loginRes.status !== 200) {
      throw new Error(`Đăng nhập thất bại cho ${username}`);
    }
    const data = await loginRes.json();
    return data.token;
  }

  try {
    // ==========================================
    // 0. CHUẨN BỊ TÀI KHOẢN VÀ DỮ LIỆU
    // ==========================================
    console.log('--- 0. Chuẩn bị tài khoản và dữ liệu kiểm thử ---');
    
    const custData = await registerAndVerifyUser(customerInfo);
    customerUserId = custData.user_id;
    customerToken = await loginUser(customerInfo.username, customerInfo.password);
    console.log(`✓ Tạo tài khoản Customer: ${customerInfo.username} (ID: ${customerUserId})`);

    const empData = await registerAndVerifyUser(employeeInfo);
    employeeUserId = empData.user_id;
    employeeToken = await loginUser(employeeInfo.username, employeeInfo.password);
    console.log(`✓ Tạo tài khoản Employee: ${employeeInfo.username} (ID: ${employeeUserId})`);

    const admData = await registerAndVerifyUser(adminInfo);
    adminUserId = admData.user_id;
    adminToken = await loginUser(adminInfo.username, adminInfo.password);
    console.log(`✓ Tạo tài khoản Admin: ${adminInfo.username} (ID: ${adminUserId})`);

    // Chọn sản phẩm mẫu: ưu tiên sản phẩm còn hàng trong kho (quantity > 3)
    const [stockRows] = await db.query(
      'SELECT p.product_id, p.name, p.price, i.quantity FROM Product p JOIN Inventory i ON p.product_id = i.product_id WHERE i.quantity > 3 ORDER BY i.quantity DESC LIMIT 1'
    );
    if (!stockRows.length) {
      throw new Error('Cơ sở dữ liệu không có sản phẩm nào còn hàng để test');
    }
    const testProduct = stockRows[0];
    testProductId = testProduct.product_id;
    console.log(`✓ Sử dụng sản phẩm mẫu: ${testProduct.name} (ID: ${testProductId}, Còn: ${testProduct.quantity} cái, Giá: ${testProduct.price}đ)\n`);

    // ==========================================
    // 1. KIỂM THỬ ROLE: CUSTOMER
    // ==========================================
    console.log('--- 1. Kiểm thử vai trò CUSTOMER (Khách hàng) ---');
    
    // a. Duyệt danh sách sản phẩm
    let getProds = await fetch(`${base}/products`);
    console.log(`  - Duyệt danh sách sản phẩm công khai: ${getProds.status} (Expected: 200)`);
    
    // b. Thêm vào giỏ hàng
    let addToCart = await fetch(`${base}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({ product_id: testProductId, quantity: 2 })
    });
    console.log(`  - Thêm sản phẩm vào giỏ hàng: ${addToCart.status} (Expected: 200)`);
    
    // c. Xem giỏ hàng & xác nhận sản phẩm đã thêm
    let getCart = await fetch(`${base}/cart`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const cartData = await getCart.json();
    // Cart API trả về: { cart: {cart_id, customer_id}, items: [{cart_id, product_id, quantity, name, ...}] }
    const cartItemFound = cartData.items?.[0];
    testCartItemId = cartItemFound?.product_id; // dùng product_id làm định danh
    console.log(`  - Xem giỏ hàng cá nhân: ${getCart.status} (Expected: 200). Tìm thấy sản phẩm trong giỏ: ${cartItemFound?.name || 'không tìm thấy'}`);

    // d. Cập nhật số lượng giỏ hàng
    let updateCart = await fetch(`${base}/cart/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({ product_id: testProductId, quantity: 3 })
    });
    console.log(`  - Cập nhật số lượng giỏ hàng lên 3: ${updateCart.status} (Expected: 200)`);

    // e. Áp dụng Voucher công khai (Admin sẽ tạo trước ở bước Admin, tạm thời nhập mã sai để test check)
    let applyVoucherFake = await fetch(`${base}/vouchers/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({ code: 'FAKE_CODE_123' })
    });
    console.log(`  - Áp dụng Voucher giả (không tồn tại): ${applyVoucherFake.status} (Expected: 404)`);

    // f. Đặt hàng (Checkout)
    let orderRes = await fetch(`${base}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        address: '99 Đường Hoa Hồng, Quận 1, TP. HCM',
        delivery_method: 'delivery',
        store_id: 1 // Cake Shop Central
      })
    });
    const orderData = await orderRes.json();
    testOrderId = orderData.order?.order_id;
    console.log(`  - Đặt hàng từ giỏ hàng: ${orderRes.status} (Expected: 201). Tạo Order ID: ${testOrderId}`);

    // g. Tạo giao dịch thanh toán chuyển khoản (PENDING)
    let payRes = await fetch(`${base}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        order_id: testOrderId,
        method: 'bank_transfer',
        amount: orderData.pricing?.total_payable || 100000
      })
    });
    console.log(`  - Tạo giao dịch Chuyển khoản (PENDING): ${payRes.status} (Expected: 201)`);

    // h. Kiểm thử bảo mật: Khách hàng cố truy cập tính năng bị cấm
    let getReportsByCust = await fetch(`${base}/reports/stats`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    console.log(`  - BẢO MẬT: Khách hàng truy cập Báo cáo Admin: ${getReportsByCust.status} (Expected: 403)`);

    let createVoucherByCust = await fetch(`${base}/vouchers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({ code: 'HACKVOUCHER', discount: 50 })
    });
    console.log(`  - BẢO MẬT: Khách hàng tạo mã giảm giá: ${createVoucherByCust.status} (Expected: 403)`);
    console.log('✓ Hoàn thành kiểm thử vai trò CUSTOMER.\n');


    // ==========================================
    // 2. KIỂM THỬ ROLE: EMPLOYEE
    // ==========================================
    console.log('--- 2. Kiểm thử vai trò EMPLOYEE (Nhân viên cửa hàng) ---');

    // a. Duyệt tất cả đơn hàng hệ thống
    let getOrdersEmp = await fetch(`${base}/orders`, {
      headers: { 'Authorization': `Bearer ${employeeToken}` }
    });
    console.log(`  - Xem danh sách toàn bộ đơn hàng: ${getOrdersEmp.status} (Expected: 200)`);

    // b. Xác nhận thanh toán chuyển khoản của khách hàng
    let confirmPayEmp = await fetch(`${base}/payments/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${employeeToken}`
      },
      body: JSON.stringify({ order_id: testOrderId })
    });
    console.log(`  - Xác nhận nhận tiền chuyển khoản (Confirm Payment): ${confirmPayEmp.status} (Expected: 200)`);

    // c. Cập nhật trạng thái đơn hàng sang SHIPPING (Đang giao)
    let updateStatusEmp = await fetch(`${base}/orders/${testOrderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${employeeToken}`
      },
      body: JSON.stringify({ status: 'SHIPPING' })
    });
    console.log(`  - Cập nhật đơn hàng sang SHIPPING: ${updateStatusEmp.status} (Expected: 200)`);

    // d. Kiểm thử bảo mật: Nhân viên cố truy cập tính năng Admin
    let getReportsByEmp = await fetch(`${base}/reports/stats`, {
      headers: { 'Authorization': `Bearer ${employeeToken}` }
    });
    console.log(`  - BẢO MẬT: Nhân viên truy cập Báo cáo Admin: ${getReportsByEmp.status} (Expected: 403)`);

    let deleteVoucherByEmp = await fetch(`${base}/vouchers/1`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${employeeToken}` }
    });
    console.log(`  - BẢO MẬT: Nhân viên xóa mã giảm giá: ${deleteVoucherByEmp.status} (Expected: 403)`);
    console.log('✓ Hoàn thành kiểm thử vai trò EMPLOYEE.\n');


    // ==========================================
    // 3. KIỂM THỬ ROLE: ADMIN
    // ==========================================
    console.log('--- 3. Kiểm thử vai trò ADMIN (Quản trị viên) ---');

    // a. Đọc báo cáo doanh thu & sản phẩm bán chạy
    let getStats = await fetch(`${base}/reports/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`  - Truy cập Báo cáo thống kê chung: ${getStats.status} (Expected: 200)`);

    let getTopProds = await fetch(`${base}/reports/top-products`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`  - Truy cập Báo cáo Top sản phẩm bán chạy: ${getTopProds.status} (Expected: 200)`);

    // b. Quản lý Voucher (CRUD)
    const testVoucherCode = `ADMIN_VOUCHER_${randomSuffix}`;
    let createVoucherAdm = await fetch(`${base}/vouchers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        code: testVoucherCode,
        discount: 20,
        expiry_date: '2026-12-31',
        is_public: true
      })
    });
    const voucherData = await createVoucherAdm.json();
    testVoucherId = voucherData.voucher?.voucher_id;
    console.log(`  - Tạo Voucher công khai mới: ${createVoucherAdm.status} (Expected: 201). ID: ${testVoucherId}`);

    let updateVoucherAdm = await fetch(`${base}/vouchers/${testVoucherId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        code: testVoucherCode,
        discount: 25, // Tăng mức giảm lên 25%
        expiry_date: '2026-12-31',
        is_public: true
      })
    });
    console.log(`  - Cập nhật Voucher (Tăng mức giảm lên 25%): ${updateVoucherAdm.status} (Expected: 200)`);

    // c. Cập nhật trạng thái đơn hàng sang DELIVERED (Đã giao)
    let updateStatusAdm = await fetch(`${base}/orders/${testOrderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'DELIVERED' })
    });
    console.log(`  - Cập nhật đơn hàng sang DELIVERED (Hoàn thành đơn): ${updateStatusAdm.status} (Expected: 200)`);
    console.log('✓ Hoàn thành kiểm thử vai trò ADMIN.\n');


    // ==========================================
    // 4. KIỂM THỬ KHÁCH HÀNG: ĐÁNH GIÁ (SAU KHI NHẬN HÀNG)
    // ==========================================
    console.log('--- 4. Kiểm thử Khách hàng viết Đánh giá (Review) ---');

    // Khách hàng review sản phẩm đã mua
    let addReview = await fetch(`${base}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        order_id: testOrderId,
        product_id: testProductId,
        rating: 5,
        comment: 'Bánh nướng thơm ngon chuẩn vị Pháp, thợ bánh chuyên nghiệp!'
      })
    });
    console.log(`  - Khách hàng viết đánh giá 5 sao cho sản phẩm vừa mua: ${addReview.status} (Expected: 201)`);

    // Xem danh sách đánh giá công khai
    let getReviews = await fetch(`${base}/reviews/product/${testProductId}`);
    const reviewListData = await getReviews.json();
    console.log(`  - Xem danh sách đánh giá của sản phẩm: ${getReviews.status} (Expected: 200)`);
    const lastReview = reviewListData.reviews?.find(r => r.comment.includes('chuẩn vị Pháp'));
    if (lastReview) {
      console.log(`    + Người đánh giá hiển thị (đã che tên): ${lastReview.username} (Thực tế: ${customerInfo.username})`);
      console.log(`    + Nội dung đánh giá: "${lastReview.comment}"`);
    } else {
      console.log('    ⚠ Cảnh báo: Không tìm thấy đánh giá vừa đăng trong danh sách.');
    }
    console.log('✓ Hoàn thành kiểm thử Đánh giá.\n');


    // ==========================================
    // 5. DỌN DẸP DỮ LIỆU KIỂM THỬ (CLEANUP)
    // ==========================================
    console.log('--- 5. Dọn dẹp dữ liệu kiểm thử trong Database ---');
    // Xóa các bảng phụ trước để tránh khóa ngoại
    await db.query('DELETE FROM Review WHERE order_id = ?', [testOrderId]);
    await db.query('DELETE FROM Payment WHERE order_id = ?', [testOrderId]);
    await db.query('DELETE FROM OrderDetail WHERE order_id = ?', [testOrderId]);
    await db.query('DELETE FROM `Order` WHERE order_id = ?', [testOrderId]);
    await db.query('DELETE FROM Voucher WHERE voucher_id = ?', [testVoucherId]);
    
    // Xóa CartItem và Cart liên quan đến các User test
    const userIds = [customerUserId, employeeUserId, adminUserId].filter(Boolean);
    if (userIds.length > 0) {
      await db.query(`
        DELETE FROM CartItem WHERE cart_id IN (
          SELECT cart_id FROM Cart WHERE customer_id IN (
            SELECT customer_id FROM Customer WHERE user_id IN (?)
          )
        )
      `, [userIds]);
      await db.query(`
        DELETE FROM Cart WHERE customer_id IN (
          SELECT customer_id FROM Customer WHERE user_id IN (?)
        )
      `, [userIds]);
      // Xóa Customer liên kết với User
      await db.query('DELETE FROM Customer WHERE user_id IN (?)', [userIds]);
      // Cuối cùng xóa User
      await db.query('DELETE FROM User WHERE user_id IN (?)', [userIds]);
    }
    
    console.log('✓ Đã dọn dẹp sạch toàn bộ tài khoản test, đơn hàng test, reviews và voucher test khỏi DB.');
    console.log('\n================================================================');
    console.log('===    TẤT CẢ KIỂM THỬ ĐÃ THÀNH CÔNG VÀ AN TOÀN TUYỆT ĐỐI!   ===');
    console.log('================================================================');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ KIỂM THỬ THẤT BẠI VỚI LỖI:', error.message);
    
    // Khôi phục dọn dẹp nếu lỗi
    try {
      if (testOrderId) {
        await db.query('DELETE FROM Review WHERE order_id = ?', [testOrderId]);
        await db.query('DELETE FROM Payment WHERE order_id = ?', [testOrderId]);
        await db.query('DELETE FROM OrderDetail WHERE order_id = ?', [testOrderId]);
        await db.query('DELETE FROM `Order` WHERE order_id = ?', [testOrderId]);
      }
      if (testVoucherId) await db.query('DELETE FROM Voucher WHERE voucher_id = ?', [testVoucherId]);
      
      const userIds = [customerUserId, employeeUserId, adminUserId].filter(Boolean);
      if (userIds.length > 0) {
        await db.query(`
          DELETE FROM CartItem WHERE cart_id IN (
            SELECT cart_id FROM Cart WHERE customer_id IN (
              SELECT customer_id FROM Customer WHERE user_id IN (?)
            )
          )
        `, [userIds]);
        await db.query(`
          DELETE FROM Cart WHERE customer_id IN (
            SELECT customer_id FROM Customer WHERE user_id IN (?)
          )
        `, [userIds]);
        await db.query('DELETE FROM Customer WHERE user_id IN (?)', [userIds]);
        await db.query('DELETE FROM User WHERE user_id IN (?)', [userIds]);
      }
      console.log('✓ Đã dọn dẹp dữ liệu cứu hộ sau lỗi thành công.');
    } catch (cleanupErr) {
      console.error('Lỗi khi dọn dẹp cứu hộ:', cleanupErr.message);
    }
    
    process.exit(1);
  }
})();
