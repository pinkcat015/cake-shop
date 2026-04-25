import React, { useEffect, useMemo, useState } from 'react';
import api, { toAssetUrl } from '../../api/api';
import Navbar from '../../components/Navbar';

const emptyForm = {
  name: '',
  price: '',
  description: '',
  category: '',
  imageUrl: '',
};

const AdminProducts = ({ canDelete = true, panelType = 'admin' }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data || []);
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setEditingId(null);
    setMessage('');
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fillForEdit = (item) => {
    setEditingId(item.product_id);
    setForm({
      name: item.name || '',
      price: item.price?.toString() || '',
      description: item.description || '',
      category: item.category || '',
      imageUrl: item.image || '',
    });
    setImageFile(null);
    setMessage('Đang chỉnh sửa: ' + item.name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('price', form.price);
      payload.append('description', form.description);
      payload.append('category', form.category);
      if (imageFile) payload.append('image', imageFile);
      else if (form.imageUrl) payload.append('image', form.imageUrl);

      if (isEditing) {
        await api.put(`/products/${editingId}`, payload);
        setMessage('Cập nhật thành công!');
      } else {
        await api.post('/products', payload);
        setMessage('Thêm sản phẩm mới thành công!');
      }
      await loadProducts();
      resetForm();
    } catch (err) {
      setError('Lỗi khi lưu dữ liệu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!canDelete) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await api.delete(`/products/${id}`);
      await loadProducts();
    } catch (err) {
      setError('Lỗi khi xóa sản phẩm');
    }
  };

  return (
    <div style={styles.adminPage}>
      <Navbar />
      
      <header style={styles.headerHero}>
        <div style={styles.overlay}>
          <p style={styles.kicker}>{panelType === 'employee' ? 'Operations Console' : 'Backoffice Management'}</p>
          <h1 style={styles.mainTitle}>{panelType === 'employee' ? 'ĐIỀU PHỐI SẢN PHẨM' : 'QUẢN LÝ CỬA HÀNG'}</h1>
        </div>
      </header>

      <main style={styles.container}>
        <div style={styles.layout}>
          
          {/* CỘT TRÁI: FORM NHẬP LIỆU */}
          <aside style={styles.formSection}>
            <form style={styles.card} onSubmit={handleSubmit}>
              <h2 style={styles.cardTitle}>{isEditing ? 'Sửa Sản Phẩm' : 'Tạo Bánh Mới'}</h2>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Tên sản phẩm</label>
                <input name="name" style={styles.input} value={form.name} onChange={handleChange} required placeholder="Ví dụ: Bánh Croissant" />
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Giá (VND)</label>
                  <input name="price" type="number" style={styles.input} value={form.price} onChange={handleChange} required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Danh mục</label>
                  <input name="category" style={styles.input} value={form.category} onChange={handleChange} placeholder="Bánh ngọt..." />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Mô tả chi tiết</label>
                <textarea name="description" style={styles.textarea} value={form.description} onChange={handleChange} rows="3" />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Hình ảnh (File hoặc URL)</label>
                <input type="file" style={styles.fileInput} onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                <input name="imageUrl" style={styles.input} value={form.imageUrl} onChange={handleChange} placeholder="Hoặc dán URL ảnh tại đây" />
              </div>

              <div style={styles.formActions}>
                <button type="submit" disabled={submitting} style={styles.submitBtn}>
                  {submitting ? 'Đang xử lý...' : isEditing ? 'Lưu Thay Đổi' : 'Đăng Sản Phẩm'}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} style={styles.cancelBtn}>Hủy</button>
                )}
              </div>

              {error && <p style={styles.errorText}>{error}</p>}
              {message && <p style={styles.successText}>{message}</p>}
            </form>
          </aside>

          {/* CỘT PHẢI: DANH SÁCH SẢN PHẨM */}
          <section style={styles.listSection}>
            <div style={styles.listHeader}>
              <h2 style={styles.listTitle}>Sản phẩm hiện có ({products.length})</h2>
            </div>

            {loading ? <p>Đang tải dữ liệu...</p> : (
              <div style={styles.scrollList}>
                {products.map((item) => (
                  <div key={item.product_id} style={styles.productRow}>
                    <div style={styles.imgContainer}>
                      {item.image ? (
                        <img src={toAssetUrl(item.image)} alt={item.name} style={styles.thumb} />
                      ) : (
                        <div style={styles.noThumb}>No Pic</div>
                      )}
                    </div>
                    <div style={styles.info}>
                      <h4 style={styles.pName}>{item.name}</h4>
                      <p style={styles.pCategory}>{item.category || 'Bakery'}</p>
                      <p style={styles.pPrice}>{Number(item.price).toLocaleString('vi-VN')} đ</p>
                    </div>
                    <div style={styles.actions}>
                      <button onClick={() => fillForEdit(item)} style={styles.editBtn}>Sửa</button>
                      {canDelete && (
                        <button onClick={() => handleDelete(item.product_id)} style={styles.delBtn}>Xóa</button>
                      )}
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
  adminPage: { 
    backgroundColor: '#fdfdfd', 
    minHeight: '100vh', 
    fontFamily: "'Montserrat', sans-serif" 
  },
  headerHero: { 
    height: '200px', 
    backgroundSize: 'cover', 
    backgroundPosition: 'center', 
    position: 'relative' 
  },
  overlay: { 
    position: 'absolute', 
    inset: 0, 
    backgroundColor: '#6b1111', 
    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://i.pinimg.com/1200x/56/6a/fc/566afc90e2b4ee052f27f40295f70e5a.jpg")', 
    display: 'flex', 
    flexDirection: 'column',  
    justifyContent: 'center', 
    alignItems: 'center', 
    color: '#fff' 
  },
  mainTitle: { 
    fontFamily: "'Playfair Display', serif", 
    fontSize: '2.5rem', 
    color: '#fff',
    margin: 0 
  },
  kicker: { 
    textTransform: 'uppercase', 
    letterSpacing: '3px', 
    fontSize: '0.8rem', 
    marginBottom: '30px' 
  },
  container: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: '40px 20px' 
  },
  layout: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1.5fr', 
    gap: '40px', 
    alignItems: 'start' 
  },
  formSection: { 
    position: 'sticky', 
    top: '20px' 
  },
  card: { 
    backgroundColor: '#fff', 
    padding: '30px', 
    borderRadius: '8px', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
    border: '1px solid #eee' 
  },
  cardTitle: { 
    fontFamily: "'Playfair Display', serif", 
    color: '#6b1111', 
    marginBottom: '25px', 
    fontSize: '1.5rem' 
  },
  inputGroup: { 
    marginBottom: '18px', 
    display: 'flex', 
    flexDirection: 'column' 
  },
  inputRow: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '15px' 
  },
  label: { 
    fontSize: '0.85rem', 
    fontWeight: '600', 
    marginBottom: '6px', 
    color: '#555' 
  },
  input: { 
    padding: '12px', 
    border: '1px solid #ddd', 
    borderRadius: '4px', 
    fontSize: '0.9rem', 
    outline: 'none' 
  },
  textarea: { 
    padding: '12px', 
    border: '1px solid #ddd', 
    borderRadius: '4px', 
    fontSize: '0.9rem', 
    resize: 'none' 
  },
  fileInput: { 
    marginBottom: '10px', 
    fontSize: '0.8rem' 
  },
  formActions: { 
    display: 'flex', 
    gap: '10px', 
    marginTop: '10px' 
  },
  submitBtn: { 
    flex: 2, 
    backgroundColor: '#6b1111', 
    color: '#fff', 
    padding: '14px', 
    border: 'none', 
    borderRadius: '4px', 
    fontWeight: 'bold', 
    cursor: 'pointer' 
  },
  cancelBtn: { 
    flex: 1, 
    backgroundColor: '#eee', 
    color: '#333', 
    padding: '14px', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer' 
  },
  listSection: { 
    backgroundColor: '#fff', 
    padding: '30px', 
    borderRadius: '8px', 
    border: '1px solid #eee' 
  },
  listTitle: { 
    fontSize: '1.2rem', 
    marginBottom: '20px', 
    borderBottom: '2px solid #6b1111', 
    paddingBottom: '10px' 
  },
  scrollList: { 
    maxHeight: '600px', 
    overflowY: 'auto', 
    paddingRight: '10px' 
  },
  productRow: { 
    display: 'flex', 
    alignItems: 'center', 
    padding: '15px 0', 
    borderBottom: '1px solid #f5f5f5', 
    gap: '15px' 
  },
  imgContainer: { 
    width: '70px', 
    height: '70px', 
    borderRadius: '6px', 
    overflow: 'hidden', 
    backgroundColor: '#f9f9f9' 
  },
  thumb: { 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover' 
  },
  noThumb: { 
    fontSize: '0.6rem', 
    height: '100%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: '#999' 
  },
  info: { flex: 1 },
  pName: { margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 'bold' },
  pCategory: { margin: 0, fontSize: '0.75rem', color: '#b89a5b', textTransform: 'uppercase', fontWeight: 'bold' },
  pPrice: { margin: '4px 0 0 0', color: '#6b1111', fontWeight: 'bold' },
  actions: { display: 'flex', gap: '8px' },
  editBtn: { 
    padding: '6px 12px', 
    backgroundColor: '#fff', 
    border: '1px solid #6b1111', 
    color: '#6b1111', 
    borderRadius: '4px', 
    cursor: 'pointer', 
    fontSize: '0.8rem' 
  },
  delBtn: { 
    padding: '6px 12px', 
    backgroundColor: '#fff', 
    border: '1px solid #dc3545', 
    color: '#dc3545', 
    borderRadius: '4px', 
    cursor: 'pointer', 
    fontSize: '0.8rem' 
  },
  errorText: { color: 'red', fontSize: '0.8rem', marginTop: '10px' },
  successText: { color: 'green', fontSize: '0.8rem', marginTop: '10px', fontWeight: 'bold' },
  statusBox: { textAlign: 'center', padding: '20px' }
};

export default AdminProducts;