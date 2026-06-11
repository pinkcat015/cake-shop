import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/api';
import Navbar from '../../components/Navbar';
import { MapPin, Clock, Phone, Store, Star, CheckCircle, XCircle, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const emptyForm = {
  name: '',
  address: '',
  phone: '',
  open_hours: '',
  description: '',
  rating: '',
  image_url: '',
  active: 1,
};

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const loadStores = async () => {
    try {
      const res = await api.get('/stores/admin');
      setStores(Array.isArray(res.data.stores) ? res.data.stores : []);
    } catch (err) {
      setError('Không thể tải danh sách cửa hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStores(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setMessage('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const fillForEdit = (store) => {
    setEditingId(store.store_id);
    setForm({
      name: store.name || '',
      address: store.address || '',
      phone: store.phone || '',
      open_hours: store.open_hours || '',
      description: store.description || '',
      rating: store.rating?.toString() || '',
      image_url: store.image_url || '',
      active: store.active ?? 1,
    });
    setError('');
    setMessage('Đang chỉnh sửa: ' + store.name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildPayload = (f) => ({
    name: f.name,
    address: f.address,
    phone: f.phone,
    open_hours: f.open_hours,
    description: f.description,
    rating: f.rating ? parseFloat(f.rating) : null,
    image_url: f.image_url,
    active: Number(f.active),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (isEditing) {
        await api.put(`/stores/admin/${editingId}`, buildPayload(form));
      } else {
        await api.post('/stores/admin', buildPayload(form));
      }
      await loadStores();
      resetForm();
      setMessage(isEditing ? 'Cập nhật cửa hàng thành công!' : 'Thêm cửa hàng thành công!');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu dữ liệu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cửa hàng này?')) return;
    try {
      await api.delete(`/stores/admin/${id}`);
      await loadStores();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa cửa hàng');
    }
  };

  const handleToggleActive = async (store) => {
    try {
      await api.put(`/stores/admin/${store.store_id}`, {
        ...buildPayload(store),
        active: store.active ? 0 : 1,
      });
      await loadStores();
    } catch {
      setError('Không thể cập nhật trạng thái');
    }
  };

  return (
    <div style={styles.adminPage}>
      <Navbar />

      <header style={styles.headerHero}>
        <div style={styles.overlay}>
          <p style={styles.kicker}>Backoffice Management</p>
          <h1 style={styles.mainTitle}>QUẢN LÝ CỬA HÀNG</h1>
        </div>
      </header>

      <main style={styles.container}>
        <div style={styles.layout}>

          {/* CỘT TRÁI: FORM */}
          <aside style={styles.formSection}>
            <form style={styles.card} onSubmit={handleSubmit}>
              <h2 style={styles.cardTitle}>{isEditing ? 'Sửa Cửa Hàng' : 'Thêm Cửa Hàng Mới'}</h2>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Tên cửa hàng *</label>
                <input name="name" style={styles.input} value={form.name} onChange={handleChange} required placeholder="Scarlett Hoàn Kiếm" />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Địa chỉ</label>
                <input name="address" style={styles.input} value={form.address} onChange={handleChange} placeholder="12 Hàng Bài, Hoàn Kiếm, Hà Nội" />
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Số điện thoại</label>
                  <input name="phone" style={styles.input} value={form.phone} onChange={handleChange} placeholder="024 1234 5678" />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Giờ mở cửa</label>
                  <input name="open_hours" style={styles.input} value={form.open_hours} onChange={handleChange} placeholder="07:00-22:00" />
                </div>
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Đánh giá (1-5)</label>
                  <input name="rating" type="number" min="0" max="5" step="0.1" style={styles.input} value={form.rating} onChange={handleChange} placeholder="4.8" />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Trạng thái</label>
                  <select name="active" style={styles.input} value={form.active} onChange={handleChange}>
                    <option value={1}>Đang hoạt động</option>
                    <option value={0}>Tạm đóng</option>
                  </select>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Mô tả</label>
                <textarea name="description" style={styles.textarea} value={form.description} onChange={handleChange} rows="2" placeholder="Cửa hàng nằm ngay trung tâm..." />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>URL Hình ảnh</label>
                <input name="image_url" style={styles.input} value={form.image_url} onChange={handleChange} placeholder="https://images.unsplash.com/..." />
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="preview"
                    style={styles.imgPreview}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
              </div>

              <div style={styles.formActions}>
                <button type="submit" disabled={submitting} style={styles.submitBtn}>
                  {submitting ? '...' : isEditing ? 'Cập Nhật' : 'Thêm Cửa Hàng'}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} style={styles.cancelBtn}>Hủy</button>
                )}
              </div>

              {error && <p style={styles.errorText}>{error}</p>}
              {message && <p style={styles.successText}>{message}</p>}
            </form>
          </aside>

          {/* CỘT PHẢI: DANH SÁCH */}
          <section style={styles.listSection}>
            <div style={styles.listHeader}>
              <h2 style={styles.listTitle}>Cửa hàng ({stores.length})</h2>
            </div>

            {loading ? (
              <p style={{ color: '#999', fontSize: '0.85rem' }}>Đang tải...</p>
            ) : stores.length === 0 ? (
              <p style={{ color: '#999', fontSize: '0.85rem' }}>Chưa có cửa hàng nào.</p>
            ) : (
              <div style={styles.scrollList}>
                {stores.map(store => (
                  <div key={store.store_id} style={styles.storeRow}>

                    {/* Ảnh thumbnail */}
                    <div style={styles.imgContainer}>
                      {store.image_url ? (
                        <img
                          src={store.image_url}
                          alt={store.name}
                          style={styles.thumb}
                          onError={e => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div style={{ ...styles.noThumb, display: store.image_url ? 'none' : 'flex' }}>
                        <Store size={28} color="#c9a06a" />
                      </div>
                    </div>

                    {/* Thông tin */}
                    <div style={styles.info}>
                      <h4 style={styles.pName}>{store.name}</h4>
                      <p style={styles.pSub}>
                        <MapPin size={11} style={{ marginRight: 4, verticalAlign: 'middle', color: '#6b1111', flexShrink: 0 }} />
                        {store.address || 'Chưa có địa chỉ'}
                      </p>
                      <p style={styles.pSub}>
                        <Clock size={11} style={{ marginRight: 4, verticalAlign: 'middle', color: '#888', flexShrink: 0 }} />
                        {store.open_hours || '—'}
                        &nbsp;·&nbsp;
                        <Phone size={11} style={{ marginRight: 4, verticalAlign: 'middle', color: '#888', flexShrink: 0 }} />
                        {store.phone || '—'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: store.active ? '#e8f5e8' : '#fdecea',
                          color: store.active ? '#2e7d32' : '#c62828',
                          display: 'flex', alignItems: 'center', gap: 3,
                        }}>
                          {store.active
                            ? <><CheckCircle size={10} /> Hoạt động</>
                            : <><XCircle size={10} /> Tạm đóng</>}
                        </span>
                        {store.rating && (
                          <span style={{ ...styles.ratingBadge, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Star size={11} fill="#b87a00" stroke="none" />
                            {store.rating}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={styles.actions}>
                      <button onClick={() => fillForEdit(store)} style={styles.editBtn} title="Sửa">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleToggleActive(store)} style={styles.toggleBtn} title={store.active ? 'Đóng cửa' : 'Mở cửa'}>
                        {store.active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                      </button>
                      <button onClick={() => handleDelete(store.store_id)} style={styles.delBtn} title="Xóa">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

const styles = {
  adminPage: { backgroundColor: '#fdfdfd', minHeight: '100vh', fontFamily: "'Montserrat', sans-serif" },
  headerHero: { height: '180px', position: 'relative' },
  overlay: {
    position: 'absolute', inset: 0, backgroundColor: '#6b1111',
    backgroundImage: 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url("https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1200")',
    backgroundSize: 'cover', backgroundPosition: 'center',
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff',
  },
  mainTitle: { fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', color: '#fff', margin: 0 },
  kicker: { textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.75rem', marginBottom: '15px' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' },
  layout: { display: 'grid', gridTemplateColumns: '1.2fr 1.3fr', gap: '30px', alignItems: 'start' },
  formSection: { position: 'sticky', top: '20px' },
  card: { backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' },
  cardTitle: { fontFamily: "'Playfair Display', serif", color: '#6b1111', marginBottom: '20px', fontSize: '1.4rem' },
  inputGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column' },
  inputRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  label: { fontSize: '0.8rem', fontWeight: '600', marginBottom: '5px', color: '#555' },
  input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem', outline: 'none' },
  textarea: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem', resize: 'none' },
  imgPreview: { marginTop: '10px', width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eee' },
  formActions: { display: 'flex', gap: '10px', marginTop: '10px' },
  submitBtn: { flex: 2, backgroundColor: '#6b1111', color: '#fff', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
  cancelBtn: { flex: 1, backgroundColor: '#eee', color: '#333', padding: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  errorText: { color: 'red', fontSize: '0.75rem', marginTop: '10px' },
  successText: { color: 'green', fontSize: '0.75rem', marginTop: '10px' },
  listSection: { backgroundColor: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #eee' },
  listHeader: { marginBottom: '20px' },
  listTitle: { fontSize: '1.1rem', margin: 0, borderLeft: '4px solid #6b1111', paddingLeft: '10px' },
  scrollList: { maxHeight: '700px', overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  storeRow: { display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f5f5f5', gap: '14px' },
  imgContainer: { width: '90px', height: '70px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f4e8d0', flexShrink: 0 },
  thumb: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  noThumb: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, minWidth: 0 },
  pName: { margin: '0 0 4px', fontSize: '0.9rem', fontWeight: 'bold', color: '#1a0a0a' },
  pSub: { margin: '0 0 3px', fontSize: '0.72rem', color: '#777', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center' },
  badge: { padding: '3px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '700' },
  ratingBadge: { fontSize: '0.72rem', color: '#b87a00', fontWeight: '700' },
  actions: { display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 },
  editBtn: { width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #6b1111', color: '#6b1111', backgroundColor: '#fff', borderRadius: '6px', cursor: 'pointer' },
  toggleBtn: { width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #888', color: '#555', backgroundColor: '#fff', borderRadius: '6px', cursor: 'pointer' },
  delBtn: { width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #dc3545', color: '#dc3545', backgroundColor: '#fff', borderRadius: '6px', cursor: 'pointer' },
};

export default AdminStores;