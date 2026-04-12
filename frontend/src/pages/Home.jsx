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

      {/* 4. About Section */}
<section id="about" style={styles.aboutContainer}>
  <div style={styles.aboutWrapper}>
    
    {/* Cột trái: Cụm ảnh */}
    <div style={styles.aboutImageGrid}>
      <div style={styles.bigImageWrapper}>
        <img 
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000" 
          alt="Nhào bột" 
          style={styles.imageLarge} 
        />
      </div>
      <div style={styles.smallImagesColumn}>
        <img 
          src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1000" 
          alt="Bánh nướng" 
          style={styles.imageSmall} 
        />
        <img 
          src="https://images.unsplash.com/photo-1581339399838-2a120c18bba3?q=80&w=1000" 
          alt="Lò nướng" 
          style={styles.imageSmall} 
        />
      </div>
    </div>

    {/* Cột phải: Nội dung */}
    <div style={styles.aboutTextContent}>
      <h2 style={styles.brandTitle}>SCARLETT:</h2>
      <h3 style={styles.brandSubtitle}>French Asian Bakery</h3>
      
      <span style={styles.overline}>OUR STORY</span>
      <h4 style={styles.storyTitle}>Freshly Baked, Everyday</h4>
      
      <p style={styles.storyDescription}>
        Với cam kết chỉ sử dụng những nguyên liệu thượng hạng nhất, các sản phẩm của chúng tôi 
        nổi tiếng với hương vị độc bản và chất lượng lành mạnh. Những thợ làm bánh lành nghề 
        tạo ra hàng loạt món ngon nướng tươi mỗi ngày, sẵn sàng để khách hàng thưởng thức 
        trọn vẹn sự tinh tế.
      </p>
      
      <Link to="/story" style={styles.readMoreBtn}>READ OUR STORY</Link>
    </div>
  </div>
</section>

      {/* 5. Gallery Section */}
      <section id="gallery" style={styles.gallerySection}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>Hình ảnh cửa tiệm</h2>
          <p style={styles.sectionText}>
            Những khoảnh khắc bánh ngọt và không gian ấm áp tại Scarlett Bakery.
          </p>
          <div style={styles.galleryGrid}>
            <div style={styles.galleryCard}>
              <img
                src="https://images.unsplash.com/photo-1511689985-7e8e0f3cb15a?auto=format&fit=crop&w=900&q=80"
                alt="Bakery scene 1"
                style={styles.galleryImage}
              />
              <p style={styles.galleryLabel}>Sáng tạo mỗi ngày</p>
            </div>
            <div style={styles.galleryCard}>
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"
                alt="Bakery scene 2"
                style={styles.galleryImage}
              />
              <p style={styles.galleryLabel}>Hương vị Pháp - Á Đông</p>
            </div>
            <div style={styles.galleryCard}>
              <img
                src="https://images.unsplash.com/photo-1544378738-6d9902e81e73?auto=format&fit=crop&w=900&q=80"
                alt="Bakery scene 3"
                style={styles.galleryImage}
              />
              <p style={styles.galleryLabel}>Không gian đón khách</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Specialties Section */}
      <section id="specialties" style={styles.sectionDark}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitleLight}>Món đặc trưng của chúng tôi</h2>
          <div style={styles.grid}>
            <div style={styles.card}>
              <h3>French Croissant</h3>
              <p>Vỏ giòn tan, nhân bơ thơm lừng và độ xốp hoàn hảo.</p>
            </div>
            <div style={styles.card}>
              <h3>Chocolate Tart</h3>
              <p>Vị ngọt vừa phải, phủ chocolate đen đậm đà và caramel mềm mịn.</p>
            </div>
            <div style={styles.card}>
              <h3>Matcha Mille Crepe</h3>
              <p>Lớp bánh mỏng xếp chồng hòa cùng trà xanh Nhật Bản thanh mát.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Testimonial Section */}
      <section id="testimonial" style={styles.sectionLight}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>Khách hàng nói gì</h2>
          <blockquote style={styles.quote}>
            "Không nơi nào có bánh ngọt ngon như Scarlett. Mỗi lần đến đều thấy ấm áp và thư giãn."
          </blockquote>
          <p style={styles.quoteAuthor}>- Hằng, khách thân thiết</p>
        </div>
      </section>

      {/* 7. Footer */}
      <footer style={styles.footer}>
        <p>© 2026 Scarlett Bakery. Tất cả các quyền được bảo lưu.</p>
      </footer>
    </div>
  );
};

const styles = {
  aboutContainer: {
    padding: '100px 24px',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'center',
  },
  aboutWrapper: {
    maxWidth: '1200px',
    width: '100%',
    display: 'flex',
    flexDirection: 'row', // Chia làm 2 cột
    gap: '60px',
    alignItems: 'center',
    flexWrap: 'wrap', // Hỗ trợ mobile
  },
  aboutImageGrid: {
    flex: '1.2',
    display: 'flex',
    gap: '20px',
    minWidth: '400px',
  },
  bigImageWrapper: {
    flex: '2',
  },
  imageLarge: {
    width: '100%',
    height: '600px',
    objectFit: 'cover',
    borderRadius: '12px',
  },
  smallImagesColumn: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    justifyContent: 'center',
  },
  imageSmall: {
    width: '100%',
    height: '240px',
    objectFit: 'cover',
    borderRadius: '12px',
  },
  aboutTextContent: {
    flex: '1',
    textAlign: 'left',
    minWidth: '350px',
  },
  brandTitle: {
    fontSize: '42px',
    color: '#6b1111', 
    margin: 0,
    fontFamily: 'serif',
  },
  brandSubtitle: {
    fontSize: '42px',
    color: '#6b1111',
    marginTop: '5px',
    marginBottom: '40px',
    fontFamily: 'serif',
  },
  overline: {
    fontSize: '14px',
    letterSpacing: '2px',
    color: '#888',
    display: 'block',
    marginBottom: '15px',
  },
  storyTitle: {
    fontSize: '28px',
    color: '#444',
    marginBottom: '25px',
  },
  storyDescription: {
    fontSize: '16px',
    lineHeight: '1.8',
    color: '#666',
    marginBottom: '30px',
  },
  readMoreBtn: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#6b1111',
    textDecoration: 'none',
    borderBottom: '2px solid #6b1111',
    paddingBottom: '5px',
    letterSpacing: '1px',
  },
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
    // Lớp phủ làm tối ảnh
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
  },
  sectionLight: {
    padding: '80px 24px',
    backgroundColor: '#fff',
  },
  sectionDark: {
    padding: '80px 24px',
    backgroundColor: '#1f1a17',
    color: '#f4f1ed',
  },
  sectionContent: {
    maxWidth: '1100px',
    margin: '0 auto',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '36px',
    marginBottom: '20px',
    color: '#6b1111',
  },
  sectionTitleLight: {
    fontSize: '36px',
    marginBottom: '20px',
    color: '#fff',
  },
  sectionText: {
    fontSize: '18px',
    lineHeight: '1.8',
    color: '#555',
    maxWidth: '760px',
    margin: '0 auto',
  },
  gallerySection: {
    padding: '80px 24px',
    backgroundColor: '#f7f2ec',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px',
    marginTop: '40px',
  },
  galleryCard: {
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
    backgroundColor: '#fff',
    textAlign: 'left',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  galleryLabel: {
    padding: '18px 20px',
    margin: 0,
    color: '#4b3f35',
    fontWeight: '600',
    fontSize: '16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    marginTop: '40px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
    color: '#1f1a17',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  quote: {
    fontSize: '22px',
    fontStyle: 'italic',
    lineHeight: '1.8',
    maxWidth: '760px',
    margin: '0 auto 16px',
    color: '#333',
  },
  quoteAuthor: {
    color: '#6b1111',
    fontWeight: '600',
  },
  footer: {
    padding: '24px',
    backgroundColor: '#111',
    color: '#fff',
    textAlign: 'center',
  },
};

export default Home;