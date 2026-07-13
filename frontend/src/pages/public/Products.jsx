import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api, { toAssetUrl } from '../../api/api';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getActivePromoForProduct, getScheduledPromoForProduct, getEffectivePrice } from '../../utils/promoUtils';

const Products = () => {
  const { role } = useAuth();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [addingMap, setAddingMap] = useState({});
  const [msgMap, setMsgMap] = useState({});
  const navigate = useNavigate();

  const priceRanges = [
    { value: 'all', label: 'Tất cả giá' },
    { value: 'under-50000', label: 'Dưới 50.000đ' },
    { value: '50000-100000', label: '50.000đ - 100.000đ' },
    { value: '100000-200000', label: '100.000đ - 200.000đ' },
    { value: 'over-200000', label: 'Trên 200.000đ' },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, promoRes] = await Promise.all([
          api.get('/products'),
          api.get('/promotions').catch(() => ({ data: { promotions: [] } }))
        ]);
        setProducts(prodRes.data || []);
        setPromotions(promoRes.data?.promotions || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) setCategoryFilter(category);
  }, [searchParams]);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((item) => { if (item.category) set.add(item.category); });
    return ['all', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return products.filter((item) => {
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const price = Number(item.price || 0);
      const matchesPrice = (() => {
        switch (priceFilter) {
          case 'under-50000':
            return price < 50000;
          case '50000-100000':
            return price >= 50000 && price <= 100000;
          case '100000-200000':
            return price > 100000 && price <= 200000;
          case 'over-200000':
            return price > 200000;
          default:
            return true;
        }
      })();
      const matchesSearch = !normalizedSearch || 
                            item.name?.toLowerCase().includes(normalizedSearch) || 
                            item.description?.toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesPrice && matchesSearch;
    });
  }, [products, search, categoryFilter, priceFilter]);

  return (
    <div style={styles.page}>
      <Navbar />

      {/* Hero Banner - Elegant & Minimal */}
      <section style={styles.hero}>
        <video
          style={styles.heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          src="https://videos.pexels.com/video-files/6158848/6158848-hd_1920_1080_25fps.mp4"
        />
        <div style={styles.heroShade} />
        <div style={styles.heroOverlay}>
          <h1 style={styles.heroTitle}>OUR MENU</h1>
          <div style={styles.separator}></div>
          <p style={styles.heroSubtitle}>Chất lượng Pháp, tâm hồn Á Đông</p>
        </div>
      </section>

      <main style={styles.shell}>
        {/* Header Section */}
        <section style={styles.headerRow}>
          <div style={styles.headerTitleGroup}>
            <p style={styles.kicker}>Handcrafted Excellence</p>
            <h2 style={styles.mainTitle}>SẢN PHẨM TƯƠI MỚI</h2>
          </div>
          {(role === 'admin' || role === 'employee') && (
            <Link to={role === 'admin' ? '/admin/products' : '/employee/products'} style={styles.adminBtn}>
              QUẢN LÝ KHO HÀNG
            </Link>
          )}
        </section>

        {/* Search & Filter Bar - Refined Inputs */}
        <section style={styles.toolbar}>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Tìm kiếm loại bánh bạn yêu thích..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.filterContainer}>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={styles.selectInput}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === 'all' ? 'Tất cả danh mục' : item}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.filterContainer}>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              style={styles.selectInput}
            >
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {loading && <div style={styles.statusBox}>Đang chuẩn bị bánh tươi...</div>}
        {error && <div style={{...styles.statusBox, color: '#6b1111'}}>{error}</div>}

        {/* Grid Sản phẩm - Balanced Spacing */}
        <section style={styles.grid}>
          {filteredProducts.map((item) => {
            const activePromo = getActivePromoForProduct(item.product_id, promotions);
            const scheduledPromo = getScheduledPromoForProduct(item.product_id, promotions);
            return (
              <article 
                key={item.product_id} 
                style={{
                  ...styles.card,
                  transform: hoveredId === item.product_id ? 'translateY(-10px)' : 'none',
                  boxShadow: hoveredId === item.product_id ? '0 20px 40px rgba(0,0,0,0.08)' : '0 2px 10px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={() => setHoveredId(item.product_id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div style={styles.imageWrap}>
                  {item.image ? (
                    <img 
                      src={toAssetUrl(item.image)} 
                      alt={item.name} 
                      style={{
                        ...styles.img,
                        transform: hoveredId === item.product_id ? 'scale(1.1)' : 'scale(1)'
                      }} 
                    />
                  ) : (
                    <div style={styles.emptyImg}>TOUS les JOURS</div>
                  )}
                  <div style={{
                    ...styles.badge, 
                    backgroundColor: item.status === 'ACTIVE' ? '#28a745' : '#888'
                  }}>
                    {item.status === 'ACTIVE' ? 'Còn hàng' : 'Hết hàng'}
                  </div>
                </div>

                <div style={styles.cardContent}>
                  <p style={styles.cardCategory}>
                    {item.category || 'Bakery'}
                    {activePromo && (
                      <span style={{ marginLeft: 8, padding: '2px 6px', backgroundColor: '#fff0f0', color: '#9b1c1c', border: '1px solid #ffcccc', borderRadius: 4, fontSize: '0.65rem', fontWeight: 'bold' }}>
                        -{activePromo.discount}% HAPPY HOUR
                      </span>
                    )}
                    {scheduledPromo && (
                      <span style={{ marginLeft: 8, padding: '2px 6px', backgroundColor: '#f5f5f5', color: '#666', border: '1px solid #ddd', borderRadius: 4, fontSize: '0.65rem', fontWeight: '500' }}>
                        Happy Hour -{scheduledPromo.discount}% ({scheduledPromo.start_time?.slice(0, 5)}-{scheduledPromo.end_time?.slice(0, 5)})
                      </span>
                    )}
                  </p>
                  <h3 style={styles.cardName}>{item.name}</h3>
                  <p style={styles.cardDesc}>{item.description || 'Hương vị thơm ngon truyền thống từ những nghệ nhân làm bánh.'}</p>
                  <div style={styles.cardBottom}>
                    <div style={styles.priceContainer}>
                      <span style={styles.priceLabel}>Giá từ</span>
                      {activePromo ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.75rem', color: '#888', textDecoration: 'line-through' }}>
                            {Number(item.price).toLocaleString('vi-VN')} đ
                          </span>
                          <strong style={{ ...styles.price, color: '#9b1c1c' }}>
                            {getEffectivePrice(item, promotions).toLocaleString('vi-VN')} đ
                          </strong>
                        </div>
                      ) : (
                        <strong style={styles.price}>{Number(item.price).toLocaleString('vi-VN')} đ</strong>
                      )}
                    </div>
                    <div style={{display:'flex', gap:10, alignItems:'center'}}>
                      <Link to={`/products/${item.product_id}`} style={styles.detailLink}>
                        XEM THÊM
                      </Link>
                      <button
                        onClick={async (e) => {
                          try {
                            setMsgMap((m) => ({ ...m, [item.product_id]: '' }));
                            setAddingMap((m) => ({ ...m, [item.product_id]: true }));
                            const token = localStorage.getItem('token');
                            if (!token) return navigate('/login');
                            const rect = e.currentTarget?.getBoundingClientRect?.();
                            await api.post('/cart/add', { product_id: item.product_id, quantity: 1 });
                            setMsgMap((m) => ({ ...m, [item.product_id]: 'Đã thêm' }));
                            window.dispatchEvent(new CustomEvent('cart-added', {
                              detail: rect ? { sourceRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height }, quantity: 1 } : { quantity: 1 }
                            }));
                            window.dispatchEvent(new Event('cart-updated'));
                          } catch (err) {
                            console.error(err);
                            setMsgMap((m) => ({ ...m, [item.product_id]: err.response?.data?.message || 'Không thể thêm vào giỏ' }));
                          } finally {
                            setAddingMap((m) => ({ ...m, [item.product_id]: false }));
                            setTimeout(() => setMsgMap((m) => ({ ...m, [item.product_id]: '' })), 2200);
                          }
                        }}
                        disabled={Boolean(addingMap[item.product_id]) || Number(item.quantity ?? 0) <= 0}
                        style={{ 
                          padding: '8px 12px', 
                          backgroundColor: Number(item.quantity ?? 0) <= 0 ? '#9ca3af' : '#6b1111', 
                          color: '#fff', 
                          border: 'none', 
                          cursor: Number(item.quantity ?? 0) <= 0 ? 'not-allowed' : 'pointer', 
                          fontWeight: 700 
                        }}
                      >
                        {Number(item.quantity ?? 0) <= 0 ? 'HẾT' : (addingMap[item.product_id] ? 'ĐANG...' : 'THÊM')}
                      </button>
                    </div>
                    {msgMap[item.product_id] && <div style={{marginTop:6, fontSize:12, color: msgMap[item.product_id].startsWith('Đã') ? '#2f7a2f' : '#a12f2f'}}>{msgMap[item.product_id]}</div>}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
};

const styles = {
  page: { backgroundColor: '#fcfcfc', minHeight: '100vh', color: '#333', fontFamily: "'Montserrat', sans-serif" },
  hero: {
    height: '450px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroVideo: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
    pointerEvents: 'none',
  },
  heroShade: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5))',
    zIndex: 1,
  },
  heroOverlay: { position: 'relative', textAlign: 'center', color: '#fff', zIndex: 2 },
  heroTitle: { fontFamily: "'Playfair Display', serif", color: '#fff', fontSize: '4.5rem', letterSpacing: '8px', margin: 0, marginBottom: '50px', fontWeight: '700' },
  separator: { width: '60px', height: '2px', backgroundColor: '#fff', margin: '25px auto' },
  heroSubtitle: { fontSize: '1.2rem', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: '300' },
  shell: { maxWidth: '1240px', margin: '0 auto', padding: '100px 20px' },
  headerRow: { position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '60px', borderBottom: '1px solid #f0f0f0', paddingBottom: '30px' },
  headerTitleGroup: { textAlign: 'center' },
  kicker: { color: '#b89a5b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '3px', fontSize: '0.8rem', marginBottom: '20px' },
  mainTitle: { fontFamily: "'Playfair Display', serif", fontSize: '3rem', margin: 0, color: '#6b1111' },
  adminBtn: { position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', backgroundColor: '#6b1111', color: '#fff', padding: '15px 35px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '2px', borderRadius: '2px' },
  toolbar: { display: 'flex', gap: '20px', marginBottom: '70px', flexWrap: 'wrap' },
  searchContainer: { flex: 3 },
  filterContainer: { flex: 1, minWidth: '220px' },
  searchInput: { width: '100%', padding: '18px 25px', border: '1px solid #e0e0e0', fontSize: '0.95rem', outline: 'none', backgroundColor: '#fff' },
  selectInput: { width: '100%', padding: '18px 20px', border: '1px solid #e0e0e0', fontSize: '0.95rem', outline: 'none', cursor: 'pointer', backgroundColor: '#fff' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '50px 30px' },
  card: { backgroundColor: '#fff', transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)', border: '1px solid #f5f5f5', borderRadius: '0px' },
  imageWrap: { position: 'relative', height: '320px', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s ease' },
  emptyImg: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#6b1111', color: 'rgba(255,255,255,0.15)', fontWeight: 'bold', fontSize: '1.4rem', fontFamily: 'serif' },
  badge: { position: 'absolute', top: '20px', left: '20px', color: '#fff', padding: '5px 12px', fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' },
  cardContent: { padding: '30px', textAlign: 'center' },
  cardCategory: { color: '#b89a5b', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '2px' },
  cardName: { fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', margin: '0 0 15px 0', color: '#222' },
  cardDesc: { fontSize: '0.9rem', color: '#888', lineHeight: '1.8', height: '50px', overflow: 'hidden', marginBottom: '25px' },
  cardBottom: { marginTop: '10px', paddingTop: '25px', borderTop: '1px solid #f9f9f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  priceContainer: { textAlign: 'left' },
  priceLabel: { display: 'block', fontSize: '0.65rem', color: '#aaa', textTransform: 'uppercase', marginBottom: '3px' },
  price: { color: '#6b1111', fontSize: '1.3rem', fontWeight: '700' },
  detailLink: { color: '#333', textDecoration: 'none', fontWeight: '700', fontSize: '0.75rem', letterSpacing: '2px', borderBottom: '2px solid #b89a5b', paddingBottom: '2px' },
  statusBox: { textAlign: 'center', padding: '120px 0', fontSize: '1.1rem', color: '#999', letterSpacing: '1px' }
};

export default Products;