import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/api';
import Navbar from '../../components/Navbar';
import { MapPin, Phone, Clock, Navigation, Map, Star, CheckCircle, XCircle } from 'lucide-react';

const StoreDetail = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStore = async () => {
      try {
        const res = await api.get(`/stores/${id}`);
        setStore(res.data.store);
      } catch (err) {
        console.error(err);
        alert('Không thể tải thông tin cửa hàng');
      } finally {
        setLoading(false);
      }
    };
    loadStore();
  }, [id]);

  if (loading) return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <Navbar />
      <div style={styles.statusBox}>Đang tải...</div>
    </div>
  );

  if (!store) return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <Navbar />
      <div style={styles.statusBox}>Cửa hàng không tìm thấy</div>
    </div>
  );

  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(store.address)}`;
  const directionsUrl = store.latitude && store.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`;

  const isOpen = () => {
    if (!store.open_hours) return true;
    try {
      const [open, close] = store.open_hours.split('-');
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      return currentTime >= parseInt(open.replace(':', '')) && currentTime < parseInt(close.replace(':', ''));
    } catch { return true; }
  };

  const openNow = isOpen();
  const fullStars = Math.floor(store.rating || 0);

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.shell}>
        {/* Breadcrumb */}
        <div style={styles.breadcrumb}>
          <Link to="/" style={styles.breadLink}>Home</Link>
          <span style={styles.breadDivider}>/</span>
          <Link to="/stores" style={styles.breadLink}>Cửa hàng</Link>
          <span style={styles.breadDivider}>/</span>
          <span style={styles.breadCurrent}>{store.name}</span>
        </div>

        <div style={styles.detailGrid}>

          {/* CỘT TRÁI: ẢNH + BẢN ĐỒ */}
          <div style={styles.leftColumn}>
            <div style={styles.imageContainer}>
              <img
                src={store.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800'}
                alt={store.name}
                style={styles.mainImage}
                onError={e => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800';
                }}
              />
            </div>

            <div style={styles.mapSection}>
              <h3 style={styles.sectionTitle}>Vị trí cửa hàng</h3>
              <div style={styles.mapWrapper}>
                <iframe
                  style={styles.mapIframe}
                  src={`https://maps.google.com/maps?q=${store.latitude && store.longitude ? `${store.latitude},${store.longitude}` : encodeURIComponent(store.address)}&hl=vi&z=16&output=embed`}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN */}
          <div style={styles.infoColumn}>
            <p style={styles.categoryLabel}>Scarlett Bakery</p>
            <h1 style={styles.storeName}>{store.name}</h1>
            <div style={styles.accentLine} />

            {/* Rating + trạng thái */}
            <div style={styles.metaRow}>
              {store.rating && (
                <div style={styles.starsRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} fill={i < fullStars ? '#e8a020' : 'none'} stroke={i < fullStars ? '#e8a020' : '#ccc'} />
                  ))}
                  <span style={styles.ratingNum}>{store.rating}</span>
                </div>
              )}
              <span style={{
                ...styles.badge,
                backgroundColor: openNow ? '#e8f5e8' : '#fdecea',
                color: openNow ? '#2e7d32' : '#c62828',
              }}>
                {openNow ? <><CheckCircle size={11} /> Đang mở</> : <><XCircle size={11} /> Đóng cửa</>}
              </span>
            </div>

            {/* Thông tin chi tiết */}
            <div style={styles.infoBlock}>
              <h3 style={styles.sectionTitle}>Thông tin cửa hàng</h3>

              <div style={styles.infoItem}>
                <div style={styles.infoIconWrap}><MapPin size={14} color="#6b1111" /></div>
                <div>
                  <p style={styles.infoLabel}>Địa chỉ</p>
                  <p style={styles.infoValue}>{store.address || '—'}</p>
                </div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.infoIconWrap}><Phone size={14} color="#6b1111" /></div>
                <div>
                  <p style={styles.infoLabel}>Điện thoại</p>
                  <a href={`tel:${store.phone}`} style={styles.infoLink}>{store.phone || '—'}</a>
                </div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.infoIconWrap}><Clock size={14} color="#6b1111" /></div>
                <div>
                  <p style={styles.infoLabel}>Giờ mở cửa</p>
                  <p style={styles.infoValue}>{store.open_hours || '—'}</p>
                </div>
              </div>
            </div>

            {/* Mô tả */}
            {store.description && (
              <div style={styles.descriptionSection}>
                <h3 style={styles.sectionTitle}>Mô tả</h3>
                <p style={styles.descriptionText}>{store.description}</p>
              </div>
            )}

            {/* Nút hành động */}
            <div style={styles.actionArea}>
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer" style={styles.btnPrimary}>
                <Navigation size={14} /> HƯỚNG DẪN ĐƯỜNG
              </a>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={styles.btnSecondary}>
                <Map size={14} /> XEM BẢN ĐỒ
              </a>
              <Link to="/stores" style={styles.backLink}>Quay lại danh sách</Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

const styles = {
  page: { backgroundColor: '#fff', minHeight: '100vh', fontFamily: "'Montserrat', sans-serif" },
  statusBox: { textAlign: 'center', padding: '100px 0', fontSize: '1.1rem', color: '#888' },

  shell: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },

  breadcrumb: { display: 'flex', alignItems: 'center', marginBottom: '30px', fontSize: '13px', color: '#888' },
  breadLink: { textDecoration: 'none', color: '#888', fontWeight: '500' },
  breadDivider: { margin: '0 10px' },
  breadCurrent: { color: '#6b1111', fontWeight: '700' },

  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' },

  // CỘT TRÁI
  leftColumn: { display: 'flex', flexDirection: 'column', gap: '30px' },
  imageContainer: { width: '100%', border: '1px solid #f0ece8', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#faf9f6' },
  mainImage: { width: '100%', height: '420px', objectFit: 'contain', display: 'block' },
  mapSection: { backgroundColor: '#fafafa', borderLeft: '4px solid #6b1111', padding: '24px', borderRadius: '2px' },
  mapWrapper: { borderRadius: '4px', overflow: 'hidden', marginTop: '12px' },
  mapIframe: { width: '100%', height: '260px', border: 'none', display: 'block' },

  // CỘT PHẢI
  infoColumn: { padding: '0' },
  categoryLabel: { color: '#b89a5b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', margin: '0 0 10px' },
  storeName: { fontFamily: "'Playfair Display', serif", fontSize: '2.8rem', color: '#1a0a0a', margin: '0 0 16px', lineHeight: '1.2' },
  accentLine: { width: '60px', height: '3px', backgroundColor: '#6b1111', marginBottom: '24px' },

  metaRow: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: '32px', flexWrap: 'wrap' },
  starsRow: { display: 'flex', alignItems: 'center', gap: 3 },
  ratingNum: { fontSize: '13px', fontWeight: '700', color: '#444', marginLeft: 5 },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },

  infoBlock: { marginBottom: '32px' },
  sectionTitle: { fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#6b1111', fontWeight: '700', margin: '0 0 18px' },
  infoItem: { display: 'flex', gap: '14px', marginBottom: '18px', alignItems: 'flex-start' },
  infoIconWrap: { width: 32, height: 32, borderRadius: '8px', backgroundColor: '#fdf4f4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  infoLabel: { margin: '0 0 3px', fontSize: '0.68rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '600' },
  infoValue: { margin: 0, fontSize: '0.88rem', color: '#444', lineHeight: '1.6' },
  infoLink: { margin: 0, fontSize: '0.88rem', color: '#6b1111', textDecoration: 'none', fontWeight: '600' },

  descriptionSection: { marginBottom: '40px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' },
  descriptionText: { fontSize: '15px', color: '#555', lineHeight: '1.8', margin: 0 },

  actionArea: { display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '40px' },
  btnPrimary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 0', backgroundColor: '#6b1111', color: '#fff', textDecoration: 'none', borderRadius: '2px', fontWeight: '700', fontSize: '13px', letterSpacing: '1.5px' },
  btnSecondary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 0', backgroundColor: '#fff', color: '#333', border: '1.5px solid #333', textDecoration: 'none', borderRadius: '2px', fontWeight: '700', fontSize: '13px', letterSpacing: '1.5px' },
  backLink: { color: '#333', textDecoration: 'none', fontSize: '14px', fontWeight: '600', alignSelf: 'flex-start', borderBottom: '1px solid #333' },
};

export default StoreDetail;