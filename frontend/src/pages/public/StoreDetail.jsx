import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Navbar from '../../components/Navbar';

const StoreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  if (loading) return <div><Navbar /><div style={{padding: 40}}>Loading...</div></div>;
  if (!store) return <div><Navbar /><div style={{padding: 40}}>Cửa hàng không tìm thấy</div></div>;

  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(store.address)}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;

  const isOpen = () => {
    if (!store.open_hours) return true;
    const [open, close] = store.open_hours.split('-');
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(open.replace(':', ''));
    const closeTime = parseInt(close.replace(':', ''));
    return currentTime >= openTime && currentTime < closeTime;
  };

  return (
    <div>
      <Navbar />
      <main style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
        <button onClick={() => navigate(-1)} style={{ padding: '8px 16px', marginBottom: 20, backgroundColor: '#f0f0f0', border: '1px solid #ccc', cursor: 'pointer', borderRadius: 4 }}>← Quay lại</button>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 30 }}>
          <section>
            <h1 style={{ margin: '0 0 10px' }}>{store.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 18, fontWeight: 'bold', color: '#FFB800' }}>{'★'.repeat(Math.floor(store.rating))} {store.rating}</span>
              <span style={{ color: isOpen() ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                {isOpen() ? '✓ Đang mở cửa' : '✗ Đã đóng cửa'}
              </span>
            </div>

            <div style={{ backgroundColor: '#f9f9f9', padding: 20, borderRadius: 8, marginBottom: 30 }}>
              <h3 style={{ margin: '0 0 15px', color: '#333' }}>Thông tin cửa hàng</h3>

              <div style={{ marginBottom: 15 }}>
                <strong>Địa chỉ:</strong>
                <p style={{ margin: '5px 0 0', color: '#666', lineHeight: 1.6 }}>{store.address}</p>
              </div>

              <div style={{ marginBottom: 15 }}>
                <strong>Điện thoại:</strong>
                <p style={{ margin: '5px 0 0', color: '#666' }}>
                  <a href={`tel:${store.phone}`} style={{ color: '#6b1111', textDecoration: 'none' }}>
                    {store.phone}
                  </a>
                </p>
              </div>

              <div style={{ marginBottom: 15 }}>
                <strong>Giờ mở cửa:</strong>
                <p style={{ margin: '5px 0 0', color: '#666' }}>{store.open_hours}</p>
              </div>

              <div>
                <strong>Mô tả:</strong>
                <p style={{ margin: '5px 0 0', color: '#666', lineHeight: 1.6 }}>{store.description}</p>
              </div>
            </div>

            <div style={{ backgroundColor: '#f9f9f9', padding: 20, borderRadius: 8, marginBottom: 30 }}>
              <h3 style={{ margin: '0 0 15px', color: '#333' }}>Vị trí cửa hàng</h3>
              <div style={{ 
                width: '100%', 
                height: 300, 
                backgroundColor: '#e9ecef', 
                borderRadius: 8, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: 15,
                border: '1px solid #dee2e6'
              }}>
                <iframe 
                  style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDG3_L92Ax3P7iZXe2l7G-qnPQ5JZJIJBo&q=${store.latitude},${store.longitude}`}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 15 }}>
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer" style={{
                flex: 1,
                padding: '12px 20px',
                backgroundColor: '#6b1111',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: 4,
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                📍 Hướng dẫn đường
              </a>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{
                flex: 1,
                padding: '12px 20px',
                backgroundColor: '#495057',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: 4,
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                🗺️ Xem bản đồ
              </a>
            </div>
          </section>

          <aside style={{ border: '1px solid #eee', padding: 20, borderRadius: 6, height: 'fit-content' }}>
            <h3 style={{ margin: '0 0 15px' }}>Liên hệ</h3>
            <div style={{ marginBottom: 15 }}>
              <strong>Tọa độ:</strong>
              <p style={{ margin: '5px 0 0', fontSize: 12, color: '#666', fontFamily: 'monospace' }}>
                {store.latitude}<br/>
                {store.longitude}
              </p>
            </div>
            <div>
              <strong>Trạng thái:</strong>
              <p style={{ margin: '5px 0 0', color: store.active ? '#28a745' : '#dc3545' }}>
                {store.active ? '✓ Đang hoạt động' : '✗ Tạm ngưng'}
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default StoreDetail;
