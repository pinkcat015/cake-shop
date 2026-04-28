import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { toAssetUrl } from '../../api/api';
import Navbar from '../../components/Navbar';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Không thể tải chi tiết sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

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
              <p style={styles.categoryLabel}>{product.category || 'Bakery'}</p>
              <h1 style={styles.productTitle}>{product.name}</h1>
              <div style={styles.accentLine}></div>
              
              <div style={styles.priceTag}>
                {Number(product.price).toLocaleString('vi-VN')} <span style={{fontSize: '1.2rem'}}>VND</span>
              </div>

              {/* MÔ TẢ HƯƠNG VỊ */}
              <div style={styles.descriptionSection}>
                <h3 style={styles.sectionTitle}>Mô tả hương vị</h3>
                <p style={styles.descriptionText}>
                  {product.description || 'Sản phẩm được làm từ nguyên liệu thượng hạng, mang đến hương vị tươi mới mỗi ngày.'}
                </p>
              </div>

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
                <button style={styles.mainBtn}>THÊM VÀO GIỎ HÀNG</button>
                <Link to="/products" style={styles.secondaryLink}>Quay lại thực đơn</Link>
              </div>
            </div>

          </div>
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
  imageContainer: { width: '100%', backgroundColor: '#fdfdfd', border: '1px solid #f0f0f0', borderRadius: '4px', overflow: 'hidden' },
  mainImage: { width: '100%', height: 'auto', display: 'block', objectFit: 'cover' },
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
  accentLine: { width: '50px', height: '2px', backgroundColor: '#6b1111', marginBottom: '25px' },
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

  statusBox: { textAlign: 'center', padding: '100px 0', fontSize: '1.2rem', color: '#888' }
};

export default ProductDetail;