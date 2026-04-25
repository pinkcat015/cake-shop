import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { toAssetUrl } from '../../api/api';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

const Products = () => {
  const { role } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State để xử lý hiệu ứng hover cho từng card mà không cần CSS file
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải danh sách sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['all', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return products.filter((item) => {
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesSearch =
        !normalizedSearch ||
        item.name?.toLowerCase().includes(normalizedSearch) ||
        item.description?.toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [products, search, categoryFilter]);

  return (
    <div style={styles.page}>
      <Navbar />

      {/* Hero Banner - Đồng bộ tone với trang Home */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}>
          <h1 style={styles.heroTitle}>OUR MENU</h1>
          <div style={styles.separator}></div>
          <p style={styles.heroSubtitle}>Chất lượng Pháp, tâm hồn Á Đông</p>
        </div>
      </section>

      <main style={styles.shell}>
        {/* Header Section */}
        <section style={styles.headerRow}>
          <div>
            <p style={styles.kicker}>Handcrafted Excellence</p>
            <h2 style={styles.mainTitle}>Sản Phẩm Tươi Mới</h2>
          </div>
          {(role === 'admin' || role === 'employee') && (
            <Link to={role === 'admin' ? '/admin/products' : '/employee/products'} style={styles.adminBtn}>
              QUẢN LÝ KHO HÀNG
            </Link>
          )}
        </section>

        {/* Search & Filter Bar */}
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
        </section>

        {loading && <div style={styles.statusBox}>Đang chuẩn bị bánh tươi...</div>}
        {error && <div style={{...styles.statusBox, color: '#6b1111'}}>{error}</div>}

        {/* Grid Sản phẩm */}
        <section style={styles.grid}>
          {filteredProducts.map((item) => (
            <article 
              key={item.product_id} 
              style={{
                ...styles.card,
                transform: hoveredId === item.product_id ? 'translateY(-8px)' : 'none',
                boxShadow: hoveredId === item.product_id ? '0 12px 24px rgba(0,0,0,0.1)' : 'none'
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
                      transform: hoveredId === item.product_id ? 'scale(1.08)' : 'scale(1)'
                    }} 
                  />
                ) : (
                  <div style={styles.emptyImg}>TOUS les JOURS</div>
                )}
                <span style={{
                  ...styles.badge, 
                  backgroundColor: item.status === 'ACTIVE' ? '#28a745' : '#888'
                }}>
                  {item.status === 'ACTIVE' ? 'Còn hàng' : 'Hết hàng'}
                </span>
              </div>

              <div style={styles.cardContent}>
                <p style={styles.cardCategory}>{item.category || 'Bakery'}</p>
                <h3 style={styles.cardName}>{item.name}</h3>
                <p style={styles.cardDesc}>{item.description || 'Hương vị thơm ngon truyền thống từ những nghệ nhân làm bánh.'}</p>
                <div style={styles.cardBottom}>
                  <strong style={styles.price}>{Number(item.price).toLocaleString('vi-VN')} đ</strong>
                  <Link to={`/products/${item.product_id}`} style={styles.detailLink}>
                    CHI TIẾT
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: '#fff',
    minHeight: '100vh',
    color: '#333',
  },
  hero: {
    height: '400px',
    backgroundImage: 'url("https://tljus.com/wp-content/uploads/2022/07/tous-les-jours-storefront.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    textAlign: 'center',
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '4rem',
    letterSpacing: '6px',
    margin: 0,
    fontWeight: '700',
  },
  separator: {
    width: '80px',
    height: '2px',
    backgroundColor: '#b89a5b',
    margin: '20px 0',
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    letterSpacing: '3px',
    textTransform: 'uppercase',
  },
  shell: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '80px 20px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '50px',
    borderBottom: '1px solid #eaeaea',
    paddingBottom: '25px',
  },
  kicker: {
    color: '#b89a5b',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: '2px',
    fontSize: '0.85rem',
    marginBottom: '8px',
  },
  mainTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2.8rem',
    margin: 0,
    color: '#6b1111',
  },
  adminBtn: {
    backgroundColor: '#6b1111',
    color: '#fff',
    padding: '14px 28px',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    letterSpacing: '1px',
    transition: '0.3s',
  },
  toolbar: {
    display: 'flex',
    gap: '15px',
    marginBottom: '60px',
  },
  searchContainer: { flex: 3 },
  filterContainer: { flex: 1 },
  searchInput: {
    width: '100%',
    padding: '15px 20px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  selectInput: {
    width: '100%',
    padding: '15px 15px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    outline: 'none',
    cursor: 'pointer',
    backgroundColor: '#fff',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '40px',
  },
  card: {
    border: '1px solid #f0f0f0',
    transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  imageWrap: {
    position: 'relative',
    height: '280px',
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.6s ease',
  },
  emptyImg: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6b1111',
    color: 'rgba(255,255,255,0.2)',
    fontWeight: 'bold',
    fontSize: '1.5rem',
    fontFamily: 'serif',
  },
  badge: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    color: '#fff',
    padding: '6px 12px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    zIndex: 2,
  },
  cardContent: {
    padding: '25px',
    textAlign: 'center',
  },
  cardCategory: {
    color: '#b89a5b',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: '10px',
    letterSpacing: '1px',
  },
  cardName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.5rem',
    margin: '0 0 12px 0',
    color: '#333',
  },
  cardDesc: {
    fontSize: '0.9rem',
    color: '#777',
    lineHeight: '1.6',
    height: '45px',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  cardBottom: {
    marginTop: '15px',
    paddingTop: '20px',
    borderTop: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: '#6b1111',
    fontSize: '1.25rem',
    fontWeight: '700',
  },
  detailLink: {
    color: '#333',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    letterSpacing: '1px',
    borderBottom: '2px solid #b89a5b',
    transition: '0.3s',
  },
  statusBox: {
    textAlign: 'center',
    padding: '100px 0',
    fontSize: '1.2rem',
    fontStyle: 'italic',
  }
};

export default Products;