import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="tlj-style">
      {/* Navbar Component */}
      <Navbar />

      {/* 2. Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}>
          <h1 style={styles.heroTitle}>SCARLETT</h1>
          <p style={styles.heroSubtitle}>FRESHLY BAKED EVERY DAY</p>
          <div style={styles.heroButtons}>
            <button style={styles.btnRed}>ORDER ONLINE</button>
            <button style={styles.btnWhite}>FIND A STORE</button>
          </div>
        </div>
      </section>

      {/* 3. Quick Navigation (Hệ thống phân quyền hiển thị ở đây) */}
      <section style={styles.quickNav}>
        {user?.role_name === 'admin' && (
          <div style={styles.adminAlert}>
            Bạn đang đăng nhập với quyền <strong>Quản trị viên</strong>. <Link to="/admin">Đi tới bảng điều khiển</Link>
          </div>
        )}
      </section>
    </div>
  );
};

const styles = {
  hero: {
    height: '100vh', // Chiếm toàn bộ chiều cao màn hình
    width: '100%',   // Chiếm toàn bộ chiều ngang
    backgroundImage: 'url("https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480_1_5x/img/recipe/ras/Assets/3971a92d9221db8a80ebf77849e6f7eb/Derivates/f49b9b314c188a2256b519b1c3e79b7730d6784a.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed', // Tạo hiệu ứng cuộn ảnh nhẹ (parallax) nếu muốn
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroOverlay: {
    // Đây là lớp phủ làm tối ảnh
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 0.5 là độ tối (từ 0 đến 1)
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 20px',
  },
  heroTitle: {
    fontSize: '64px', // Tăng kích thước cho bõ công làm full màn hình
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '30px',
    fontFamily: "'Playfair Display', serif", // Nhớ import font này nhé
  },
  heroButtons: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginTop: '30px',
  },
  heroSubtitle: {
    fontSize: '20px',
    color: '#eee',
    letterSpacing: '2px',
    marginBottom: '30px',
  },
  btnRed: {
    backgroundColor: '#6b1111',
    color: '#fff',
    border: 'none',
    padding: '12px 30px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  btnWhite: {
    backgroundColor: '#fff',
    color: '#6b1111',
    border: '1px solid #6b1111',
    padding: '12px 30px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  adminAlert: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    textAlign: 'center',
    margin: '20px',
  }
};

export default Home;