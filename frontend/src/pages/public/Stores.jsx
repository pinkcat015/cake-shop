import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import Navbar from '../../components/Navbar';

const Stores = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, open

  useEffect(() => {
    const loadStores = async () => {
      try {
        const res = await api.get('/stores');
        setStores(res.data.stores || []);
      } catch (err) {
        console.error(err);
        alert('Không thể tải danh sách cửa hàng');
      } finally {
        setLoading(false);
      }
    };
    loadStores();
  }, []);

  const isOpen = (openHours) => {
    if (!openHours) return true;
    const [open, close] = openHours.split('-');
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(open.replace(':', ''));
    const closeTime = parseInt(close.replace(':', ''));
    return currentTime >= openTime && currentTime < closeTime;
  };

  const filteredStores = stores.filter(store => {
    if (filter === 'open') return isOpen(store.open_hours);
    return true;
  });

  if (loading) return <div><Navbar /><div style={{padding: 40}}>Loading...</div></div>;

  return (
    <div>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ marginBottom: 30 }}>Danh sách cửa hàng</h1>

        <div style={{ marginBottom: 30 }}>
          <label style={{ marginRight: 20 }}>
            <input
              type="radio"
              name="filter"
              value="all"
              checked={filter === 'all'}
              onChange={(e) => setFilter(e.target.value)}
              style={{ marginRight: 8 }}
            />
            Tất cả ({stores.length})
          </label>
          <label>
            <input
              type="radio"
              name="filter"
              value="open"
              checked={filter === 'open'}
              onChange={(e) => setFilter(e.target.value)}
              style={{ marginRight: 8 }}
            />
            Đang mở cửa ({stores.filter(s => isOpen(s.open_hours)).length})
          </label>
        </div>

        {filteredStores.length === 0 ? (
          <div style={{ padding: 20, backgroundColor: '#f9f9f9', borderRadius: 8, textAlign: 'center', color: '#666' }}>
            Không có cửa hàng nào
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filteredStores.map(store => (
              <div
                key={store.store_id}
                onClick={() => navigate(`/stores/${store.store_id}`)}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  padding: 20,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 18, color: '#6b1111' }}>{store.name}</h3>
                </div>

                <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, color: '#FFB800' }}>{'★'.repeat(Math.floor(store.rating))} {store.rating}</span>
                  <span style={{
                    padding: '4px 8px',
                    backgroundColor: isOpen(store.open_hours) ? '#d4edda' : '#f8d7da',
                    color: isOpen(store.open_hours) ? '#155724' : '#721c24',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}>
                    {isOpen(store.open_hours) ? '✓ Mở' : '✗ Đóng'}
                  </span>
                </div>

                <div style={{ marginBottom: 10, fontSize: 13, color: '#666', lineHeight: 1.5 }}>
                  <div style={{ marginBottom: 6 }}>
                    📍 {store.address}
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    ⏰ {store.open_hours}
                  </div>
                  <div>
                    📞 {store.phone}
                  </div>
                </div>

                <p style={{ margin: '12px 0', fontSize: 13, color: '#555', fontStyle: 'italic' }}>
                  {store.description}
                </p>

                <button style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#6b1111',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginTop: 12
                }}>
                  Xem chi tiết →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Stores;
