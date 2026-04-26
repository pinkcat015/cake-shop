import React, { useEffect, useMemo, useState } from 'react';
import api, { toAssetUrl } from '../../api/api';
import Navbar from '../../components/Navbar';

const emptyForm = {
  name: '',
  price: '',
  quantity: '0',
  description: '',
  category: '',
  imageUrl: '',
};

const getQuantityValue = (item) => {
  const raw = item?.quantity ?? item?.stock ?? item?.stock_quantity ?? 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const getStatusValue = (item) => {
  if (item?.status) return item.status;
  return getQuantityValue(item) > 0 ? 'ACTIVE' : 'OUT_OF_STOCK';
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
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const isEditing = useMemo(() => editingId !== null, [editingId]);
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['all', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || getStatusValue(item) === statusFilter;
      return matchCategory && matchStatus;
    });
  }, [products, categoryFilter, statusFilter]);

  const categoryOptions = useMemo(() => categories.filter((item) => item !== 'all'), [categories]);

  const categorySelectValue = useMemo(() => {
    if (isCustomCategory) {
      return '__custom__';
    }
    if (!form.category) {
      return '';
    }
    return categoryOptions.includes(form.category) ? form.category : '__custom__';
  }, [categoryOptions, form.category, isCustomCategory]);

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

  useEffect(() => { loadProducts(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setEditingId(null);
    setMessage('');
    setIsCustomCategory(false);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleQuantityChange = (e) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
    setForm((prev) => ({ ...prev, quantity: digitsOnly }));
  };

  const handleQuantityWheel = (e) => {
    // Prevent mouse wheel from decrementing number accidentally while scrolling.
    e.currentTarget.blur();
  };

  const fillForEdit = (item) => {
    const nextCategory = item.category || '';
    const knownCategory = nextCategory && categoryOptions.includes(nextCategory);

    setEditingId(item.product_id);
    setForm({
      name: item.name || '',
      price: item.price?.toString() || '',
      quantity: String(getQuantityValue(item)),
      description: item.description || '',
      category: nextCategory,
      imageUrl: item.image || '',
    });
    setIsCustomCategory(Boolean(nextCategory) && !knownCategory);
    setImageFile(null);
    setMessage('Đang chỉnh sửa: ' + item.name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelectChange = (e) => {
    const value = e.target.value;
    if (value === '__custom__') {
      setIsCustomCategory(true);
      setForm((prev) => ({ ...prev, category: '' }));
      return;
    }

    setIsCustomCategory(false);
    setForm((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const normalizedQuantity = form.quantity === '' ? '0' : form.quantity;
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('price', form.price);
      payload.append('quantity', normalizedQuantity);
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
      setError(err.response?.data?.message || 'Lỗi khi lưu dữ liệu');
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
      setError(err.response?.data?.message || 'Lỗi khi xóa sản phẩm');
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
                  <label style={styles.label}>Số lượng tồn kho</label>
                  <input
                    name="quantity"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    style={styles.input}
                    value={form.quantity}
                    onChange={handleQuantityChange}
                    onWheel={handleQuantityWheel}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Danh mục</label>
                  <select
                    value={categorySelectValue}
                    onChange={handleCategorySelectChange}
                    style={styles.input}
                  >
                    <option value="">Chọn danh mục</option>
                    {categoryOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                    <option value="__custom__">+ Thêm danh mục mới</option>
                  </select>
                </div>
              </div>

              {isCustomCategory && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Danh mục mới</label>
                  <input
                    name="category"
                    style={styles.input}
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Ví dụ: Bánh lạnh"
                    required
                  />
                </div>
              )}

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
              <h2 style={styles.listTitle}>Sản phẩm hiện có ({filteredProducts.length})</h2>
              <div style={styles.filterGroup}>
                <div style={styles.filterBox}>
                  <label style={styles.filterLabel}>Lọc theo danh mục</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={styles.filterSelect}
                  >
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item === 'all' ? 'Tất cả danh mục' : item}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.filterBox}>
                  <label style={styles.filterLabel}>Lọc theo trạng thái</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="ACTIVE">Còn hàng</option>
                    <option value="OUT_OF_STOCK">Hết hàng</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? <p>Đang tải dữ liệu...</p> : (
              <div style={styles.scrollList}>
                {filteredProducts.map((item) => {
                  const quantityValue = getQuantityValue(item);
                  const statusValue = getStatusValue(item);

                  return (
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
                      <p style={styles.pStock}>Tồn kho: {quantityValue}</p>
                      <p style={{ ...styles.pStatus, color: statusValue === 'ACTIVE' ? '#1f7a31' : '#9b1111' }}>
                        Trạng thái: {statusValue === 'ACTIVE' ? 'Còn hàng' : 'Hết hàng'}
                      </p>
                      <p style={styles.pPrice}>{Number(item.price).toLocaleString('vi-VN')} đ</p>
                    </div>
                    <div style={styles.actions}>
                      <button onClick={() => fillForEdit(item)} style={styles.editBtn}>Sửa</button>
                      {canDelete && (
                        <button onClick={() => handleDelete(item.product_id)} style={styles.delBtn}>Xóa</button>
                      )}
                    </div>
                  </div>
                  );
                })}
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
  listHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '15px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  listTitle: { 
    fontSize: '1.2rem', 
    marginBottom: 0,
    borderBottom: '2px solid #6b1111', 
    paddingBottom: '10px'
  },
  filterBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: '220px'
  },
  filterGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  filterLabel: {
    fontSize: '0.75rem',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  filterSelect: {
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '10px',
    fontSize: '0.9rem',
    backgroundColor: '#fff'
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
  pStock: { margin: '4px 0 0 0', fontSize: '0.8rem', color: '#555' },
  pStatus: { margin: '4px 0 0 0', fontSize: '0.8rem', fontWeight: '600' },
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