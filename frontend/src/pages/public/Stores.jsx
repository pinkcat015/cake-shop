import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Navbar from '../../components/Navbar';

const Stores = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    const loadStores = async () => {
      try {
        const res = await api.get('/stores');
        if (isMounted) {
          setStores(Array.isArray(res.data.stores) ? res.data.stores : []);
        }
      } catch (err) {
        console.error(err);
        alert('Không thể tải danh sách cửa hàng');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadStores();
    return () => { isMounted = false; };
  }, []);

  const checkIsOpen = (openHours) => {
    if (!openHours || typeof openHours !== 'string') return true;
    try {
      const [open, close] = openHours.split('-');
      if (!open || !close) return true;
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const openTime = parseInt(open.replace(':', ''), 10);
      const closeTime = parseInt(close.replace(':', ''), 10);
      return currentTime >= openTime && currentTime < closeTime;
    } catch (e) {
      return true;
    }
  };

  const storesWithStatus = useMemo(() =>
    stores.map(store => ({ ...store, isOpenNow: checkIsOpen(store.open_hours) })),
  [stores]);

  const openStoresCount = useMemo(() =>
    storesWithStatus.filter(s => s.isOpenNow).length,
  [storesWithStatus]);

  const filteredStores = useMemo(() =>
    filter === 'open' ? storesWithStatus.filter(s => s.isOpenNow) : storesWithStatus,
  [storesWithStatus, filter]);

  const renderStars = (rating) => {
    const full = Math.round(rating || 0);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  };

  return (
    <div style={styles.page}>
      <Navbar />

      {/* Hero Banner */}
      <section style={styles.heroBanner}>
        <p style={styles.heroOverline}>Scarlett Bakery</p>
        <h1 style={styles.heroTitle}>HỆ THỐNG CỬA HÀNG</h1>
        <p style={styles.heroDesc}>
          Tìm cửa hàng Scarlett gần bạn nhất — hương vị Pháp Á Đông, tươi mới mỗi ngày.
        </p>
      </section>

      <main style={styles.main}>
        {/* Filter Row */}
        <div style={styles.filterRow}>
          <span style={styles.filterLabel}>{filteredStores.length} cửa hàng</span>
          <div style={styles.filterPills}>
            {['all', 'open'].map(val => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                style={{
                  ...styles.pill,
                  ...(filter === val ? styles.pillActive : {}),
                }}
              >
                {val === 'all' ? `Tất cả (${stores.length})` : `Đang mở (${openStoresCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={styles.emptyState}>Đang tải dữ liệu...</div>
        ) : filteredStores.length === 0 ? (
          <div style={styles.emptyState}>Không tìm thấy cửa hàng nào phù hợp.</div>
        ) : (
          <div style={styles.grid}>
            {filteredStores.map(store => (
              <div
                key={store.store_id || Math.random()}
                style={styles.card}
                onClick={() => navigate(`/stores/${store.store_id}`)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(107,17,17,0.12)';
                  e.currentTarget.style.borderColor = '#e8d5d5';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#f0ece8';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                <div style={styles.cardImgWrapper}>
                  <img
                    src={store.image_url}
                    alt={store.name}
                    style={styles.cardImg}
                    onError={e => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800';
                    }}
                  />
                </div>

                <div style={styles.cardBody}>
                  {/* Name + Badge */}
                  <div style={styles.cardTop}>
                    <h3 style={styles.storeName}>{store.name || 'Cửa hàng chưa có tên'}</h3>
                    <span style={store.isOpenNow ? styles.badgeOpen : styles.badgeClosed}>
                      {store.isOpenNow ? '✓ Đang mở' : '✗ Đóng cửa'}
                    </span>
                  </div>

                  {/* Rating */}
                  <div style={styles.ratingRow}>
                    <span style={styles.stars}>{renderStars(store.rating)}</span>
                    <span style={styles.ratingVal}>{store.rating || 0}</span>
                  </div>

                  {/* Info */}
                  <div style={styles.infoList}>
                    <div style={styles.infoRow}><span style={styles.infoIcon}>📍</span>{store.address || 'Chưa cập nhật'}</div>
                    <div style={styles.infoRow}><span style={styles.infoIcon}>⏰</span>{store.open_hours || 'Chưa cập nhật'}</div>
                    <div style={styles.infoRow}><span style={styles.infoIcon}>📞</span>{store.phone || 'Chưa cập nhật'}</div>
                  </div>

                  {store.description && (
                    <p style={styles.description}>"{store.description}"</p>
                  )}

                  <div style={styles.divider} />
                  <button style={styles.btnDetail}>Xem chi tiết →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: '#fcfcfc',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
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
  main: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '50px 24px',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '36px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  filterLabel: {
    fontSize: '13px',
    color: '#999',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  filterPills: {
    display: 'flex',
    gap: '10px',
  },
  pill: {
    padding: '9px 22px',
    borderRadius: '30px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    border: '1.5px solid #ddd',
    background: '#fff',
    color: '#555',
    letterSpacing: '0.5px',
    transition: '0.2s',
  },
  pillActive: {
    background: '#6b1111',
    color: '#fff',
    borderColor: '#6b1111',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    color: '#999',
    fontSize: '15px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '28px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #f0ece8',
    cursor: 'pointer',
    transition: 'transform 0.25s, box-shadow 0.25s, border-color 0.25s',
  },
  cardImgWrapper: {
    width: '100%',
    height: '160px',
    overflow: 'hidden',
    backgroundColor: '#f4e8d0',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.4s ease',
  },
  cardBody: {
    padding: '22px 24px',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '12px',
  },
  storeName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '18px',
    color: '#1a0a0a',
    flex: 1,
    lineHeight: '1.3',
  },
  badgeOpen: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    background: '#e8f5e8',
    color: '#2e7d32',
    letterSpacing: '0.3px',
  },
  badgeClosed: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    background: '#fdecea',
    color: '#c62828',
    letterSpacing: '0.3px',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
  },
  stars: {
    color: '#e8a020',
    fontSize: '14px',
    letterSpacing: '1px',
  },
  ratingVal: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#444',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    marginBottom: '16px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.5',
  },
  infoIcon: {
    fontSize: '14px',
    flexShrink: 0,
    marginTop: '1px',
  },
  description: {
    fontSize: '13px',
    color: '#999',
    fontStyle: 'italic',
    marginBottom: '16px',
    lineHeight: '1.6',
  },
  divider: {
    height: '1px',
    background: '#f4eeea',
    marginBottom: '16px',
  },
  btnDetail: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#6b1111',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
};

export default Stores;