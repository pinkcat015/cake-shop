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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await api.get('/orders/mine');
        setOrders(response.data.orders || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <p style={styles.kicker}>Order history</p>
            <h2 style={styles.title}>Đơn hàng của tôi</h2>
          </div>
          <Link to="/products" style={styles.backLink}>TIẾP TỤC MUA HÀNG</Link>
        </div>

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
                    <span style={styles.statusPill}>{getStatusLabel(order.status)}</span>
                  </div>

                  <div style={styles.metaGrid}>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Phương thức</span>
                      <span style={styles.metaValue}>{order.delivery_method === 'pickup' ? 'Nhận tại cửa hàng' : 'Giao tận nơi'}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Số lượng</span>
                      <span style={styles.metaValue}>{itemCount} món</span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Tổng tiền</span>
                      <span style={styles.totalValue}>{Number(order.total_price || 0).toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Chi nhánh</span>
                      <span style={styles.metaValue}>{order.store_name || 'Chưa xác định'}</span>
                    </div>
                  </div>

                  {order.address && (
                    <div style={styles.addressBox}>
                      <strong style={styles.addressLabel}>Địa chỉ:</strong> {order.address}
                    </div>
                  )}

                  <div style={styles.itemsSection}>
                    <div style={styles.itemsTitle}>Món trong đơn</div>
                    <div style={styles.itemsGrid}>
                      {(order.items || []).map((item) => (
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
                            <div style={styles.itemQty}>x{item.quantity}</div>
                          </div>
                          <div style={styles.itemPrice}>{Number(item.price * item.quantity).toLocaleString('vi-VN')} đ</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #fffdfb 0%, #faf7f3 100%)', fontFamily: "'Montserrat', sans-serif" },
  container: { maxWidth: '1180px', margin: '0 auto', padding: '44px 20px 80px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '20px', marginBottom: '28px', borderBottom: '1px solid #eadfda', paddingBottom: '20px' },
  kicker: { margin: '0 0 8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: '#b89a5b', fontWeight: '700' },
  title: { margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '2.6rem', color: '#6b1111' },
  backLink: { alignSelf: 'center', padding: '12px 18px', backgroundColor: '#6b1111', color: '#fff', textDecoration: 'none', fontSize: '12px', letterSpacing: '1.5px', fontWeight: '700', borderRadius: '999px' },
  statusBox: { textAlign: 'center', padding: '120px 0', color: '#8a827b' },
  errorBox: { backgroundColor: '#fff3f1', border: '1px solid #f0c6bf', color: '#8a2e22', padding: '16px 18px', borderRadius: '12px' },
  emptyState: { textAlign: 'center', padding: '88px 24px', backgroundColor: '#fff', border: '1px solid #f0e5df', borderRadius: '20px', boxShadow: '0 18px 40px rgba(107, 17, 17, 0.04)' },
  emptyTitle: { margin: '0 0 10px', fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#333' },
  emptyText: { margin: '0 0 24px', color: '#7a716a' },
  shopButton: { display: 'inline-flex', padding: '14px 20px', backgroundColor: '#6b1111', color: '#fff', textDecoration: 'none', fontWeight: '700', letterSpacing: '1.2px', borderRadius: '999px' },
  list: { display: 'grid', gap: '18px' },
  card: { backgroundColor: '#fff', border: '1px solid #efe4dd', borderRadius: '20px', padding: '24px', boxShadow: '0 18px 40px rgba(34, 18, 11, 0.04)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px', marginBottom: '18px' },
  orderLabel: { fontWeight: '700', color: '#222', fontSize: '1.05rem' },
  orderDate: { marginTop: '6px', color: '#8b847d', fontSize: '0.9rem' },
  statusPill: { padding: '8px 12px', borderRadius: '999px', backgroundColor: '#fbf1df', color: '#8c5b12', fontSize: '12px', fontWeight: '700', letterSpacing: '0.7px', whiteSpace: 'nowrap' },
  metaGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px', marginBottom: '18px' },
  metaItem: { backgroundColor: '#fcfaf8', border: '1px solid #f3ebe5', borderRadius: '14px', padding: '14px' },
  metaLabel: { display: 'block', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#b89a5b', fontWeight: '700', marginBottom: '6px' },
  metaValue: { color: '#333', fontWeight: '600' },
  totalValue: { color: '#6b1111', fontWeight: '800', fontSize: '1.02rem' },
  addressBox: { backgroundColor: '#fffaf5', border: '1px solid #f2e5d9', borderRadius: '14px', padding: '14px 16px', marginBottom: '18px', color: '#5b5149' },
  addressLabel: { color: '#6b1111' },
  itemsSection: { borderTop: '1px solid #f1e8e1', paddingTop: '18px' },
  itemsTitle: { marginBottom: '14px', fontWeight: '700', color: '#333', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px' },
  itemsGrid: { display: 'grid', gap: '10px' },
  itemRow: { display: 'grid', gridTemplateColumns: '56px 1fr auto', alignItems: 'center', gap: '14px', padding: '12px 0', borderBottom: '1px solid #f5f0eb' },
  thumbWrap: { width: '56px', height: '56px', borderRadius: '14px', overflow: 'hidden', backgroundColor: '#f6f1ec', flexShrink: 0 },
  thumb: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbFallback: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b89a5b', fontWeight: '800' },
  itemInfo: { minWidth: 0 },
  itemName: { color: '#222', fontWeight: '700', marginBottom: '4px' },
  itemQty: { color: '#8a827b', fontSize: '0.9rem' },
  itemPrice: { color: '#6b1111', fontWeight: '800', whiteSpace: 'nowrap' },
};

export default Orders;