import React, { useCallback, useEffect, useState } from 'react';
import api from '../../api/api';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { getActivePromoForProduct, getScheduledPromoForProduct, getEffectivePrice } from '../../utils/promoUtils';

const Checkout = () => {
  const [items, setItems] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [stores, setStores] = useState([]);
  const [nearestLoading, setNearestLoading] = useState(false);
  const [storesLoading, setStoresLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [coords, setCoords] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherResult, setVoucherResult] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const navigate = useNavigate();

  const loadCart = useCallback(async () => {
    try {
      const [cartRes, promoRes] = await Promise.all([
        api.get('/cart'),
        api.get('/promotions').catch(() => ({ data: { promotions: [] } }))
      ]);
      setItems(cartRes.data.items || []);
      setPromotions(promoRes.data?.promotions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPricing = useCallback(async (code = '') => {
    if (!items.length) {
      setVoucherResult(null);
      return null;
    }

    try {
      const res = await api.post('/vouchers/apply', { code: code.trim() });
      setVoucherResult(res.data);
      if (code.trim()) {
        setVoucherCode(res.data.code || code.trim());
      }
      return res.data;
    } catch (err) {
      console.error(err);
      if (code.trim()) {
        setVoucherResult(null);
        alert(err.response?.data?.message || 'Không thể áp voucher');
      }
      return null;
    }
  }, [items.length]);

  const loadAllStores = useCallback(async () => {
    setStoresLoading(true);
    try {
      const res = await api.get('/stores');
      const list = res.data?.stores || [];
      setStores(list);
      // FE14: Read selectedStore via functional state update to avoid stale closure
      setSelectedStore((prev) => (prev ? prev : list[0] || null));
    } catch (err) {
      console.error(err);
      alert('Không thể tải danh sách cửa hàng');
    } finally {
      setStoresLoading(false);
    }
  // FE14: Remove selectedStore from deps to prevent re-fetch on every store selection
  }, []);

  useEffect(() => { loadCart(); }, [loadCart]);

  useEffect(() => {
    if (!loading) {
      // FE13: Pass the currently applied voucher code so it doesn't get wiped on re-price
      refreshPricing(voucherCode.trim());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, loading]);

  useEffect(() => {
    if (stores.length === 0) {
      loadAllStores();
    }
  }, [deliveryMethod, loadAllStores, stores.length]);

  const subtotal = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0);
  const promotionDiscount = voucherResult?.promotion_discount || 0;
  const voucherDiscount = voucherResult?.voucher_discount || 0;
  const totalDiscount = voucherResult?.total_discount || 0;
  const amountPayable = voucherResult?.total_payable ?? subtotal;

  const applyVoucher = async () => {
    const code = voucherCode.trim();
    if (!code) {
      alert('Vui lòng nhập mã voucher');
      return;
    }

    setVoucherLoading(true);
    try {
      const result = await refreshPricing(code);
      // FE12: Only show success if result is not null (refreshPricing catches errors and returns null)
      if (result) {
        alert(`Áp voucher thành công. Giảm ${Number(result?.total_discount || 0).toLocaleString('vi-VN')} đ`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVoucherLoading(false);
    }
  };

  const placeOrder = async () => {
    // FE15: Guard against empty cart
    if (!items || items.length === 0) {
      alert('Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi đặt hàng.');
      return;
    }
    if (deliveryMethod === 'delivery' && !address.trim()) {
      alert('Vui lòng nhập địa chỉ nhận hàng');
      return;
    }
    if (!selectedStore) {
      alert('Vui lòng chọn một cửa hàng');
      return;
    }

    setSubmitting(true);
    try {
      const voucherCodeToSend = voucherResult?.code || voucherCode.trim() || null;
      const payload = {
        address,
        delivery_method: deliveryMethod,
        store_id: selectedStore.store_id || selectedStore.id,
        voucher_code: voucherCodeToSend,
      };
      if (coords) {
        payload.delivery_latitude = coords.lat;
        payload.delivery_longitude = coords.lng;
      }
      const orderRes = await api.post('/orders', payload);
      const order = orderRes.data?.order;
      const payable = Number(orderRes.data?.pricing?.total_payable ?? order?.total_price ?? amountPayable ?? 0);

      if (order?.order_id) {
        await api.post('/payments', {
          order_id: order.order_id,
          method: paymentMethod,
          amount: payable,
        });
      }

      if (paymentMethod === 'bank_transfer') {
        alert('Đặt hàng thành công! Hệ thống đang chuyển hướng bạn sang cổng thanh toán trực tuyến...');
        window.dispatchEvent(new Event('cart-updated'));
        navigate(`/payment-gateway?order_id=${order.order_id}&amount=${payable}`);
      } else {
        alert('Đặt hàng thành công! Đơn hàng của bạn đã được ghi nhận.');
        window.dispatchEvent(new Event('cart-updated'));
        navigate('/orders');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi khi đặt hàng');
    } finally {
      setSubmitting(false);
    }
  };

  const suggestNearestStores = () => {
    if (!navigator.geolocation) return alert('Trình duyệt không hỗ trợ lấy vị trí');
    setNearestLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setCoords({ lat, lng });
      try {
        const res = await api.get('/stores/nearest', { params: { lat, lng, limit: 5 } });
        const list = res.data?.stores || res.data || [];
        setStores(list);
        if (list.length) setSelectedStore(list[0]);
      } catch (err) {
        console.error(err);
        alert('Không thể lấy danh sách cửa hàng gần nhất');
      } finally {
        setNearestLoading(false);
      }
    }, (err) => {
      setNearestLoading(false);
      console.error(err);
      alert('Không thể lấy vị trí của bạn');
    });
  };

  if (loading) return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.statusBox}>Đang chuẩn bị thủ tục thanh toán...</div>
    </div>
  );

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.container}>
        <h2 style={styles.pageTitle}>Thanh toán</h2>
        <div style={styles.underline}></div>

        <div style={styles.layout}>
          {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
          <section style={styles.formSection}>
            {/* 1. Chọn phương thức nhận trước để giao diện phân luồng rõ ràng */}
            <div style={styles.sectionBlock}>
              <h3 style={styles.sectionTitle}>Phương thức nhận hàng</h3>
              <div style={styles.methodToggleGroup}>
                <label style={{
                  ...styles.methodLabel,
                  borderColor: deliveryMethod === 'delivery' ? '#6b1111' : '#ddd',
                  backgroundColor: deliveryMethod === 'delivery' ? '#fbf8f6' : '#fff'
                }}>
                  <input type="radio" name="method" value="delivery" checked={deliveryMethod === 'delivery'} onChange={() => setDeliveryMethod('delivery')} style={styles.radioInput} />
                  <div>
                    <span style={styles.methodName}>Giao tận nơi</span>
                    <span style={styles.methodDesc}>Ship hàng nhanh tận cửa nhà bạn</span>
                  </div>
                </label>
                <label style={{
                  ...styles.methodLabel,
                  borderColor: deliveryMethod === 'pickup' ? '#6b1111' : '#ddd',
                  backgroundColor: deliveryMethod === 'pickup' ? '#fbf8f6' : '#fff'
                }}>
                  <input type="radio" name="method" value="pickup" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} style={styles.radioInput} />
                  <div>
                    <span style={styles.methodName}>Nhận tại cửa hàng</span>
                    <span style={styles.methodDesc}>Chủ động qua lấy bánh tươi trực tiếp</span>
                  </div>
                </label>
              </div>
            </div>

            {/* 2. Địa chỉ nhận hàng (Chỉ hiện khi chọn delivery) */}
            {deliveryMethod === 'delivery' && (
              <div style={styles.sectionBlock}>
                <h3 style={styles.sectionTitle}>Địa chỉ giao hàng</h3>
                <textarea 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="Vui lòng nhập số nhà, tên đường, phường/xã, quận/huyện chính xác..."
                  style={styles.textarea} 
                />
              </div>
            )}

            {/* 3. Chọn cửa hàng chi nhánh */}
            <div style={styles.sectionBlock}>
              <h3 style={styles.sectionTitle}>Cửa hàng xử lý đơn hàng</h3>
              <div style={styles.locationActionRow}>
                <button onClick={suggestNearestStores} disabled={nearestLoading} style={styles.locationBtn}>
                  {nearestLoading ? '📍 Đang định vị...' : '📍 Tìm chi nhánh gần đây nhất'}
                </button>
                <button onClick={loadAllStores} disabled={storesLoading} style={styles.secondaryLocationBtn}>
                  {storesLoading ? 'Đang tải...' : 'Xem tất cả chi nhánh'}
                </button>
              </div>

              {coords && (
                <div style={styles.coordsBadge}>
                  Tọa độ hiện tại của bạn: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </div>
              )}

              <div style={styles.storeListContainer}>
                {stores.length === 0 ? (
                  <div style={styles.emptyStores}>Chưa tìm thấy hệ thống cửa hàng phù hợp.</div>
                ) : (
                  <div style={styles.storeCardsGrid}>
                    {stores.map(s => {
                      const isSelected = selectedStore && (selectedStore.store_id === s.store_id || selectedStore.id === s.id);
                      return (
                        <label key={s.store_id || s.id} style={{
                          ...styles.storeCard,
                          borderColor: isSelected ? '#6b1111' : '#eee',
                          boxShadow: isSelected ? '0 4px 12px rgba(107, 17, 17, 0.08)' : 'none',
                          backgroundColor: isSelected ? '#fff' : '#fcfcfc'
                        }}>
                          <input 
                            type="radio" 
                            name="store" 
                            checked={isSelected} 
                            onChange={() => setSelectedStore(s)} 
                            style={styles.radioInput} 
                          />
                          <div style={styles.storeInfoWrap}>
                            <strong style={styles.storeName}>{s.name || s.store_name || 'Cửa hàng'}</strong>
                            <div style={styles.storeAddress}>{s.address || s.addr || ''}</div>
                            
                            {s.route_distance_km != null && s.route_duration_minutes != null ? (
                              <div style={styles.distanceBadge}>
                                🛣️ {Number(s.route_distance_km).toFixed(2)} km • khoảng {Math.round(Number(s.route_duration_minutes))} phút di chuyển
                              </div>
                            ) : s.distance != null ? (
                              <div style={styles.distanceBadge}>📐 Khoảng cách: {Number(s.distance).toFixed(2)} km</div>
                            ) : null}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <aside style={styles.sidebar}>
            <h3 style={styles.sidebarTitle}>Tóm tắt đơn hàng</h3>
            
            {items.length === 0 ? (
              <div style={styles.emptyCartText}>Giỏ hàng của bạn đang trống</div>
            ) : (
              <div style={styles.orderSummaryFlow}>
                <div style={styles.itemsWrapper}>
                  {items.map(it => {
                    const activePromo = getActivePromoForProduct(it.product_id, promotions);
                    const effectivePrice = getEffectivePrice(it, promotions);
                    return (
                      <div key={it.cart_item_id} style={styles.summaryItemRow}>
                        <div style={styles.itemInfoCell}>
                          <span style={styles.itemNameText}>{it.name}</span>
                          <span style={styles.itemQtyText}>Số lượng: {it.quantity}</span>
                        </div>
                        <div style={styles.itemPriceCell}>
                          {activePromo ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                              <span style={{ fontSize: '0.75rem', color: '#888', textDecoration: 'line-through' }}>
                                {(it.price * it.quantity).toLocaleString('vi-VN')} đ
                              </span>
                              <span style={{ fontWeight: 'bold', color: '#9b1c1c' }}>
                                {(effectivePrice * it.quantity).toLocaleString('vi-VN')} đ
                              </span>
                            </div>
                          ) : (
                            <span>{(it.price * it.quantity).toLocaleString('vi-VN')} đ</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={styles.calcDivider}></div>

                <div style={styles.calcRow}>
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString('vi-VN')} đ</span>
                </div>
                <div style={styles.calcRow}>
                  <span>Phí dịch vụ</span>
                  <span style={{color: '#28a745', fontWeight: '500'}}>Miễn phí</span>
                </div>

                <div style={styles.sectionMiniBlock}>
                  <h4 style={styles.miniTitle}>Voucher</h4>
                  <div style={styles.voucherRow}>
                    <input
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="Nhập mã voucher"
                      style={styles.voucherInput}
                    />
                    <button onClick={applyVoucher} disabled={voucherLoading} style={styles.applyVoucherBtn}>
                      {voucherLoading ? 'Đang áp...' : 'Áp dụng'}
                    </button>
                  </div>
                  {voucherResult && (
                    <div style={styles.voucherInfoBox}>
                      <div style={styles.calcRowCompact}>
                        <span>Giảm khuyến mãi</span>
                        <span>-{Number(promotionDiscount).toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div style={styles.calcRowCompact}>
                        <span>Giảm voucher</span>
                        <span>-{Number(voucherDiscount).toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div style={styles.calcRowCompact}>
                        <span>Tổng giảm</span>
                        <span>-{Number(totalDiscount).toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={styles.sectionMiniBlock}>
                  <h4 style={styles.miniTitle}>Phương thức thanh toán</h4>
                  <div style={styles.paymentOptions}>
                    {[
                      { value: 'cash', label: 'Thanh toán khi nhận hàng (COD)', desc: 'Thanh toán bằng tiền mặt khi nhận bánh' },
                      { value: 'bank_transfer', label: 'Thanh toán trực tuyến (Online)', desc: 'Chuyển khoản VietQR, ví Momo/ZaloPay, Visa/Mastercard' },
                    ].map((option) => (
                      <label key={option.value} style={{
                        ...styles.paymentOption,
                        borderColor: paymentMethod === option.value ? '#6b1111' : '#ddd',
                        backgroundColor: paymentMethod === option.value ? '#fbf8f6' : '#fff',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '4px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="radio"
                            name="payment-method"
                            value={option.value}
                            checked={paymentMethod === option.value}
                            onChange={() => setPaymentMethod(option.value)}
                            style={styles.radioInput}
                          />
                          <span style={{ fontWeight: '600', color: '#333' }}>{option.label}</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#888', paddingLeft: '28px' }}>{option.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{...styles.calcRow, ...styles.totalRow}}>
                  <span>Số tiền phải trả</span>
                  <span>{Number(amountPayable).toLocaleString('vi-VN')} đ</span>
                </div>

                <button onClick={placeOrder} disabled={submitting} style={styles.orderSubmitBtn}>
                  {submitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
                </button>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

const styles = {
  page: { backgroundColor: '#fdfdfd', minHeight: '100vh', fontFamily: "'Montserrat', sans-serif" },
  container: { maxWidth: '1200px', margin: '60px auto', padding: '0 20px', boxSizing: 'border-box' },
  pageTitle: { fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', textAlign: 'center', margin: 0, color: '#333' },
  underline: { width: '60px', height: '3px', backgroundColor: '#6b1111', margin: '20px auto 50px' },
  
  layout: { display: 'grid', gridTemplateColumns: '1.6fr 0.9fr', gap: '50px', alignItems: 'start' },
  
  formSection: { display: 'flex', flexDirection: 'column', gap: '40px' },
  sectionBlock: { backgroundColor: '#fff', padding: '30px', border: '1px solid #eee', borderRadius: '4px' },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#333', margin: '0 0 20px 0', borderBottom: '1px solid #f5f5f5', paddingBottom: '10px' },
  
  methodToggleGroup: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  methodLabel: { display: 'flex', alignItems: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.3s ease' },
  methodName: { display: 'block', fontWeight: '700', fontSize: '1rem', color: '#333', marginBottom: '4px' },
  methodDesc: { display: 'block', fontSize: '0.8rem', color: '#777' },
  
  radioInput: { marginRight: '15px', accentColor: '#6b1111', width: '18px', height: '18px', flexShrink: 0 },
  textarea: { width: '100%', minHeight: '100px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.3s' },
  
  locationActionRow: { display: 'flex', gap: '15px', marginBottom: '20px' },
  locationBtn: { backgroundColor: '#6b1111', color: '#fff', border: 'none', padding: '12px 20px', fontSize: '0.85rem', fontWeight: '700', borderRadius: '2px', cursor: 'pointer', transition: '0.3s' },
  secondaryLocationBtn: { backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', padding: '12px 20px', fontSize: '0.85rem', fontWeight: '600', borderRadius: '2px', cursor: 'pointer', transition: '0.3s' },
  coordsBadge: { fontSize: '0.8rem', color: '#b89a5b', backgroundColor: '#faf6f0', padding: '8px 15px', borderRadius: '4px', display: 'inline-block', marginBottom: '15px', fontWeight: '600' },
  
  storeListContainer: { marginTop: '15px' },
  storeCardsGrid: { display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '320px', overflowY: 'auto', paddingRight: '5px' },
  storeCard: { display: 'flex', alignItems: 'center', padding: '18px', border: '1px solid #eee', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.3s ease' },
  storeInfoWrap: { flex: 1 },
  storeName: { display: 'block', fontSize: '1rem', color: '#222', marginBottom: '4px' },
  storeAddress: { fontSize: '0.85rem', color: '#666', lineHeight: '1.4' },
  distanceBadge: { fontSize: '0.8rem', color: '#b89a5b', marginTop: '6px', fontWeight: '600' },
  emptyStores: { color: '#999', fontSize: '0.9rem', fontStyle: 'italic', padding: '10px 0' },

  sidebar: { backgroundColor: '#fff', padding: '35px', border: '1px solid #eee', borderRadius: '4px', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' },
  sidebarTitle: { fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', margin: '0 0 25px 0', paddingBottom: '15px', borderBottom: '1px solid #eee' },
  emptyCartText: { color: '#999', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' },
  orderSummaryFlow: { display: 'flex', flexDirection: 'column' },
  itemsWrapper: { maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' },
  summaryItemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  itemInfoCell: { display: 'flex', flexDirection: 'column', gap: '3px' },
  itemNameText: { fontWeight: '600', fontSize: '0.95rem', color: '#333' },
  itemQtyText: { fontSize: '0.8rem', color: '#888' },
  itemPriceCell: { fontWeight: '600', fontSize: '0.95rem', color: '#444' },
  
  calcDivider: { height: '1px', backgroundColor: '#eee', margin: '15px 0' },
  calcRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.95rem', color: '#666' },
  calcRowCompact: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', color: '#666' },
  sectionMiniBlock: { marginTop: '15px' },
  miniTitle: { margin: '0 0 12px 0', fontSize: '0.95rem', color: '#333' },
  voucherRow: { display: 'flex', gap: '10px' },
  voucherInput: { flex: 1, padding: '12px 14px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.92rem', outline: 'none' },
  applyVoucherBtn: { padding: '12px 16px', border: 'none', backgroundColor: '#333', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' },
  voucherInfoBox: { marginTop: '12px', padding: '12px 14px', backgroundColor: '#faf6f0', border: '1px solid #f0e2cf', borderRadius: '4px' },
  paymentOptions: { display: 'grid', gap: '10px' },
  paymentOption: { display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #ddd', borderRadius: '4px', padding: '12px 14px', cursor: 'pointer' },
  totalRow: { borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '10px', color: '#6b1111', fontWeight: '700', fontSize: '1.3rem' },
  
  orderSubmitBtn: { marginTop: '25px', width: '100%', padding: '18px', backgroundColor: '#6b1111', color: '#fff', border: 'none', fontWeight: '700', letterSpacing: '2px', fontSize: '0.95rem', cursor: 'pointer', transition: '0.3s' },
  statusBox: { textAlign: 'center', padding: '120px 0', fontSize: '1.2rem', fontStyle: 'italic', color: '#888' }
};

export default Checkout;