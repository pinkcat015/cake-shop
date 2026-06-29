import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import RevealOnScroll from '../../components/RevealOnScroll';
import { Heart, Leaf, Tag, Check } from 'lucide-react';

const About = () => {
  return (
    <div style={styles.page}>
      <Navbar />

      {/* Inject custom CSS for hover effects and animations */}
      <style dangerouslySetInnerHTML={{__html: `
        .hover-card {
          transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .hover-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 22px 45px rgba(107, 17, 17, 0.06) !important;
          border-color: rgba(107, 17, 17, 0.18) !important;
        }
        .hover-btn {
          transition: all 0.3s ease;
        }
        .hover-btn:hover {
          background-color: #6b1111 !important;
          color: #fff !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(107, 17, 17, 0.2);
        }
        .img-zoom {
          transition: transform 0.5s ease;
        }
        .hover-card:hover .img-zoom {
          transform: scale(1.05);
        }
        .watermark-glow {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}} />

      <main style={styles.container}>
        
        {/* 1. HERO SECTION - Elegant About Us split */}
        <section style={styles.heroSection}>
          <div style={styles.heroGrid}>
            <div style={styles.heroTextCol}>
              <div style={styles.kickerRow}>
                <span style={styles.kickerLine} />
                <span style={styles.heroKicker}>CÂU CHUYỆN THƯƠNG HIỆU</span>
              </div>
              <span style={styles.heroScript}>Our Story</span>
              <h1 style={styles.heroTitle}>About Us</h1>
              <p style={styles.heroDesc}>
                Tại Scarlett Bakery, bánh ngọt không chỉ đơn thuần là một món tráng miệng — đó là một cuộc hành trình nghệ thuật của vị giác. Bắt đầu từ tình yêu nồng nhiệt với ẩm thực Pháp và sự tinh tế trong khẩu vị Á Đông, mỗi chiếc bánh của chúng tôi đều chứa đựng câu chuyện về sự tỉ mỉ, kiên trì và nguồn cảm hứng bất tận.
              </p>
              <p style={styles.heroDescSec}>
                Chúng tôi không ngừng tìm kiếm và kết hợp những công thức cổ điển chuẩn Pháp với các nguyên liệu hữu cơ hảo hạng từ địa phương để mang đến những chiếc bánh nướng tươi ngon nhất mỗi ngày.
              </p>
              <div style={styles.signatureBlock}>
                <span style={styles.signatureTitle}>Đồng sáng lập bởi</span>
                <div style={styles.signature}>The Scarlett Team</div>
              </div>
            </div>

            <div style={styles.heroImgCol}>
              <div className="watermark-glow" style={styles.watercolorBg}>
                <div style={styles.imgOffsetFrame}>
                  <img 
                    src="https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=600" 
                    alt="Scarlett sweet pastries" 
                    style={styles.heroImg}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. THREE CORE VALUE CARDS SECTION */}
        <section style={styles.featuresSection}>
          <div style={styles.featuresHeader}>
            <span style={styles.featuresScript}>Giá Trị Cốt Lõi</span>
            <h2 style={styles.featuresHeading}>Điều Làm Nên Sự Khác Biệt</h2>
          </div>
          <div style={styles.featuresGrid}>
            <RevealOnScroll delay={0.1}>
              <div className="hover-card" style={styles.featureCard}>
                <div style={styles.iconCircle}>
                  <Heart size={22} style={{ color: '#6b1111' }} />
                </div>
                <h3 style={styles.featureTitle}>Hương Vị Tuyệt Hảo</h3>
                <p style={styles.featureDesc}>
                  Cấu trúc bánh mềm mịn, xốp tơi hòa quyện cùng vị ngọt dịu thanh tao từ đường mía tự nhiên, mang lại trải nghiệm vị giác nhẹ nhàng và say đắm.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.2}>
              <div className="hover-card" style={{ ...styles.featureCard, backgroundColor: '#FAF7F2' }}>
                <div style={{ ...styles.iconCircle, backgroundColor: '#f4eeea' }}>
                  <Leaf size={22} style={{ color: '#c59b27' }} />
                </div>
                <h3 style={styles.featureTitle}>Nguyên Liệu Tươi Sạch</h3>
                <p style={styles.featureDesc}>
                  Cam kết sử dụng bơ sữa hữu cơ nhập khẩu chính ngạch từ vùng Normandy (Pháp), kết hợp với hoa quả tươi sạch chọn lọc từ Đà Lạt mỗi ngày.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.3}>
              <div className="hover-card" style={styles.featureCard}>
                <div style={styles.iconCircle}>
                  <Tag size={22} style={{ color: '#6b1111' }} />
                </div>
                <h3 style={styles.featureTitle}>Ưu Đãi Đặc Biệt</h3>
                <p style={styles.featureDesc}>
                  Các chương trình ưu đãi tri ân thành viên thiết thực, dòng bánh sự kiện thiết kế giới hạn theo mùa mang lại nhiều trải nghiệm mới mẻ.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* 3. PREMIUM COMMITMENT TO QUALITY BANNER CARD */}
        <RevealOnScroll>
          <section style={styles.commitmentBanner}>
            <div style={styles.commitmentGrid}>
              <div style={styles.commitmentImgWrap}>
                <img 
                  src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600" 
                  alt="Our commitment to quality" 
                  style={styles.commitmentImg}
                />
              </div>
              <div style={styles.commitmentContent}>
                <div style={styles.kickerRow}>
                  <span style={{ ...styles.kickerLine, backgroundColor: '#6b1111' }} />
                  <span style={{ ...styles.heroKicker, color: '#6b1111' }}>CAM KẾT THƯƠNG HIỆU</span>
                </div>
                <span style={styles.commitmentScript}>Made with Love</span>
                <h2 style={styles.commitmentTitle}>Cam Kết Chất Lượng Từ Tâm</h2>
                <p style={styles.commitmentText}>
                  Mỗi mẻ bánh tại Scarlett đều được nướng tươi hoàn toàn bằng thủ công với số lượng giới hạn mỗi ngày nhằm đảm bảo độ giòn xốp hoàn hảo và giữ trọn hương vị tự nhiên nhất khi đến tay khách hàng.
                </p>
                <div style={styles.checkList}>
                  <div style={styles.checkItem}>
                    <div style={styles.checkCircleIcon}><Check size={14} style={{ color: '#fff' }} /></div>
                    <span style={styles.checkText}>Nói không với chất bảo quản, phụ gia và chất tạo màu nhân tạo.</span>
                  </div>
                  <div style={styles.checkItem}>
                    <div style={styles.checkCircleIcon}><Check size={14} style={{ color: '#fff' }} /></div>
                    <span style={styles.checkText}>Chỉ sử dụng men tự nhiên nguyên bản giúp dễ tiêu hóa và giữ được hương vị mộc mạc.</span>
                  </div>
                  <div style={styles.checkItem}>
                    <div style={styles.checkCircleIcon}><Check size={14} style={{ color: '#fff' }} /></div>
                    <span style={styles.checkText}>Chế biến thủ công bởi thợ làm bánh có chứng chỉ bánh ngọt Pháp danh tiếng.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </RevealOnScroll>

        {/* 4. SWEET DEALS AND OFFERS SECTION */}
        <section style={styles.dealsSection}>
          <div style={styles.dealsHeader}>
            <span style={styles.dealsScript}>Special Offer</span>
            <h2 style={styles.dealsTitle}>Ưu Đãi Ngọt Ngào Dành Riêng Cho Bạn</h2>
            <p style={styles.dealsSub}>Tận hưởng trọn vẹn những ưu đãi đặc quyền từ tiệm bánh Scarlett</p>
          </div>

          <div style={styles.dealsGrid}>
            <RevealOnScroll delay={0.1}>
              <div className="hover-card" style={styles.dealCard}>
                <div style={styles.dealImgWrap}>
                  <img 
                    src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=500" 
                    alt="Buy 2 Get 1 Offer" 
                    className="img-zoom"
                    style={styles.dealImg}
                  />
                  <span style={styles.dealTag}>Khuyến mãi</span>
                </div>
                <div style={styles.dealBody}>
                  <h3 style={styles.dealCardTitle}>Mua 2 Tặng 1 Toàn Bộ Dòng Bánh Tươi</h3>
                  <p style={styles.dealDesc}>
                    Áp dụng cho khách hàng mua sắm trực tiếp bánh ngọt, bánh sừng bò Pháp tại tất cả hệ thống cửa hàng vào ngày cuối tuần.
                  </p>
                  <div style={styles.dealFooter}>
                    <span style={styles.badge}>Chủ Nhật hàng tuần</span>
                    <Link to="/products" className="hover-btn" style={styles.dealBtn}>Mua ngay</Link>
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.2}>
              <div className="hover-card" style={styles.dealCard}>
                <div style={styles.dealImgWrap}>
                  <img 
                    src="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=500" 
                    alt="Seasonal Chestnut Cake" 
                    className="img-zoom"
                    style={styles.dealImg}
                  />
                  <span style={{ ...styles.dealTag, backgroundColor: '#FAF7F2', color: '#c59b27' }}>Theo mùa</span>
                </div>
                <div style={styles.dealBody}>
                  <h3 style={styles.dealCardTitle}>Dòng Bánh Kem Hạt Dẻ Giới Hạn</h3>
                  <p style={styles.dealDesc}>
                    Thưởng thức hương vị bánh kem nướng hạt dẻ bùi ngậy đặc sắc chỉ phục vụ duy nhất trong tháng này.
                  </p>
                  <div style={styles.dealFooter}>
                    <span style={{ ...styles.badge, backgroundColor: '#fff9f0', color: '#b45309' }}>Số lượng có hạn</span>
                    <Link to="/products" className="hover-btn" style={styles.dealBtn}>Khám phá</Link>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      </main>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: '#fff',
    minHeight: '100vh',
    fontFamily: "'Manrope', sans-serif",
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '40px 24px 80px',
  },

  // HERO SECTION
  heroSection: {
    padding: '60px 0 80px',
  },
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '60px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  heroTextCol: {
    textAlign: 'left',
  },
  kickerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
  },
  kickerLine: {
    width: '24px',
    height: '2px',
    backgroundColor: '#c59b27',
  },
  heroKicker: {
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '2px',
    color: '#c59b27',
    textTransform: 'uppercase',
  },
  heroScript: {
    fontFamily: "'Great Vibes', cursive",
    fontSize: '44px',
    color: '#6b1111',
    display: 'block',
    marginBottom: '8px',
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '58px',
    color: '#2b201a',
    margin: '0 0 24px 0',
    fontWeight: '800',
    lineHeight: '1.05',
    letterSpacing: '-1.5px',
  },
  heroDesc: {
    fontSize: '16px',
    lineHeight: '1.85',
    color: '#555',
    marginBottom: '20px',
  },
  heroDescSec: {
    fontSize: '15px',
    lineHeight: '1.8',
    color: '#666',
    marginBottom: '32px',
  },
  signatureBlock: {
    borderLeft: '3px solid #6b1111',
    paddingLeft: '18px',
  },
  signatureTitle: {
    display: 'block',
    fontSize: '12px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '700',
    marginBottom: '4px',
  },
  signature: {
    fontFamily: "'Great Vibes', cursive",
    fontSize: '32px',
    color: '#6b1111',
  },
  heroImgCol: {
    display: 'flex',
    justifyContent: 'center',
  },
  watercolorBg: {
    position: 'relative',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(107,17,17,0.12) 0%, rgba(255,255,255,0) 70%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgOffsetFrame: {
    position: 'relative',
    borderRadius: '50%',
    padding: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 20px 45px rgba(107, 17, 17, 0.08)',
  },
  heroImg: {
    width: '240px',
    height: '240px',
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'block',
  },

  // VALUE CARDS
  featuresSection: {
    padding: '60px 0',
  },
  featuresHeader: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  featuresScript: {
    fontFamily: "'Great Vibes', cursive",
    fontSize: '32px',
    color: '#6b1111',
    display: 'block',
    marginBottom: '6px',
  },
  featuresHeading: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '34px',
    color: '#333',
    margin: 0,
    fontWeight: '800',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  featureCard: {
    backgroundColor: '#fffcfc',
    border: '1px solid rgba(107, 17, 17, 0.06)',
    borderRadius: '24px',
    padding: '44px 34px',
    textAlign: 'left',
    boxShadow: '0 12px 35px rgba(107, 17, 17, 0.015)',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  iconCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#fff0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '26px',
    boxShadow: '0 4px 10px rgba(107, 17, 17, 0.05)',
  },
  featureTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#2b201a',
    margin: '0 0 14px 0',
  },
  featureDesc: {
    fontSize: '14px',
    lineHeight: '1.65',
    color: '#666',
    margin: 0,
  },

  // COMMITMENT BANNER
  commitmentBanner: {
    margin: '70px 0',
  },
  commitmentGrid: {
    display: 'grid',
    gridTemplateColumns: '0.8fr 1.2fr',
    gap: '50px',
    backgroundColor: '#FAF7F2',
    borderRadius: '30px',
    padding: '48px',
    alignItems: 'center',
    border: '1px solid #f0ece8',
    boxShadow: '0 15px 40px rgba(0,0,0,0.01)',
  },
  commitmentImgWrap: {
    borderRadius: '24px',
    overflow: 'hidden',
    height: '350px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.06)',
  },
  commitmentImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  commitmentContent: {
    textAlign: 'left',
  },
  commitmentScript: {
    fontFamily: "'Great Vibes', cursive",
    fontSize: '34px',
    color: '#6b1111',
    display: 'block',
    marginBottom: '6px',
  },
  commitmentTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '32px',
    color: '#2b201a',
    margin: '0 0 18px 0',
    fontWeight: '800',
    lineHeight: '1.2',
  },
  commitmentText: {
    fontSize: '15px',
    lineHeight: '1.8',
    color: '#555',
    marginBottom: '26px',
  },
  checkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  checkCircleIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#6b1111',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkText: {
    fontSize: '14px',
    color: '#333',
    fontWeight: '500',
  },

  // SWEET DEALS
  dealsSection: {
    padding: '40px 0 20px',
  },
  dealsHeader: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  dealsScript: {
    fontFamily: "'Great Vibes', cursive",
    fontSize: '36px',
    color: '#6b1111',
    display: 'block',
    marginBottom: '4px',
  },
  dealsTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '36px',
    color: '#2b201a',
    margin: '0 0 12px 0',
    fontWeight: '800',
  },
  dealsSub: {
    fontSize: '15px',
    color: '#666',
    margin: 0,
  },
  dealsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '30px',
  },
  dealCard: {
    backgroundColor: '#fff',
    border: '1px solid #f0ece8',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 12px 30px rgba(0,0,0,0.02)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  dealImgWrap: {
    height: '260px',
    overflow: 'hidden',
    position: 'relative',
  },
  dealImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  dealTag: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    backgroundColor: '#6b1111',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  dealBody: {
    padding: '28px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  dealCardTitle: {
    fontSize: '19px',
    fontWeight: '700',
    color: '#2b201a',
    margin: '0 0 12px 0',
    lineHeight: '1.4',
  },
  dealDesc: {
    fontSize: '13.5px',
    lineHeight: '1.65',
    color: '#666',
    margin: '0 0 24px 0',
    flex: 1,
  },
  dealFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  badge: {
    backgroundColor: '#fff0f0',
    color: '#6b1111',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
  },
  dealBtn: {
    textDecoration: 'none',
    backgroundColor: '#FAF7F2',
    color: '#6b1111',
    border: '1px solid #6b1111',
    padding: '8px 20px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
};

export default About;
