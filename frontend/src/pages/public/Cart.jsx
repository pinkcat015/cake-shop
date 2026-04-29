import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { toAssetUrl } from '../../api/api';
import Navbar from '../../components/Navbar';

const Cart = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => { loadCart(); }, []);

  const updateQty = async (product_id, qty) => {
    if (qty < 1) return; // Tránh số lượng bằng 0 hoặc âm
    try {
      await api.put('/cart/update', { product_id, quantity: Number(qty) });
      await loadCart();
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (product_id) => {
    if (!window.confirm('Xóa món bánh này khỏi giỏ hàng?')) return;
    try {
      await api.delete('/cart/remove', { data: { product_id } });
      await loadCart();
    } catch (err) {
      console.error(err);
    }
  };

  const subtotal = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0);

  if (loading) return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.statusBox}>Đang chuẩn bị giỏ hàng...</div>
    </div>
  );

  return (
    <div style={styles.page}>
      <Navbar />
      
      <main style={styles.container}>
        <h2 style={styles.title}>Giỏ hàng của bạn</h2>
        <div style={styles.underline}></div>

        {items.length === 0 ? (
          <div style={styles.emptyState}>
            <p>Giỏ hàng hiện tại đang trống.</p>
            <Link to="/products" style={styles.backToShop}>QUAY LẠI CỬA HÀNG</Link>
          </div>
        ) : (
          <div style={styles.cartLayout}>
            {/* DANH SÁCH MÓN ĂN */}
            <div style={styles.itemsSection}>
              {items.map(item => (
                <div key={item.cart_item_id} style={styles.cartRow}>
                  <div style={styles.imgWrap}>
                    <img src={toAssetUrl(item.image)} alt={item.name} style={styles.image} />
                  </div>
                  
                  <div style={styles.itemDetails}>
                    <div style={styles.itemName}>{item.name}</div>
                    <div style={styles.itemCategory}>{item.category || 'Bakery'}</div>
                    <div style={styles.itemPrice}>{Number(item.price).toLocaleString('vi-VN')} đ</div>
                  </div>

                  <div style={styles.quantityControls}>
                    <button onClick={() => updateQty(item.product_id, item.quantity - 1)} style={styles.qtyBtn}>-</button>
                    <input 
                      type="number" 
                      value={item.quantity} 
                      readOnly
                      style={styles.qtyInput} 
                    />
                    <button onClick={() => updateQty(item.product_id, item.quantity + 1)} style={styles.qtyBtn}>+</button>
                  </div>

                  <div style={styles.itemTotal}>
                    {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                  </div>

                  <button onClick={() => removeItem(item.product_id)} style={styles.removeBtn}>✕</button>
                </div>
              ))}
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
  container: { maxWidth: '1200px', margin: '60px auto', padding: '0 20px' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', textAlign: 'center', margin: 0, color: '#333' },
  underline: { width: '60px', height: '3px', backgroundColor: '#6b1111', margin: '20px auto 50px' },
  
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