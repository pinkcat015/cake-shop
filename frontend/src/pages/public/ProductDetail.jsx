import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api, { toAssetUrl } from '../../api/api';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getActivePromoForProduct, getScheduledPromoForProduct, getEffectivePrice } from '../../utils/promoUtils';

const formatDate = (value) => {
  if (!value) return 'Chưa xác định';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({ average_rating: 0, total_reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const loadProductAndPromotions = async () => {
      try {
        const [prodRes, promoRes, reviewsRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get('/promotions').catch(() => ({ data: { promotions: [] } })),
          api.get(`/reviews/product/${id}`).catch(() => ({ data: { reviews: [], stats: { average_rating: 0, total_reviews: 0 } } }))
        ]);
        setProduct(prodRes.data);
        setPromotions(promoRes.data?.promotions || []);
        setReviews(reviewsRes.data?.reviews || []);
        setRatingStats(reviewsRes.data?.stats || { average_rating: 0, total_reviews: 0 });
        setQuantity('1');
      } catch (error) {
        setError(error.response?.data?.message || 'Không thể tải chi tiết sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    loadProductAndPromotions();
  }, [id]);

  const activePromo = getActivePromoForProduct(product?.product_id, promotions);
  const scheduledPromo = getScheduledPromoForProduct(product?.product_id, promotions);

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.shell}>
        {/* Breadcrumb */}
        <div style={styles.breadcrumb}>
          <Link to="/" style={styles.breadLink}>Home</Link>
          <span style={styles.breadDivider}>/</span>
          <Link to="/products" style={styles.breadLink}>Menu</Link>
          <span style={styles.breadDivider}>/</span>
          <span style={styles.breadCurrent}>{product?.name}</span>
        </div>

        {error && <div style={styles.statusBox}>{error}</div>}
        {loading && <div style={styles.statusBox}>Đang tải...</div>}
        
        {!loading && product && (
          <>
            <div style={styles.detailGrid}>
            
            {/* CỘT TRÁI: ẢNH & THÀNH PHẦN (Giống TLJ) */}
            <div style={styles.leftColumn}>
              <div style={styles.imageContainer}>
                {product.image ? (
                  <img src={toAssetUrl(product.image)} alt={product.name} style={styles.mainImage} />
                ) : (
                  <div style={styles.placeholderImg}>Bakery</div>
                )}
              </div>
              
              {/* THÀNH PHẦN NẰM DƯỚI ẢNH */}
              <div style={styles.ingredientSection}>
                <h3 style={styles.sectionTitle}>Thành phần</h3>
                <p style={styles.descriptionText}>
                  {product.ingredients || 'Đang cập nhật thành phần cho sản phẩm này.'}
                </p>
              </div>
            </div>

            {/* CỘT PHẢI: TÊN, GIÁ, MÔ TẢ & NUTRITION */}
            <div style={styles.infoColumn}>
              <p style={styles.categoryLabel}>
                {product.category || 'Bakery'}
                {activePromo && (
                  <span style={{ marginLeft: 12, padding: '2px 8px', backgroundColor: '#fff0f0', color: '#9b1c1c', border: '1px solid #ffcccc', borderRadius: 4, fontSize: '0.75rem', fontWeight: 'bold' }}>
                    -{activePromo.discount}% HAPPY HOUR KHUYẾN MÃI
                  </span>
                )}
              </p>
              <h1 style={styles.productTitle}>{product.name}</h1>
              
              {/* Rating summary */}
              <div style={styles.ratingSummaryRow}>
                <span style={styles.ratingStars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ color: i < Math.round(ratingStats.average_rating) ? '#b89a5b' : '#ddd', marginRight: 2, fontSize: '1.1rem' }}>
                      ★
                    </span>
                  ))}
                </span>
                <span style={styles.ratingText}>
                  {ratingStats.total_reviews > 0 ? (
                    <><strong>{ratingStats.average_rating}</strong> / 5 ({ratingStats.total_reviews} đánh giá)</>
                  ) : (
                    <>(Chưa có đánh giá)</>
                  )}
                </span>
              </div>

              <div style={styles.accentLine}></div>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 15, marginBottom: 15 }}>
                {activePromo ? (
                  <>
                    <span style={{ fontSize: '1.4rem', color: '#888', textDecoration: 'line-through' }}>
                      {Number(product.price).toLocaleString('vi-VN')} đ
                    </span>
                    <span style={{ ...styles.priceTag, color: '#9b1c1c', margin: 0 }}>
                      {getEffectivePrice(product, promotions).toLocaleString('vi-VN')} <span style={{ fontSize: '1.2rem' }}>VND</span>
                    </span>
                  </>
                ) : (
                  <div style={styles.priceTag}>
                    {Number(product.price).toLocaleString('vi-VN')} <span style={{ fontSize: '1.2rem' }}>VND</span>
                  </div>
                )}
              </div>

              {scheduledPromo && (
                <div style={{ marginBottom: 20, padding: '10px 15px', backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: 6, fontSize: '0.85rem', color: '#555' }}>
                  🎉 <strong>Happy Hour:</strong> Giảm ngay <strong>{scheduledPromo.discount}%</strong> khi mua sản phẩm này trong khung giờ <strong>{scheduledPromo.start_time?.slice(0, 5)} - {scheduledPromo.end_time?.slice(0, 5)}</strong> hàng ngày!
                </div>
              )}
              <div style={{marginBottom:20, color:'#333', fontWeight:600}}>
                Còn: {Number(product.quantity ?? 0)} chiếc
              </div>

              {/* MÔ TẢ HƯƠNG VỊ */}
              <div style={styles.descriptionSection}>
                <h3 style={styles.sectionTitle}>Mô tả hương vị</h3>
                <p style={styles.descriptionText}>
                  {product.description || 'Sản phẩm được làm từ nguyên liệu thượng hạng, mang đến hương vị tươi mới mỗi ngày.'}
                </p>
              </div>

              {/* moved quantity input to action area */}

              {/* BẢNG DINH DƯỠNG NẰM BÊN PHẢI */}
              <div style={styles.nutritionSection}>
                <h3 style={styles.sectionTitle}>Nutrition Facts</h3>
                {product.nutritionFacts && product.nutritionFacts.length > 0 ? (
                  <div style={styles.tableWrapper}>
                    <table style={styles.nutritionTable}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Nutrient</th>
                          <th style={styles.th}>Amount</th>
                          <th style={styles.th}>Unit</th>
                          <th style={styles.th}>Per</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.nutritionFacts.map((n) => (
                          <tr key={n.nutrition_id}>
                            <td style={styles.td}>{n.name}</td>
                            <td style={styles.td}>{n.value}</td>
                            <td style={styles.td}>{n.unit}</td>
                            <td style={styles.td}>{n.per}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={styles.descriptionText}>Đang cập nhật dữ liệu dinh dưỡng.</p>
                )}
              </div>

              <div style={styles.actionArea}>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <label style={{display:'block'}}>Số lượng</label>
                  <input
                    type="number"
                    min={1}
                    max={product.quantity ?? 9999}
                    value={quantity}
                    onChange={(e) => {
                      // allow empty string while typing, remove non-digits
                      const raw = e.target.value;
                      const cleaned = raw.replace(/[^0-9]/g, '');
                      setQuantity(cleaned);
                      setError('');
                      setSuccessMessage('');
                    }}
                    style={{width:100, padding:8}}
                  />
                </div>

                {error && <div style={{color: 'red', marginTop: 8}}>{error}</div>}

                <button
                  style={styles.mainBtn}
                  disabled={adding}
                  onClick={async (event) => {
                  try {
                    setError('');
                    setSuccessMessage('');
                    setAdding(true);
                    if (!token) return navigate('/login');
                    const avail = Number(product.quantity ?? 0);
                    const qtyNum = parseInt(quantity || '0', 10);
                    if (!qtyNum || qtyNum <= 0) return setError('Vui lòng chọn số lượng hợp lệ');
                    if (qtyNum > avail) return setError(`Chỉ còn ${avail} chiếc trong kho`);
                    const rect = event.currentTarget?.getBoundingClientRect?.();
                    await api.post('/cart/add', { product_id: product.product_id, quantity: qtyNum });
                    setError('');
                    setSuccessMessage(`Đã thêm ${qtyNum} sản phẩm vào giỏ hàng`);
                    window.dispatchEvent(new CustomEvent('cart-added', {
                      detail: rect ? {
                        sourceRect: {
                          left: rect.left,
                          top: rect.top,
                          width: rect.width,
                          height: rect.height,
                        },
                        quantity: qtyNum,
                      } : { quantity: qtyNum },
                    }));
                    window.dispatchEvent(new Event('cart-updated'));
                  } catch (err) {
                    console.error(err);
                    setSuccessMessage('');
                    setError(err.response?.data?.message || 'Không thể thêm vào giỏ hàng');
                  } finally {
                    setAdding(false);
                  }
                }}>{adding ? 'ĐANG THÊM...' : 'THÊM VÀO GIỎ HÀNG'}</button>
                {successMessage && <div style={styles.successText}>{successMessage}</div>}
                <Link to="/products" style={styles.secondaryLink}>Quay lại thực đơn</Link>
              </div>
            </div>

          </div>

          {/* DANH SÁCH ĐÁNH GIÁ CỦA KHÁCH HÀNG */}
          <div style={styles.reviewsSection}>
            <h2 style={styles.reviewsTitle}>Nhận xét từ khách hàng ({reviews.length})</h2>
            
            {reviews.length === 0 ? (
              <div style={styles.noReviews}>
                <p style={{ margin: 0, fontWeight: '600' }}>Chưa có nhận xét nào cho sản phẩm này.</p>
                <p style={{ fontSize: '0.85rem', color: '#8a827b', marginTop: '6px', marginBottom: 0 }}>
                  Những khách hàng đã mua sản phẩm này có thể để lại nhận xét & đánh giá trong phần "Đơn hàng của tôi".
                </p>
              </div>
            ) : (
              <div style={styles.reviewsList}>
                {reviews.map((review) => (
                  <div key={review.review_id} style={styles.reviewCard}>
                    <div style={styles.reviewHeader}>
                      <div style={styles.reviewUser}>
                        <span style={styles.avatarCircle}>
                          {review.username ? review.username[0].toUpperCase() : 'A'}
                        </span>
                        <div>
                          <div style={styles.reviewUsername}>{review.username}</div>
                          <div style={styles.reviewDate}>{formatDate(review.created_at)}</div>
                        </div>
                      </div>
                      <div style={styles.reviewStars}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} style={{ color: i < review.rating ? '#b89a5b' : '#ddd', fontSize: '1rem', marginRight: 2 }}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p style={styles.reviewComment}>{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      </main>
    </div>
  );
};

const styles = {
  page: { backgroundColor: '#fff', minHeight: '100vh', fontFamily: "'Montserrat', sans-serif", margin: 0, padding: 0 },
  shell: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  
  breadcrumb: { display: 'flex', alignItems: 'center', marginBottom: '30px', fontSize: '13px', color: '#888' },
  breadLink: { textDecoration: 'none', color: '#888', fontWeight: '500' },
  breadDivider: { margin: '0 10px' },
  breadCurrent: { color: '#6b1111', fontWeight: '700' },

  detailGrid: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '60px', 
    alignItems: 'start',
  },

  // CỘT TRÁI
  leftColumn: { display: 'flex', flexDirection: 'column', gap: '30px' },
  imageContainer: { width: '100%', backgroundColor: '#fdfdfd', border: '1px solid #f0f0f0', borderRadius: '4px', overflow: 'hidden', maxHeight: '600px' },
  mainImage: { width: '100%', height: 'auto', display: 'block', objectFit: 'cover', maxHeight: '600px' },
  placeholderImg: { height: '450px', backgroundColor: '#6b1111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' },
  
  ingredientSection: { 
    padding: '25px', 
    backgroundColor: '#fafafa', 
    borderLeft: '4px solid #6b1111', // Nhấn mạnh bằng màu đỏ của bạn
    borderRadius: '2px'
  },

  // CỘT PHẢI
  infoColumn: { padding: '0' },
  categoryLabel: { color: '#b89a5b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', marginBottom: '10px' },
  productTitle: { fontFamily: "'Playfair Display', serif", fontSize: '3rem', color: '#222', margin: '0 0 15px 0', lineHeight: '1.2' },
  accentLine: { width: '600px', height: '2px', backgroundColor: '#6b1111', marginBottom: '25px' },
  priceTag: { fontSize: '2rem', fontWeight: '700', color: '#6b1111', marginBottom: '35px' },

  descriptionSection: { marginBottom: '40px' },
  nutritionSection: { borderTop: '1px solid #eee', paddingTop: '30px' },
  
  sectionTitle: { 
    fontSize: '14px', 
    textTransform: 'uppercase', 
    letterSpacing: '1px', 
    color: '#6b1111', // Tiêu đề các mục chuyển sang màu đỏ
    fontWeight: '700',
    marginBottom: '15px' 
  },
  descriptionText: { fontSize: '15px', color: '#555', lineHeight: '1.8', margin: 0 },

  // BẢNG DINH DƯỠNG
  tableWrapper: { marginTop: '10px', overflowX: 'auto' },
  nutritionTable: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  th: { textAlign: 'center', padding: '12px 8px', borderBottom: '2px solid #6b1111', color: '#222', fontWeight: '600' },
  td: { padding: '10px 8px', borderBottom: '1px solid #f0f0f0', color: '#666' },

  actionArea: { marginTop: '50px', display: 'flex', flexDirection: 'column', gap: '20px' },
  mainBtn: { 
    backgroundColor: '#6b1111', 
    color: '#fff', 
    border: 'none', 
    padding: '18px 0', 
    fontSize: '14px', 
    fontWeight: '700', 
    letterSpacing: '2px', 
    cursor: 'pointer', 
    width: '100%',
    transition: 'opacity 0.2s'
  },
  secondaryLink: { 
    color: '#333', 
    textDecoration: 'none', 
    fontSize: '16px', 
    fontWeight: '600', 
    alignSelf: 'flex-start',
    borderBottom: '1px solid #333'
  },
  successText: {
    color: '#2f7a2f',
    fontSize: '14px',
    fontWeight: '600',
  },

  statusBox: { textAlign: 'center', padding: '100px 0', fontSize: '1.2rem', color: '#888' },
  ratingSummaryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px'
  },
  ratingStars: {
    display: 'flex',
    alignItems: 'center'
  },
  ratingText: {
    fontSize: '0.9rem',
    color: '#7a716a',
    fontWeight: '500'
  },
  reviewsSection: {
    marginTop: '60px',
    borderTop: '1px solid #efe4dd',
    paddingTop: '40px'
  },
  reviewsTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2rem',
    color: '#6b1111',
    marginBottom: '30px'
  },
  noReviews: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: '#faf8f6',
    border: '1px solid #efe4dd',
    borderRadius: '12px',
    color: '#7a716a'
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  reviewCard: {
    backgroundColor: '#fff',
    border: '1px solid #efe4dd',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 8px 24px rgba(34, 18, 11, 0.02)'
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  reviewUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatarCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#f5eded',
    color: '#6b1111',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1rem',
    border: '1px solid #e1d0d0'
  },
  reviewUsername: {
    fontWeight: '700',
    color: '#333',
    fontSize: '0.95rem'
  },
  reviewDate: {
    fontSize: '0.8rem',
    color: '#8b847d',
    marginTop: '2px'
  },
  reviewStars: {
    display: 'flex',
    gap: '2px'
  },
  reviewComment: {
    margin: 0,
    fontSize: '0.95rem',
    color: '#4a433e',
    lineHeight: '1.6',
    paddingLeft: '52px'
  }
};

export default ProductDetail;