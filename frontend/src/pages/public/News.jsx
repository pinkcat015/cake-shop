import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import RevealOnScroll from '../../components/RevealOnScroll';
import { Calendar, Tag, ArrowRight, Mail } from 'lucide-react';

const News = () => {
  const [emailSub, setEmailSub] = useState('');

  const featuredNews = {
    id: 1,
    tag: 'Sự kiện',
    title: 'Khai Trương Chi Nhánh Mới Tại Trung Tâm Quận 1 - TP. Hồ Chí Minh',
    date: '28/06/2026',
    desc: 'Scarlett Bakery chính thức mở rộng không gian thưởng thức trà bánh Pháp lãng mạn ngay giữa lòng trung tâm Quận 1. Với thiết kế tân cổ điển sang trọng và ưu đãi tặng ngay 1 bánh ngọt bất kỳ cho 100 khách hàng đầu tiên, đây chắc chắn là điểm đến lý tưởng cho những người yêu thích bánh ngọt chuẩn Pháp.',
    img: 'https://images.unsplash.com/photo-1581339399838-2a120c18bba3?q=80&w=800',
  };

  const newsItems = [
    {
      id: 2,
      tag: 'Khuyến mãi',
      title: 'Happy Hour Giảm 15% Toàn Bộ Bánh Tươi Mỗi Chiều',
      date: '25/06/2026',
      desc: 'Tận hưởng khung giờ vàng hạnh phúc từ 16h đến 18h hàng ngày tại tất cả chi nhánh Scarlett Bakery. Toàn bộ các dòng bánh sừng bò, bánh mì nướng tơi thơm bơ sẽ được giảm 15% tự động.',
      img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600',
    },
    {
      id: 3,
      tag: 'Sản phẩm mới',
      title: 'Ra Mắt Dòng Croissant Phết Bơ Tỏi Nướng Giòn Kiểu Pháp',
      date: '20/06/2026',
      desc: 'Sự kết hợp độc đáo giữa lớp vỏ bánh sừng bò ngàn lớp xốp giòn chuẩn Pháp và hương vị sốt bơ tỏi thơm lừng Á Đông. Hiện đã sẵn sàng trên kệ để phục vụ các thực khách sành ăn.',
      img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600',
    },
    {
      id: 4,
      tag: 'Bí quyết',
      title: 'Nghệ Thuật Lên Men Bột Tự Nhiên Cho Ổ Sourdough Hoàn Hảo',
      date: '15/06/2026',
      desc: 'Cùng thợ bánh trưởng của Scarlett khám phá hành trình 36 tiếng nuôi men tự nhiên, giúp tạo nên lớp vỏ giòn dai và ruột bánh xốp ẩm cùng hương vị chua thanh tự nhiên đầy cuốn hút.',
      img: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=600',
    }
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailSub.trim()) {
      alert(`Cảm ơn bạn đã đăng ký! Bản tin Scarlett sẽ được gửi tới email: ${emailSub}`);
      setEmailSub('');
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroOverlay}>
          <div style={styles.heroContent}>
            <p style={styles.heroSubtitle}>SCARLETT JOURNAL</p>
            <h1 style={styles.heroTitle}>Tin Tức & Sự Kiện</h1>
            <p style={styles.heroDesc}>
              Nơi chia sẻ các câu chuyện làm bánh, chương trình ưu đãi mới nhất và sự kiện đặc sắc từ bếp lò Scarlett Bakery.
            </p>
          </div>
        </div>
      </section>

      <main style={styles.container}>
        
        {/* FEATURED POST */}
        <section style={styles.featuredSection}>
          <RevealOnScroll>
            <div style={styles.featuredCard}>
              <div style={styles.featuredImgWrap}>
                <img src={featuredNews.img} alt={featuredNews.title} style={styles.featuredImg} />
                <span style={styles.tagBadge}>{featuredNews.tag}</span>
              </div>
              <div style={styles.featuredContent}>
                <div style={styles.metaRow}>
                  <span style={styles.metaItem}><Calendar size={14} style={{ marginRight: '6px' }} /> {featuredNews.date}</span>
                </div>
                <h2 style={styles.featuredTitle}>{featuredNews.title}</h2>
                <p style={styles.featuredDesc}>{featuredNews.desc}</p>
                <button 
                  onClick={() => alert('Chi tiết bài viết đang được cập nhật')} 
                  style={styles.readMoreBtn}
                >
                  Đọc Chi Tiết <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </button>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* NEWS LIST GRID */}
        <section style={styles.gridSection}>
          <h3 style={styles.sectionHeading}>Bài Viết Khác</h3>
          <div style={styles.grid}>
            {newsItems.map(item => (
              <RevealOnScroll key={item.id}>
                <article style={styles.newsCard}>
                  <div style={styles.cardImgWrap}>
                    <img src={item.img} alt={item.title} style={styles.cardImg} />
                    <span style={styles.cardTag}>{item.tag}</span>
                  </div>
                  <div style={styles.cardBody}>
                    <div style={styles.cardMeta}>
                      <Calendar size={12} style={{ marginRight: '4px', color: '#999' }} />
                      <span>{item.date}</span>
                    </div>
                    <h4 style={styles.cardTitle}>{item.title}</h4>
                    <p style={styles.cardDesc}>{item.desc}</p>
                    <button 
                      onClick={() => alert('Chi tiết bài viết đang được cập nhật')} 
                      style={styles.cardLink}
                    >
                      Đọc tiếp →
                    </button>
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        {/* NEWSLETTER SUBSCRIPTION BLOCK */}
        <RevealOnScroll>
          <section style={styles.subscribeBlock}>
            <div style={styles.subContent}>
              <div style={styles.mailIconCircle}>
                <Mail size={22} style={{ color: '#6b1111' }} />
              </div>
              <h3 style={styles.subTitle}>Nhận Bản Tin Ngọt Ngào Từ Scarlett</h3>
              <p style={styles.subText}>
                Đăng ký nhận email để cập nhật các công thức làm bánh độc quyền, tin tức ưu đãi và sự kiện sắp diễn ra sớm nhất.
              </p>
              <form onSubmit={handleSubscribe} style={styles.subForm}>
                <input 
                  type="email" 
                  placeholder="Nhập địa chỉ email của bạn..." 
                  value={emailSub}
                  onChange={(e) => setEmailSub(e.target.value)}
                  style={styles.subInput}
                  required
                />
                <button type="submit" style={styles.subButton}>Đăng ký</button>
              </form>
            </div>
          </section>
        </RevealOnScroll>

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
  heroSection: {
    height: '65vh',
    width: '100%',
    backgroundImage: 'url("https://i.pinimg.com/736x/d4/a5/cf/d4a5cf03705751dacc0f176359b1b07b.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 20px',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: '16px',
    color: '#f4d7b0', // Gold/sand color like Home's subtitle
    letterSpacing: '3px',
    textTransform: 'uppercase',
    marginBottom: '16px',
    fontWeight: 'bold',
    fontFamily: "'Manrope', sans-serif",
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '48px',
    color: '#fff',
    margin: '0 0 16px 0',
    fontWeight: 'bold',
  },
  heroDesc: {
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: '1.7',
    maxWidth: '540px',
    margin: '0 auto',
    fontFamily: "'Manrope', sans-serif",
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '60px 24px 80px',
  },

  // FEATURED POST
  featuredSection: {
    marginBottom: '60px',
  },
  featuredCard: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    backgroundColor: '#fff',
    border: '1px solid rgba(107, 17, 17, 0.08)',
    borderRadius: '28px',
    overflow: 'hidden',
    boxShadow: '0 15px 45px rgba(107, 17, 17, 0.03)',
    alignItems: 'stretch',
    flexWrap: 'wrap',
  },
  featuredImgWrap: {
    position: 'relative',
    height: '420px',
    overflow: 'hidden',
  },
  featuredImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  tagBadge: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    backgroundColor: '#6b1111',
    color: '#fff',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  featuredContent: {
    padding: '40px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    color: '#999',
    fontSize: '13px',
    marginBottom: '16px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
  },
  featuredTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '28px',
    color: '#333',
    margin: '0 0 16px 0',
    fontWeight: '800',
    lineHeight: '1.35',
  },
  featuredDesc: {
    fontSize: '14px',
    lineHeight: '1.75',
    color: '#555',
    marginBottom: '28px',
  },
  readMoreBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#6b1111',
    color: '#fff',
    border: 'none',
    padding: '12px 28px',
    borderRadius: '30px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 6px 18px rgba(107, 17, 17, 0.2)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },

  // GRID SECTION
  gridSection: {
    marginBottom: '60px',
  },
  sectionHeading: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '28px',
    color: '#333',
    textAlign: 'left',
    marginBottom: '32px',
    fontWeight: '800',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '30px',
  },
  newsCard: {
    backgroundColor: '#fff',
    border: '1px solid #f0ece8',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 12px 30px rgba(0,0,0,0.02)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  cardImgWrap: {
    position: 'relative',
    height: '200px',
    overflow: 'hidden',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  cardTag: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    backgroundColor: '#fff',
    color: '#6b1111',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  },
  cardBody: {
    padding: '24px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: '#999',
    marginBottom: '10px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#333',
    margin: '0 0 12px 0',
    lineHeight: '1.4',
  },
  cardDesc: {
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#666',
    margin: '0 0 20px 0',
    flex: 1,
  },
  cardLink: {
    alignSelf: 'flex-start',
    background: 'none',
    border: 'none',
    color: '#6b1111',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    padding: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  // NEWSLETTER BLOCK
  subscribeBlock: {
    backgroundColor: '#FAF7F2',
    borderRadius: '28px',
    padding: '50px 30px',
    border: '1px solid #f0ece8',
  },
  subContent: {
    maxWidth: '600px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  mailIconCircle: {
    width: '54px',
    height: '54px',
    borderRadius: '50%',
    backgroundColor: '#fff0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  subTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '26px',
    color: '#333',
    margin: '0 0 12px 0',
    fontWeight: '800',
  },
  subText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#666',
    marginBottom: '28px',
  },
  subForm: {
    display: 'flex',
    width: '100%',
    gap: '10px',
    flexWrap: 'wrap',
  },
  subInput: {
    flex: 1,
    minWidth: '240px',
    padding: '14px 20px',
    borderRadius: '30px',
    border: '1px solid #ccc',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: '#fff',
  },
  subButton: {
    backgroundColor: '#6b1111',
    color: '#fff',
    border: 'none',
    padding: '14px 32px',
    borderRadius: '30px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(107,17,17,0.15)',
    transition: 'background-color 0.2s',
  },
};

export default News;
