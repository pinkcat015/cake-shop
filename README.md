# Scarlett Cake Shop 🍰

Scarlett Cake Shop là ứng dụng web quản lý và mua bán bánh ngọt trực tuyến cao cấp, được xây dựng trên nền tảng **React (Vite)** cho Frontend, **Node.js (Express)** cho Backend và **MySQL** làm cơ sở dữ liệu.

Hệ thống hỗ trợ đầy đủ các tính năng xác thực tài khoản qua Email, phân quyền vai trò (Customer, Employee, Admin), áp dụng voucher giảm giá, hiển thị bản đồ chi nhánh thông minh và đặc biệt là tích hợp **cổng thanh toán VietQR động giả lập realtime**.

---

## 📁 Cấu trúc thư mục dự án

```
cake-shop/
├── backend/          # Mã nguồn Backend (Node.js/Express)
│   ├── config/       # Cấu hình kết nối DB và Mailer
│   ├── controllers/  # Logic điều hướng và nghiệp vụ API
│   ├── middleware/   # Middleware xác thực JWT & phân quyền
│   ├── models/       # Truy vấn dữ liệu MySQL
│   ├── routes/       # Định nghĩa các tuyến đường API RESTful
│   ├── app.js        # Entrypoint khởi tạo máy chủ Express
│   └── seed.js       # Script khởi tạo cơ sở dữ liệu & dữ liệu mẫu
│
├── frontend/         # Mã nguồn Frontend (React/Vite)
│   ├── src/
│   │   ├── api/      # Cấu hình Axios client kết nối Backend
│   │   ├── components/# Các UI component dùng chung (Navbar, Cart...)
│   │   ├── context/  # Quản lý State xác thực (AuthContext)
│   │   ├── pages/    # Các màn hình chức năng (Admin, Employee, Public)
│   │   ├── App.jsx   # Cấu hình Routing chính cho ứng dụng
│   │   └── main.jsx  # Điểm bắt đầu của ứng dụng React
│   └── package.json  # Dependencies của Frontend
│
└── README.md         # Hướng dẫn sử dụng dự án này
```

---

## 🛠️ Hướng dẫn cài đặt & Khởi chạy nhanh

### 1. Cấu hình biến môi trường
Tạo file `.env` trong thư mục `/backend` và điền cấu hình cơ sở dữ liệu và tài khoản mailer:

```ini
PORT=3000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cakeshop
JWT_SECRET=super_secure_secret_key_scarlett_bakery
EMAIL_USER=minhtrangmeomeo123@gmail.com
EMAIL_PASS=byieazbfodncipot
```

### 2. Khởi tạo Cơ sở dữ liệu MySQL
Mở terminal và thực thi lệnh sau để khởi tạo cấu trúc bảng và nạp dữ liệu mẫu (sản phẩm, tài khoản demo):

```bash
cd backend
npm install
node seed.js
```

### 3. Chạy máy chủ Backend
Khởi chạy máy chủ API Express tại cổng `3000`:

```bash
node app.js
```

### 4. Khởi chạy ứng dụng Frontend
Mở một cửa sổ terminal mới và khởi chạy Vite Development Server:

```bash
cd ../frontend
npm install
npm run dev
```

Ứng dụng sẽ hoạt động tại địa chỉ: **`http://localhost:5173`**

---

## 🔑 Tài khoản kiểm thử (Demo Accounts)

Hệ thống đã được nạp sẵn một số tài khoản demo sau khi bạn chạy `node seed.js`:

| Vai trò | Tên đăng nhập | Mật khẩu | Chức năng chính |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin_demo` | `admin123` | Quản trị sản phẩm, voucher, xem thống kê doanh thu |
| **Employee** | `employee_demo` | `employee123` | Lọc và duyệt đơn hàng, chỉnh sửa thông tin sản phẩm |
| **Customer** | (Tùy tạo) | (Tùy tạo) | Mua bánh, áp voucher, trải nghiệm thanh toán VietQR |

*Lưu ý: Khách hàng đăng ký mới sẽ nhận được link kích hoạt tài khoản gửi về email (hoặc in trực tiếp ra console của backend nhờ cơ chế mailer fallback).*

---

## 🧪 Hướng dẫn chạy kiểm thử tự động

Dự án đi kèm các bộ tích hợp kiểm thử tự động (integration tests) để đo kiểm chức năng API:

* **Kiểm thử các tính năng tài khoản, phân quyền, thống kê, voucher**:
  ```bash
  cd backend
  node test_completed_features.js
  ```

* **Kiểm thử luồng thanh toán VietQR động và xác nhận chuyển khoản realtime**:
  ```bash
  cd backend
  node test_payment_gateway.js
  ```
