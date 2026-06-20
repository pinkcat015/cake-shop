import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { toAssetUrl } from '../../api/api';
import Navbar from '../../components/Navbar';

const formatDate = (value) => {
  if (!value) return 'Chưa xác định';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'SHIPPING':
      return 'Đang giao';
    case 'DELIVERED':
      return 'Đã giao';
    case 'CANCELLED':
      return 'Đã hủy';
    default:
      return 'Chờ xử lý';
  }
};

const getStatusStyles = (status) => {
  switch (status) {
    case 'CONFIRMED':
      return { backgroundColor: '#e6f4ea', color: '#137333', border: '1px solid #ceead6' };
    case 'SHIPPING':
      return { backgroundColor: '#e8f0fe', color: '#1a73e8', border: '1px solid #d2e3fc' };
    case 'DELIVERED':
      return { backgroundColor: '#e6f4ea', color: '#137333', border: '1px solid #ceead6' };
    case 'CANCELLED':
      return { backgroundColor: '#fce8e6', color: '#c5221f', border: '1px solid #fad2cf' };
    default:
      return { backgroundColor: '#fef7e0', color: '#b06000', border: '1px solid #fde8c4' };
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states for rating/feedback
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemForReview, setSelectedItemForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const loadOrdersAndReviews = async () => {
    try {
      const [ordersRes, reviewsRes] = await Promise.all([
        api.get('/orders/mine'),
        api.get('/reviews/user').catch(() => ({ data: { reviews: [] } }))
      ]);
      setOrders(ordersRes.data.orders || []);
      setMyReviews(reviewsRes.data.reviews || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrdersAndReviews();
  }, []);

  const submitReview = async () => {
    if (!selectedItemForReview) return;
    if (!comment.trim()) {
      setReviewError('Vui lòng nhập nội dung nhận xét');
      return;
    }
    setReviewError('');
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        product_id: selectedItemForReview.product_id,
        order_id: selectedItemForReview.order_id,
        rating,
        comment: comment.trim()
      });
      // reload reviews
      const reviewsRes = await api.get('/reviews/user').catch(() => ({ data: { reviews: [] } }));
      setMyReviews(reviewsRes.data.reviews || []);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setReviewError(err.response?.data?.message || 'Gửi đánh giá thất bại');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />

      {/* Hero Banner */}
      <section style={styles.heroBanner}>
        <p style={styles.heroOverline}>Scarlett Bakery</p>
        <h1 style={styles.heroTitle}>ĐƠN HÀNG CỦA TÔI</h1>
        <p style={styles.heroDesc}>
          Xem lại lịch sử mua sắm và chia sẻ đánh giá về những món bánh yêu thích của bạn.
        </p>
        <div style={{ marginTop: '20px' }}>
          <Link
            to="/products"
            style={styles.backLinkBanner}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f4d7b0';
              e.currentTarget.style.color = '#6b1111';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#f4d7b0';
            }}
          >
            TIẾP TỤC MUA HÀNG
          </Link>
        </div>
      </section>

      <main style={styles.container}>

        {loading && <div style={styles.statusBox}>Đang tải đơn hàng...</div>}
        {!loading && error && <div style={styles.errorBox}>{error}</div>}

        {!loading && !error && orders.length === 0 && (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>Bạn chưa có đơn hàng nào</h3>
            <p style={styles.emptyText}>Hãy đặt một vài món bánh yêu thích để xem lịch sử đơn tại đây.</p>
            <Link to="/products" style={styles.shopButton}>XEM SẢN PHẨM</Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div style={styles.list}>
            {orders.map((order) => {
              const itemCount = (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
              return (
                <article key={order.order_id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div>
                      <div style={styles.orderLabel}>Mã đơn #{order.order_id}</div>
                      <div style={styles.orderDate}>{formatDate(order.order_date)}</div>
                    </div>
                    <span style={{ ...styles.statusPill, ...getStatusStyles(order.status) }}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div style={styles.metaRow}>
                    <div style={styles.metaCol}>
                      <span style={styles.metaLabel}>Phương thức</span>
                      <span style={styles.metaValue}>{order.delivery_method === 'pickup' ? 'Nhận tại cửa hàng' : 'Giao tận nơi'}</span>
                    </div>
                    <div style={styles.metaCol}>
                      <span style={styles.metaLabel}>Chi nhánh</span>
                      <span style={styles.metaValue}>{order.store_name || 'Chưa xác định'}</span>
                    </div>
                    <div style={styles.metaCol}>
                      <span style={styles.metaLabel}>Số lượng</span>
                      <span style={styles.metaValue}>{itemCount} món</span>
                    </div>
                    <div style={styles.metaColRight}>
                      <span style={styles.metaLabelRight}>Tổng thanh toán</span>
                      <span style={styles.totalValue}>{Number(order.total_price || 0).toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>

                  {order.address && (
                    <div style={styles.addressBox}>
                      <strong style={styles.addressLabel}>Địa chỉ giao hàng:</strong> {order.address}
                    </div>
                  )}

                  <div style={styles.itemsSection}>
                    <div style={styles.itemsTitle}>Chi tiết món bánh</div>
                    <div style={styles.itemsGrid}>
                      {(order.items || []).map((item) => {
                        const hasReviewed = myReviews.some(
                          (r) => r.product_id === item.product_id && r.order_id === order.order_id
                        );
                        return (
                          <div key={`${order.order_id}-${item.product_id}`} style={styles.itemRow}>
                            <div style={styles.thumbWrap}>
                              {item.image ? (
                                <img src={toAssetUrl(item.image)} alt={item.name} style={styles.thumb} />
                              ) : (
                                <div style={styles.thumbFallback}>SC</div>
                              )}
                            </div>
                            <div style={styles.itemInfo}>
                              <div style={styles.itemName}>{item.name}</div>
                              <div style={styles.itemQty}>Số lượng: {item.quantity}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={styles.itemPrice}>
                                {Number(item.price * item.quantity).toLocaleString('vi-VN')} đ
                              </div>
                              {order.status === 'DELIVERED' && (
                                <div>
                                  {hasReviewed ? (
                                    <span style={styles.reviewedBadge}>
                                      ✓ Đã đánh giá
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setSelectedItemForReview({
                                          product_id: item.product_id,
                                          name: item.name,
                                          order_id: order.order_id
                                        });
                                        setRating(5);
                                        setComment('');
                                        setReviewError('');
                                        setIsModalOpen(true);
                                      }}
                                      style={styles.reviewBtn}
                                    >
                                      Viết đánh giá
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {isModalOpen && selectedItemForReview && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>Đánh giá sản phẩm</h3>
              <p style={styles.modalSubtitle}>{selectedItemForReview.name}</p>
              
              <div style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                      cursor: 'pointer',
                      fontSize: '2rem',
                      color: star <= rating ? '#b89a5b' : '#ddd',
                      transition: 'color 0.2s',
                      marginRight: 6
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              {reviewError && <div style={styles.modalError}>{reviewError}</div>}

              <textarea
                placeholder="Chia sẻ nhận xét của bạn về hương vị bánh, hình thức đóng gói nhé..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={styles.modalTextarea}
              />

              <div style={styles.modalActions}>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={styles.modalCancelBtn}
                >
                  HỦY
                </button>
                <button
                  onClick={submitReview}
                  disabled={submittingReview}
                  style={styles.modalSubmitBtn}
                >
                  {submittingReview ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #fffdfb 0%, #faf7f3 100%)', fontFamily: "'Montserrat', sans-serif" },
  container: { maxWidth: '1180px', margin: '0 auto', padding: '50px 20px 80px' },
  heroBanner: {
    backgroundColor: '#6b1111',
    padding: '64px 40px 56px',
    textAlign: 'center',
  },
  heroOverline: {
    fontSize: '12px',
    letterSpacing: '3px',
    color: '#f4d7b0',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '38px',
    color: '#fff',
    marginBottom: '14px',
    letterSpacing: '2px',
  },
  heroDesc: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.72)',
    maxWidth: '500px',
    margin: '0 auto',
    lineHeight: '1.7',
  },
  backLinkBanner: {
    display: 'inline-block',
    padding: '10px 24px',
    border: '1px solid #f4d7b0',
    color: '#f4d7b0',
    backgroundColor: 'transparent',
    textDecoration: 'none',
    fontSize: '11px',
    letterSpacing: '1.5px',
    fontWeight: '700',
    borderRadius: '999px',
    transition: 'all 0.2s ease',
  },
  statusBox: { textAlign: 'center', padding: '120px 0', color: '#8a827b' },
  errorBox: { backgroundColor: '#fff3f1', border: '1px solid #f0c6bf', color: '#8a2e22', padding: '16px 18px', borderRadius: '12px' },
  emptyState: { textAlign: 'center', padding: '88px 24px', backgroundColor: '#fff', border: '1px solid #f0e5df', borderRadius: '20px', boxShadow: '0 18px 40px rgba(107, 17, 17, 0.04)' },
  emptyTitle: { margin: '0 0 10px', fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#333' },
  emptyText: { margin: '0 0 24px', color: '#7a716a' },
  shopButton: { display: 'inline-flex', padding: '14px 20px', backgroundColor: '#6b1111', color: '#fff', textDecoration: 'none', fontWeight: '700', letterSpacing: '1.2px', borderRadius: '999px' },
  list: { display: 'grid', gap: '18px' },
  card: { backgroundColor: '#fff', border: '1px solid #efe5de', borderRadius: '24px', padding: '28px', boxShadow: '0 10px 30px rgba(107, 17, 17, 0.02)', marginBottom: '24px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '22px' },
  orderLabel: { 
    display: 'inline-block',
    fontWeight: '700', 
    color: '#6b1111', 
    backgroundColor: '#fbf5f5', 
    border: '1px solid #e8cccc',
    padding: '4px 10px', 
    borderRadius: '6px', 
    fontSize: '0.8rem',
    letterSpacing: '0.5px' 
  },
  orderDate: { marginTop: '6px', color: '#8b847d', fontSize: '0.88rem' },
  statusPill: { padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px', whiteSpace: 'nowrap', border: '1px solid transparent' },
  metaRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr)) 1.2fr',
    gap: '20px',
    marginBottom: '20px',
    backgroundColor: '#fcfaf8',
    borderRadius: '16px',
    padding: '18px 24px',
    border: '1px solid #f3ebe5',
    alignItems: 'center'
  },
  metaCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  metaColRight: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    alignItems: 'flex-end',
    borderLeft: '1px solid #e1d0d0',
    paddingLeft: '20px'
  },
  metaLabel: {
    fontSize: '11px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: '#b89a5b',
    fontWeight: '700'
  },
  metaLabelRight: {
    fontSize: '11px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: '#6b1111',
    fontWeight: '700'
  },
  metaValue: {
    color: '#333',
    fontWeight: '600',
    fontSize: '0.92rem'
  },
  totalValue: {
    color: '#6b1111',
    fontWeight: '800',
    fontSize: '1.25rem'
  },
  addressBox: { backgroundColor: '#fffaf5', border: '1px solid #f2e5d9', borderRadius: '16px', padding: '16px 20px', marginBottom: '20px', color: '#5b5149', fontSize: '0.9rem', lineHeight: '1.5' },
  addressLabel: { color: '#6b1111', fontWeight: '700' },
  itemsSection: { borderTop: '1px solid #f1e8e1', paddingTop: '20px' },
  itemsTitle: { marginBottom: '16px', fontWeight: '700', color: '#333', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px' },
  itemsGrid: { display: 'grid', gap: '12px' },
  itemRow: { display: 'grid', gridTemplateColumns: '56px 1fr auto', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: '1px solid #f5f0eb' },
  thumbWrap: { width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f6f1ec', border: '1px solid #efe5de', flexShrink: 0 },
  thumb: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbFallback: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b89a5b', fontWeight: '800' },
  itemInfo: { minWidth: 0 },
  itemName: { color: '#222', fontWeight: '700', marginBottom: '4px', fontSize: '0.95rem' },
  itemQty: { color: '#8a827b', fontSize: '0.85rem' },
  itemPrice: { color: '#6b1111', fontWeight: '800', whiteSpace: 'nowrap', fontSize: '0.95rem' },
  reviewBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#6b1111',
    border: '1px solid #6b1111',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
    transition: 'all 0.2s ease',
  },
  reviewedBadge: {
    fontSize: '0.72rem',
    color: '#b89a5b',
    fontWeight: '700',
    backgroundColor: '#fbf8f2',
    border: '1px solid #eadfca',
    padding: '6px 12px',
    borderRadius: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(52, 28, 22, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '32px',
    maxWidth: '480px',
    width: '90%',
    boxShadow: '0 24px 50px rgba(107, 17, 17, 0.15)',
    border: '1px solid #efe4dd',
    display: 'flex',
    flexDirection: 'column'
  },
  modalTitle: {
    margin: '0 0 10px',
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.8rem',
    color: '#6b1111',
    textAlign: 'center'
  },
  modalSubtitle: {
    margin: '0 0 20px',
    color: '#7a716a',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '0.95rem'
  },
  starsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '20px'
  },
  modalTextarea: {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '120px',
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid #eadfda',
    fontSize: '0.9rem',
    fontFamily: "'Montserrat', sans-serif",
    resize: 'vertical',
    outline: 'none',
    marginBottom: '20px',
    color: '#333',
    backgroundColor: '#fdfaf8',
    transition: 'border-color 0.2s'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  modalCancelBtn: {
    padding: '12px 20px',
    backgroundColor: '#fff',
    color: '#8a827b',
    border: '1px solid #eadfda',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  modalSubmitBtn: {
    padding: '12px 24px',
    backgroundColor: '#6b1111',
    color: '#fff',
    border: 'none',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  modalError: {
    color: '#c5221f',
    backgroundColor: '#fce8e6',
    border: '1px solid #fad2cf',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    marginBottom: '16px',
    textAlign: 'center'
  }
};

export default Orders;