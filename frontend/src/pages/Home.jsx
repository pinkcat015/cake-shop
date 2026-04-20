import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RevealOnScroll from '../components/RevealOnScroll';

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
      <RevealOnScroll>
        <section id="about" style={styles.aboutContainer}>
          <div style={styles.aboutWrapper}>
            
            {/* Cột trái: Cụm ảnh */}
            <div style={styles.aboutImageGrid}>
              <div style={styles.bigImageWrapper}>
                <RevealOnScroll delay={0}>
                  <img
                    src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000"
                    alt="Nhào bột"
                    style={styles.imageLarge}
                  />
                </RevealOnScroll>
              </div>
              <div style={styles.smallImagesColumn}>
                <RevealOnScroll delay={0.2}>
                  <img
                    src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1000"
                    alt="Bánh nướng"
                    style={styles.imageSmall}
                  />
                </RevealOnScroll>
                <RevealOnScroll delay={0.2}>
                  <img
                    src="https://images.unsplash.com/photo-1581339399838-2a120c18bba3?q=80&w=1000"
                    alt="Lò nướng"
                    style={styles.imageSmall}
                  />
                </RevealOnScroll>
              </div>
            </div>

    {/* Cột phải: Nội dung */}
    <RevealOnScroll delay={0.6} style={{ flex: 1, minWidth: '350px' }}>
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
    </RevealOnScroll>
  </div>
  
</section>
      </RevealOnScroll>

      {/* 5. Gallery Section */}
      <RevealOnScroll>
        <section id="gallery" style={styles.gallerySection}>
        <div style={styles.galleryContent}>
          <h2 style={styles.galleryTitle}>Hình ảnh cửa tiệm</h2>
          <p style={styles.galleryText}>
            Những khoảnh khắc bánh ngọt và không gian ấm áp tại Scarlett Bakery.
          </p>
          <div style={styles.galleryGrid}>
            <div style={styles.galleryCard}>
              <RevealOnScroll delay={0.2}>
                <img
                  src="https://i.pinimg.com/736x/6f/08/5c/6f085cae5a03a942ca5fa952addcbdc4.jpg"
                  alt="Bakery scene 1"
                  style={styles.galleryImage}
                />
              </RevealOnScroll>
              <p style={styles.galleryLabel}>Không gian ấm áp</p>
            </div>
            <div style={styles.galleryCard}>
              <RevealOnScroll delay={0.4}>
                <img
                  src="https://i.pinimg.com/736x/20/43/f4/2043f4c1bfc31b66bebb73794d380962.jpg"
                  alt="Bakery scene 2"
                  style={styles.galleryImage}
                />
              </RevealOnScroll>
              <p style={styles.galleryLabel}>Hương vị Pháp - Á Đông</p>
            </div>
            <div style={styles.galleryCard}>
              <RevealOnScroll delay={0.6}>
                <img
                  src="https://i.pinimg.com/1200x/1f/40/9c/1f409cb34bc8d1a0695b70381ef3690b.jpg"
                  alt="Bakery scene 3"
                  style={styles.galleryImage}
                />
              </RevealOnScroll>
              <p style={styles.galleryLabel}>Bánh tươi mỗi ngày</p>
            </div>
          </div>
        </div>
      </section>
      </RevealOnScroll>

      {/* 6. Specialties Section */}
      <RevealOnScroll>
        <section id="specialties" style={styles.sectionDark}>
        <div style={styles.sectionContent}>
          <h2 style={styles.specialtiesTitle}>Món đặc trưng của chúng tôi</h2>
          <div style={styles.grid}>
            <div style={styles.card}>
              <img
                src="https://i.pinimg.com/736x/6d/c8/62/6dc8624fdcd12d9972a1486e00d7440b.jpg"
                alt="French Croissant"
                style={styles.specialtyImage}
              />
              <h3 style={styles.specialtyName}>French Croissant</h3>
              <p style={styles.specialtyDescription}>Vỏ giòn tan, nhân bơ thơm lừng và độ xốp hoàn hảo.</p>
            </div>
            <div style={styles.card}>
              <img
                src="https://i.pinimg.com/1200x/ea/73/7f/ea737f6c7481e79675395df890d003fa.jpg"
                alt="Chocolate Tart"
                style={styles.specialtyImage}
              />
              <h3 style={styles.specialtyName}>Chocolate Tart</h3>
              <p style={styles.specialtyDescription}>Vị ngọt vừa phải, phủ chocolate đen đậm đà và caramel mềm mịn.</p>
            </div>
            <div style={styles.card}>
              <img
                src="https://i.pinimg.com/1200x/fa/58/95/fa58951244c4d9beeab8427f5b84c539.jpg"
                alt="Matcha Mille Crepe"
                style={styles.specialtyImage}
              />
              <h3 style={styles.specialtyName}>Matcha Mille Crepe</h3>
              <p style={styles.specialtyDescription}>Lớp bánh mỏng xếp chồng hòa cùng trà xanh Nhật Bản thanh mát.</p>
            </div>
          </div>
        </div>
      </section>
      </RevealOnScroll>

      {/* 7. Testimonial Section */}
      <RevealOnScroll>
        <section id="testimonial" style={styles.sectionLight}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>Khách hàng nói gì</h2>
          <blockquote style={styles.quote}>
            "Không nơi nào có bánh ngọt ngon như Scarlett. Mỗi lần đến đều thấy ấm áp và thư giãn."
          </blockquote>
          <p style={styles.quoteAuthor}>- Hằng, khách thân thiết</p>
        </div>
      </section>
      </RevealOnScroll>

      {/* 7. Footer */}
      <RevealOnScroll>
        <footer style={styles.footer}>
          <div style={styles.footerInner}>
            {/* Cột trái: Thương hiệu & Social */}
            <div style={styles.footerBrandBlock}>
              <div style={styles.footerLogo}>
                <span style={styles.footerLogoMain}>SCARLETT</span>
                <span style={styles.footerLogoScript}>bakery</span>
              </div>
              <p style={styles.footerBrandDesc}>
                Mang hương vị Pháp truyền thống đến gần hơn với tâm hồn Á Đông.
              </p>
              <div style={styles.socialRow}>
                <a href="/" aria-label="Facebook" style={styles.socialIcon}>f</a>
                <a href="/" aria-label="Instagram" style={styles.socialIcon}>◎</a>
                <a href="/" aria-label="LinkedIn" style={styles.socialIcon}>in</a>
              </div>
            </div>

            {/* Cột phải: Link điều hướng */}
            <div style={styles.footerLinksGrid}>
              <div style={styles.footerColumn}>
                <h4 style={styles.footerTitle}>BAKERY</h4>
                <a href="/" style={styles.footerLink}>Bread</a>
                <a href="/" style={styles.footerLink}>Cake</a>
                <a href="/" style={styles.footerLink}>Pastry</a>
                <a href="/" style={styles.footerLink}>Menu</a>
              </div>

              <div style={styles.footerColumn}>
                <h4 style={styles.footerTitle}>BEVERAGES</h4>
                <a href="/" style={styles.footerLink}>Coffee</a>
                <a href="/" style={styles.footerLink}>Tea & More</a>
                <a href="/" style={styles.footerLink}>Blended</a>
              </div>

              <div style={styles.footerColumn}>
                <h4 style={styles.footerTitle}>COMPANY</h4>
                <a href="/" style={styles.footerLink}>Our Story</a>
                <a href="/" style={styles.footerLink}>Locations</a>
                <a href="/" style={styles.footerLink}>Careers</a>
                <a href="/" style={styles.footerLink}>Contact Us</a>
              </div>
            </div>
          </div>

          <div style={styles.footerDivider} />

          <div style={styles.footerBottom}>
            <div style={styles.footerBottomLeft}>
              <span style={styles.footerCopy}>©2026 Scarlett Bakery. All Rights Reserved.</span>
              <div style={styles.footerMetaLinks}>
                <a href="/" style={styles.footerMetaLink}>Privacy Policy</a>
                <a href="/" style={styles.footerMetaLink}>Terms of Use</a>
                <a href="/" style={styles.footerMetaLink}>Cookie Notice</a>
              </div>
            </div>
            <div style={styles.footerBottomRight}>
              <div style={styles.footerOrder}>ORDER ONLINE NOW</div>
            </div>
          </div>
        </footer>
      </RevealOnScroll>
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
  specialtiesTitle: {
    fontSize: '38px',
    marginBottom: '24px',
    color: '#fff',
    fontFamily: "'Playfair Display', serif",
    letterSpacing: '0.4px',
  },
  sectionText: {
    fontSize: '18px',
    lineHeight: '1.8',
    color: '#555',
    maxWidth: '760px',
    margin: '0 auto',
  },
  galleryTitle: {
    fontSize: '42px',
    marginBottom: '18px',
    color: '#5a2118',
    fontFamily: "'Playfair Display', serif",
    letterSpacing: '0.4px',
  },
  galleryText: {
    fontSize: '18px',
    lineHeight: '1.8',
    color: '#5c4d44',
    maxWidth: '760px',
    margin: '0 auto',
    fontFamily: "'Manrope', sans-serif",
  },
  gallerySection: {
    padding: '80px 24px',
    background: '#f4bf86 ',
  },
  galleryContent: {
    maxWidth: '1100px',
    margin: '0 auto',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
    border: '1px solid rgba(166, 108, 73, 0.18)',
    borderRadius: '28px',
    padding: '42px 32px',
    backdropFilter: 'blur(2px)',
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
    textAlign: 'center',
    margin: 0,
    color: '#4b3f35',
    fontWeight: '600',
    fontSize: '16px',
    fontFamily: "'Manrope', sans-serif",
    letterSpacing: '0.2px',
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
  specialtyImage: {
    width: '100%',
    height: '190px',
    objectFit: 'cover',
    borderRadius: '12px',
    marginBottom: '16px',
    display: 'block',
  },
  specialtyName: {
    margin: '0 0 12px',
    color: '#2b201a',
    fontSize: '24px',
    fontFamily: "'Playfair Display', serif",
    letterSpacing: '0.3px',
  },
  specialtyDescription: {
    margin: 0,
    color: '#5a4a3f',
    lineHeight: '1.75',
    fontSize: '16px',
    fontFamily: "'Manrope', sans-serif",
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
  padding: '80px 24px 40px',
  backgroundColor: '#410b0b', // Màu đỏ rượu đặc trưng
  color: '#fff',
},
footerInner: {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: '1fr 2fr', // Chia tỉ lệ 1:2
  gap: '60px',
  alignItems: 'start',
},
footerBrandBlock: {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
},
footerLogo: {
  display: 'flex',
  alignItems: 'baseline',
  gap: '8px',
  color: '#f7f2e8',
},
footerLogoMain: {
  fontFamily: "'Playfair Display', serif",
  fontSize: '42px',
  fontWeight: '700',
  letterSpacing: '2px',
},
footerLogoScript: {
  fontFamily: "'Playfair Display', serif",
  fontSize: '24px',
  fontStyle: 'italic',
  opacity: 0.9,
},
footerBrandDesc: {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#f8f6f1',
  opacity: 0.8,
  maxWidth: '300px',
},
socialRow: {
  display: 'flex',
  gap: '15px',
  marginTop: '10px',
},
socialIcon: {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  textDecoration: 'none',
  fontSize: '14px',
  transition: '0.3s',
},
footerLinksGrid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '40px',
},
footerColumn: {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
},
footerTitle: {
  margin: '0 0 10px 0',
  color: '#f4d7b0', // Màu vàng đồng nhẹ
  fontSize: '14px',
  fontWeight: '700',
  letterSpacing: '2px',
  textTransform: 'uppercase',
},
footerLink: {
  color: '#f8f6f1',
  textDecoration: 'none',
  fontSize: '15px',
  opacity: 0.8,
  transition: '0.3s',
},
footerDivider: {
  maxWidth: '1200px',
  margin: '60px auto 30px',
  height: '1px',
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
},
footerBottom: {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '20px',
},
footerBottomLeft: {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
},
footerCopy: {
  fontSize: '13px',
  opacity: 0.6,
},
footerMetaLinks: {
  display: 'flex',
  gap: '20px',
},
footerMetaLink: {
  color: '#fff',
  textDecoration: 'none',
  fontSize: '13px',
  opacity: 0.6,
},
footerOrder: {
  fontSize: '16px',
  fontWeight: '700',
  color: '#f4d7b0',
  letterSpacing: '1px',
  border: '1px solid #f4d7b0',
  padding: '10px 25px',
  cursor: 'pointer',
}
};

export default Home;