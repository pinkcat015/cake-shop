import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { toAssetUrl } from '../../api/api';
import Navbar from '../../components/Navbar';
import { getActivePromoForProduct, getScheduledPromoForProduct, getEffectivePrice } from '../../utils/promoUtils';

const Cart = () => {
  const [items, setItems] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null); // FE18: track which item is being updated
  const navigate = useNavigate();

  const loadCart = async () => {
    try {
      const res = await api.get('/cart');
      setItems(res.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const promoRes = await api.get('/promotions').catch(() => ({ data: { promotions: [] } }));
        setPromotions(promoRes.data?.promotions || []);
      } catch (err) {
        console.error(err);
      }
      await loadCart();
    };
    init();
  }, []);

  const updateQty = async (product_id, qty) => {
    if (qty < 1) return; // Tránh số lượng bằng 0 hoặc âm
    setUpdatingId(product_id); // FE18: set loading state
    try {
      await api.put('/cart/update', { product_id, quantity: Number(qty) });
      await loadCart();
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      console.error(err);
      // FE17: Show error to user instead of silent fail
      alert(err.response?.data?.message || 'Không thể cập nhật số lượng. Vui lòng thử lại.');
    } finally {
      setUpdatingId(null); // FE18: clear loading state
    }
  };

  const removeItem = async (product_id) => {
    if (!window.confirm('Xóa món bánh này khỏi giỏ hàng?')) return;
    setUpdatingId(product_id); // FE18: set loading state
    try {
      await api.delete('/cart/remove', { data: { product_id } });
      await loadCart();
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      console.error(err);
      // FE17: Show error to user instead of silent fail
      alert(err.response?.data?.message || 'Không thể xóa món. Vui lòng thử lại.');
    } finally {
      setUpdatingId(null); // FE18: clear loading state
    }
  };

  const subtotal = items.reduce((s, it) => s + getEffectivePrice(it, promotions) * (it.quantity || 0), 0);

  if (loading) return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.statusBox}>Đang chuẩn bị giỏ hàng...</div>
    </div>
  );

  return (
    <div style={styles.page}>
      <Navbar />

      <section style={styles.heroBanner}>
        <p style={styles.heroOverline}>Scarlett Bakery</p>
        <h1 style={styles.heroTitle}>GIỎ HÀNG CỦA BẠN</h1>
        <p style={styles.heroDesc}>
          Xem lại các món bánh thơm ngon bạn đã lựa chọn trước khi đặt hàng.
        </p>
        <Link 
          to="/products" 
          style={styles.backLinkBanner}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#efe5de';
            e.currentTarget.style.color = '#6b1111';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#efe5de';
          }}
        >
          Tiếp tục mua hàng
        </Link>
      </section>
      
      <main style={styles.container}>

        {items.length === 0 ? (
          <div style={styles.emptyState}>
            <p>Giỏ hàng hiện tại đang trống.</p>
            <Link to="/products" style={styles.backToShop}>QUAY LẠI CỬA HÀNG</Link>
          </div>
        ) : (
          <div style={styles.cartLayout}>
            {/* DANH SÁCH MÓN ĂN */}
            <div style={styles.itemsSection}>
              {items.map(item => {
                const activePromo = getActivePromoForProduct(item.product_id, promotions);
                const effectivePrice = getEffectivePrice(item, promotions);
                return (
                  <div key={item.cart_item_id} style={styles.cartRow}>
                    <div style={styles.imgWrap}>
                      <img src={toAssetUrl(item.image)} alt={item.name} style={styles.image} />
                    </div>
                    
                    <div style={styles.itemDetails}>
                      <div style={styles.itemName}>{item.name}</div>
                      <div style={styles.itemCategory}>{item.category || 'Bakery'}</div>
                      <div style={styles.itemPrice}>
                        {activePromo ? (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.75rem', color: '#888', textDecoration: 'line-through' }}>
                              {Number(item.price).toLocaleString('vi-VN')} đ
                            </span>
                            <strong style={{ color: '#9b1c1c' }}>
                              {effectivePrice.toLocaleString('vi-VN')} đ
                            </strong>
                            <span style={{ fontSize: '0.65rem', color: '#9b1c1c', fontWeight: 'bold' }}>
                              -{activePromo.discount}% Happy Hour
                            </span>
                          </div>
                        ) : (
                          <span>{Number(item.price).toLocaleString('vi-VN')} đ</span>
                        )}
                      </div>
                    </div>

                    <div style={styles.quantityControls}>
                      {/* FE16: Disable minus button when quantity is already 1 */}
                      <button 
                        onClick={() => updateQty(item.product_id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updatingId === item.product_id}
                        style={{
                          ...styles.qtyBtn,
                          opacity: (item.quantity <= 1 || updatingId === item.product_id) ? 0.4 : 1,
                          cursor: (item.quantity <= 1 || updatingId === item.product_id) ? 'not-allowed' : 'pointer',
                        }}
                        title={item.quantity <= 1 ? 'Số lượng tối thiểu là 1' : ''}
                      >-</button>
                      <input 
                        type="number" 
                        value={item.quantity} 
                        readOnly
                        style={styles.qtyInput} 
                      />
                      <button 
                        onClick={() => updateQty(item.product_id, item.quantity + 1)}
                        disabled={updatingId === item.product_id}
                        style={{
                          ...styles.qtyBtn,
                          opacity: updatingId === item.product_id ? 0.4 : 1,
                          cursor: updatingId === item.product_id ? 'not-allowed' : 'pointer',
                        }}
                      >+</button>
                    </div>

                    <div style={styles.itemTotal}>
                      {(effectivePrice * item.quantity).toLocaleString('vi-VN')} đ
                    </div>

                    <button 
                      onClick={() => removeItem(item.product_id)}
                      disabled={updatingId === item.product_id}
                      style={{
                        ...styles.removeBtn,
                        opacity: updatingId === item.product_id ? 0.4 : 1,
                        cursor: updatingId === item.product_id ? 'not-allowed' : 'pointer',
                      }}
                    >✕</button>
                  </div>
                );
              })}
            </div>

            {/* PHẦN TỔNG KẾT (SIDEBAR) */}
            <aside style={styles.summaryBox}>
              <h3 style={styles.summaryTitle}>Tóm tắt đơn hàng</h3>
              <div style={styles.summaryRow}>
                <span>Tạm tính</span>
                <span>{subtotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Phí vận chuyển</span>
                <span style={{color: '#28a745'}}>Miễn phí</span>
              </div>
              <div style={{...styles.summaryRow, ...styles.totalRow}}>
                <span>Tổng cộng</span>
                <span>{subtotal.toLocaleString('vi-VN')} đ</span>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')} 
                style={styles.checkoutBtn}
              >
                TIẾN HÀNH THANH TOÁN
              </button>
              
              <p style={styles.note}>Thuế VAT đã được bao gồm trong giá.</p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  page: { backgroundColor: '#fff', minHeight: '100vh', fontFamily: "'Montserrat', sans-serif" },
  container: { maxWidth: '1200px', margin: '40px auto 80px', padding: '0 20px' },
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
    fontWeight: '700'
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '38px',
    color: '#fff',
    marginBottom: '14px',
    letterSpacing: '2px',
    fontWeight: '800'
  },
  heroDesc: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.72)',
    maxWidth: '500px',
    margin: '0 auto 20px',
    lineHeight: '1.7',
  },
  backLinkBanner: {
    display: 'inline-block',
    padding: '8px 24px',
    border: '1px solid rgba(239, 229, 222, 0.4)',
    borderRadius: '30px',
    color: '#efe5de',
    textDecoration: 'none',
    fontSize: '0.78rem',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    transition: 'all 0.3s ease',
    backgroundColor: 'transparent',
    cursor: 'pointer'
  },
  
  cartLayout: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '50px', alignItems: 'start' },
  
  itemsSection: { borderTop: '1px solid #eee' },
  cartRow: { 
    display: 'flex', 
    alignItems: 'center', 
    padding: '25px 0', 
    borderBottom: '1px solid #eee',
    gap: '20px'
  },
  imgWrap: { width: '120px', height: '90px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  
  itemDetails: { flex: 1 },
  itemName: { fontWeight: '700', fontSize: '1.1rem', color: '#333', marginBottom: '5px' },
  itemCategory: { fontSize: '0.8rem', color: '#b89a5b', textTransform: 'uppercase', fontWeight: '600' },
  itemPrice: { fontSize: '0.9rem', color: '#888', marginTop: '5px' },

  quantityControls: { display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '2px' },
  qtyBtn: { background: 'none', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '1.2rem', color: '#666' },
  qtyInput: { width: '40px', textAlign: 'center', border: 'none', fontWeight: 'bold', pointerEvents: 'none', backgroundColor: 'transparent' },

  itemTotal: { width: '120px', textAlign: 'right', fontWeight: '700', color: '#333' },
  removeBtn: { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '1.2rem', padding: '0 10px', transition: '0.3s' },

  summaryBox: { backgroundColor: '#f9f9f9', padding: '35px', borderRadius: '2px', border: '1px solid #f0f0f0' },
  summaryTitle: { fontSize: '1.4rem', fontFamily: "'Playfair Display', serif", marginBottom: '25px', borderBottom: '1px solid #ddd', paddingBottom: '15px' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.95rem', color: '#666' },
  totalRow: { borderTop: '1px solid #ddd', paddingTop: '15px', marginTop: '10px', color: '#6b1111', fontWeight: '700', fontSize: '1.2rem' },
  
  checkoutBtn: { 
    marginTop: '30px', 
    width: '100%', 
    padding: '18px', 
    backgroundColor: '#6b1111', 
    color: '#fff', 
    border: 'none', 
    fontWeight: '700', 
    letterSpacing: '2px', 
    cursor: 'pointer', 
    transition: '0.3s' 
  },
  note: { textAlign: 'center', fontSize: '0.75rem', color: '#aaa', marginTop: '15px' },

  emptyState: { textAlign: 'center', padding: '100px 0' },
  backToShop: { display: 'inline-block', marginTop: '20px', color: '#6b1111', fontWeight: '700', textDecoration: 'none', borderBottom: '2px solid #6b1111' },
  statusBox: { textAlign: 'center', padding: '100px 0', fontSize: '1.2rem', fontStyle: 'italic', color: '#888' }
};

export default Cart;