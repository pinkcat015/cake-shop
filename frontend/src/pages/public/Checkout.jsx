import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [stores, setStores] = useState([]);
  const [nearestLoading, setNearestLoading] = useState(false);
  const [storesLoading, setStoresLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [coords, setCoords] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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

  const loadAllStores = async () => {
    setStoresLoading(true);
    try {
      const res = await api.get('/stores');
      const list = res.data?.stores || [];
      setStores(list);
      if (list.length && !selectedStore) {
        setSelectedStore(list[0]);
      }
    } catch (err) {
      console.error(err);
      alert('Không thể tải danh sách cửa hàng');
    } finally {
      setStoresLoading(false);
    }
  };

  useEffect(() => { loadCart(); }, []);

  useEffect(() => {
    if (stores.length === 0) {
      loadAllStores();
    }
  }, [deliveryMethod]);

  const subtotal = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0);

  const placeOrder = async () => {
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
      const payload = {
        address,
        delivery_method: deliveryMethod,
        store_id: selectedStore.store_id || selectedStore.id,
      };
      if (coords) {
        payload.delivery_latitude = coords.lat;
        payload.delivery_longitude = coords.lng;
      }
      await api.post('/orders', payload);
      alert('Đặt hàng thành công!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi đặt hàng');
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

  if (loading) return <div><Navbar /><div style={{padding:40}}>Loading checkout...</div></div>;

  return (
    <div>
      <Navbar />
      <main style={{maxWidth:900, margin:'40px auto', padding:'0 20px'}}>
        <h2>Checkout</h2>
        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:30}}>
          <section>
            <h3>Thông tin giao hàng</h3>
            {deliveryMethod === 'delivery' && (
              <div style={{marginBottom:12}}>
                <label>Địa chỉ nhận hàng</label>
                <textarea value={address} onChange={(e)=> setAddress(e.target.value)} style={{width:'100%', minHeight:120, marginTop:8}} />
              </div>
            )}
            <div style={{marginBottom:12}}>
              <label>Chọn cửa hàng</label>
              <div style={{marginTop:8}}>
                <button onClick={suggestNearestStores} disabled={nearestLoading} style={{padding:'8px 12px', marginRight:8}}>{nearestLoading ? 'Đang tìm...' : 'Gợi ý cửa hàng gần nhất'}</button>
                <button onClick={loadAllStores} disabled={storesLoading} style={{padding:'8px 12px'}}>{storesLoading ? 'Đang tải...' : 'Tải danh sách cửa hàng'}</button>
              </div>
              <div style={{marginTop:12}}>
                {coords ? <div style={{fontSize:12, color:'#666'}}>Vị trí: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</div> : null}
                {stores.length === 0 ? <div style={{marginTop:8}}>Chưa có cửa hàng</div> : (
                  <div style={{marginTop:8}}>
                    {stores.map(s => (
                      <label key={s.store_id || s.id} style={{display:'block', marginBottom:8, border: selectedStore && (selectedStore.store_id === s.store_id || selectedStore.id === s.id) ? '1px solid #6b1111' : '1px solid #eee', padding:8, borderRadius:4}}>
                        <input type="radio" name="store" checked={selectedStore && (selectedStore.store_id === s.store_id || selectedStore.id === s.id)} onChange={() => setSelectedStore(s)} style={{marginRight:8}} />
                        <strong>{s.name || s.store_name || 'Cửa hàng'}</strong>
                        <div style={{fontSize:12, color:'#444'}}>{s.address || s.addr || ''}</div>
                        {s.distance != null ? <div style={{fontSize:12, color:'#666'}}>Khoảng cách: {Number(s.distance).toFixed(2)} km</div> : null}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label>Phương thức nhận</label>
              <div>
                <label style={{marginRight:12}}>
                  <input type="radio" name="method" value="delivery" checked={deliveryMethod==='delivery'} onChange={()=> setDeliveryMethod('delivery')} /> Giao tận nơi
                </label>
                <label>
                  <input type="radio" name="method" value="pickup" checked={deliveryMethod==='pickup'} onChange={()=> setDeliveryMethod('pickup')} /> Nhận tại cửa hàng
                </label>
              </div>
            </div>

            <div style={{marginTop:20}}>
              <button onClick={placeOrder} disabled={submitting} style={{padding:'12px 20px', backgroundColor:'#6b1111', color:'#fff', border:'none', cursor:'pointer'}}>Đặt hàng</button>
            </div>
          </section>

          <aside style={{border:'1px solid #eee', padding:20, borderRadius:6}}>
            <h3>Đơn hàng</h3>
            {items.length === 0 ? <div>Giỏ hàng trống</div> : (
              <div>
                {items.map(it => (
                  <div key={it.cart_item_id} style={{display:'flex', justifyContent:'space-between', marginBottom:10}}>
                    <div>{it.name} x {it.quantity}</div>
                    <div>{(it.price * it.quantity).toLocaleString('vi-VN')} VND</div>
                  </div>
                ))}
                <hr />
                <div style={{display:'flex', justifyContent:'space-between', fontWeight:700}}>Tổng cộng <span>{subtotal.toLocaleString('vi-VN')} VND</span></div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
