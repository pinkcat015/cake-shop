const fetch = globalThis.fetch || require('node-fetch');
const db = require('./config/db');

(async () => {
  const base = 'http://localhost:3000/api';
  console.log('=== KHỞI ĐỘNG KIỂM THỬ TỰ ĐỘNG TÍNH NĂNG ĐÁNH GIÁ & PHẢN HỒI ===\n');

  try {
    const randomSuffix = Math.floor(Math.random() * 100000);
    const username = `review_user_${randomSuffix}`;
    const password = 'password123';
    const email = `review_user_${randomSuffix}@example.com`;

    // 1. Đăng ký người dùng mới
    console.log('[1] Đăng ký tài khoản kiểm thử...');
    let regRes = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email, role_name: 'customer' })
    });
    console.log(`- Đăng ký: ${regRes.status} (Expected: 201)`);
    const regJson = await regRes.json();
    console.log(`  Phản hồi đăng ký:`, regJson);

    // 2. Kích hoạt tài khoản trực tiếp trong DB
    console.log('[2] Kích hoạt tài khoản trong database...');
    const [userRows] = await db.query('SELECT user_id FROM User WHERE username = ?', [username]);
    const userId = userRows[0]?.user_id;
    if (!userId) throw new Error('Không thể tìm thấy user vừa tạo trong DB');
    
    // Kích hoạt user
    await db.query('UPDATE User SET is_verified = 1 WHERE user_id = ?', [userId]);
    console.log(`- Đã kích hoạt user_id: ${userId}`);

    // 3. Đăng nhập để lấy token
    console.log('[3] Đăng nhập...');
    let loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    if (!token) throw new Error('Đăng nhập thất bại, không nhận được token');
    console.log('- Đăng nhập thành công');

    // 4. Lấy một sản phẩm bất kỳ từ DB
    console.log('[4] Chọn sản phẩm thử nghiệm...');
    const [productRows] = await db.query('SELECT product_id, name FROM Product LIMIT 1');
    if (productRows.length === 0) throw new Error('Không tìm thấy sản phẩm nào trong DB để test');
    const productId = productRows[0].product_id;
    console.log(`- Chọn sản phẩm: ${productRows[0].name} (ID: ${productId})`);

    // 5. Tạo Customer và Order DELIVERED trực tiếp trong DB
    console.log('[5] Giả lập đơn hàng DELIVERED trong database...');
    // Tạo Customer
    let customerId;
    const [existingCust] = await db.query('SELECT customer_id FROM Customer WHERE user_id = ?', [userId]);
    if (existingCust.length > 0) {
      customerId = existingCust[0].customer_id;
    } else {
      const [custResult] = await db.query(
        'INSERT INTO Customer (user_id, name, phone) VALUES (?, ?, ?)',
        [userId, 'Review Tester', '0123456789']
      );
      customerId = custResult.insertId;
    }
    console.log(`- Khách hàng ID: ${customerId}`);

    // Tạo Order DELIVERED
    const [orderResult] = await db.query(
      'INSERT INTO `Order` (customer_id, total_price, status, delivery_method, order_date) VALUES (?, ?, ?, ?, NOW())',
      [customerId, 100000, 'DELIVERED', 'pickup']
    );
    const orderId = orderResult.insertId;
    console.log(`- Đơn hàng DELIVERED ID: ${orderId}`);

    // Tạo OrderDetail cho sản phẩm
    await db.query(
      'INSERT INTO OrderDetail (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [orderId, productId, 1, 100000]
    );
    console.log(`- Chi tiết đơn hàng đã liên kết sản phẩm ID: ${productId}`);

    // 6. Test API GET /reviews/product/:productId lúc chưa có đánh giá
    console.log('\n[6] Lấy danh sách reviews của sản phẩm khi chưa đánh giá...');
    let getReviewsRes = await fetch(`${base}/reviews/product/${productId}`);
    let getReviewsData = await getReviewsRes.json();
    console.log(`- GET /reviews/product/${productId}: ${getReviewsRes.status}`);
    console.log(`  Số review hiện tại: ${getReviewsData.reviews?.length}`);
    console.log(`  Điểm trung bình hiện tại: ${getReviewsData.stats?.average_rating} ⭐`);

    // 7. Gửi đánh giá hợp lệ qua API POST /reviews
    console.log('\n[7] Gửi đánh giá hợp lệ qua POST /reviews...');
    let reviewBody = {
      product_id: productId,
      order_id: orderId,
      rating: 5,
      comment: 'Bánh rất ngon, phục vụ chu đáo!'
    };
    let postReviewRes = await fetch(`${base}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewBody)
    });
    console.log(`- POST /reviews status: ${postReviewRes.status} (Expected: 201)`);
    const postReviewData = await postReviewRes.json();
    console.log(`  Phản hồi:`, postReviewData);
    if (postReviewRes.status !== 201) throw new Error('Gửi đánh giá hợp lệ bị từ chối');

    // 8. Chặn trùng: Gửi lại cùng đánh giá cho sản phẩm và đơn hàng đó
    console.log('\n[8] Gửi trùng đánh giá (chặn spam)...');
    let postDupRes = await fetch(`${base}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewBody)
    });
    console.log(`- POST /reviews (dup) status: ${postDupRes.status} (Expected: 400)`);
    const postDupData = await postDupRes.json();
    console.log(`  Phản hồi lỗi trùng:`, postDupData);
    if (postDupRes.status !== 400) throw new Error('Hệ thống không chặn được đánh giá trùng lặp');

    // 9. Gửi đánh giá cho sản phẩm không thuộc đơn hàng DELIVERED
    console.log('\n[9] Gửi đánh giá cho sản phẩm không thuộc đơn hàng DELIVERED của user...');
    let postFakeRes = await fetch(`${base}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        product_id: 99999, // ID không tồn tại hoặc không mua
        order_id: orderId,
        rating: 4,
        comment: 'Spam review!'
      })
    });
    console.log(`- POST /reviews (fake product) status: ${postFakeRes.status} (Expected: 403)`);
    const postFakeData = await postFakeRes.json();
    console.log(`  Phản hồi lỗi không mua hàng:`, postFakeData);
    if (postFakeRes.status !== 403) throw new Error('Hệ thống không chặn được review từ sản phẩm chưa mua');

    // 10. Gửi đánh giá với số sao không hợp lệ
    console.log('\n[10] Gửi đánh giá với số sao không hợp lệ (ví dụ: 6 sao)...');
    let postStarsRes = await fetch(`${base}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        product_id: productId,
        order_id: orderId,
        rating: 6,
        comment: 'Bánh quá xuất sắc, cho 6 sao!'
      })
    });
    console.log(`- POST /reviews (invalid stars) status: ${postStarsRes.status} (Expected: 400)`);
    const postStarsData = await postStarsRes.json();
    console.log(`  Phản hồi lỗi số sao:`, postStarsData);

    // 11. Test API GET /reviews/product/:productId sau khi có đánh giá (Kiểm tra che tên và trung bình sao)
    console.log('\n[11] Lấy danh sách reviews sau khi đã đánh giá thành công...');
    getReviewsRes = await fetch(`${base}/reviews/product/${productId}`);
    getReviewsData = await getReviewsRes.json();
    console.log(`- GET /reviews/product/${productId}: ${getReviewsRes.status}`);
    console.log(`  Thống kê mới:`, getReviewsData.stats);
    console.log(`  Danh sách nhận xét:`, JSON.stringify(getReviewsData.reviews, null, 2));

    // Kiểm tra che tên (ví dụ: review_user_xxxx -> r*****_user_xxxxx hoặc tương tự)
    const reviewer = getReviewsData.reviews.find(r => r.order_id === orderId);
    if (!reviewer) throw new Error('Không tìm thấy nhận xét vừa gửi trong danh sách');
    console.log(`  Tên người nhận xét thực tế: ${username}`);
    console.log(`  Tên người nhận xét hiển thị (đã che): ${reviewer.username}`);
    if (reviewer.username === username) {
      throw new Error('Tên người dùng không được che để bảo mật riêng tư!');
    }

    // 12. Test API GET /reviews/user (Lấy danh sách đánh giá của tôi)
    console.log('\n[12] Lấy danh sách đánh giá của tôi qua GET /reviews/user...');
    let myReviewsRes = await fetch(`${base}/reviews/user`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    let myReviewsData = await myReviewsRes.json();
    console.log(`- GET /reviews/user: ${myReviewsRes.status}`);
    console.log(`  Danh sách đánh giá của tôi:`, JSON.stringify(myReviewsData.reviews, null, 2));

    // 13. Dọn dẹp dữ liệu kiểm thử
    console.log('\n[13] Dọn dẹp dữ liệu kiểm thử...');
    await db.query('DELETE FROM Review WHERE order_id = ?', [orderId]);
    await db.query('DELETE FROM OrderDetail WHERE order_id = ?', [orderId]);
    await db.query('DELETE FROM `Order` WHERE order_id = ?', [orderId]);
    await db.query('DELETE FROM Customer WHERE user_id = ?', [userId]);
    await db.query('DELETE FROM User WHERE user_id = ?', [userId]);
    console.log('- Đã dọn dẹp sạch sẽ dữ liệu kiểm thử trong database.');

    console.log('\n=== TẤT CẢ KIỂM THỬ ĐÃ THÀNH CÔNG RỰC RỠ ===');
  } catch (error) {
    console.error('\n❌ KIỂM THỬ THẤT BẠI:', error);
    process.exit(1);
  } finally {
    db.end();
  }
})();
