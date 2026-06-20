import React, { useEffect, useMemo, useState } from 'react';
import api, { toAssetUrl } from '../../api/api';
import Navbar from '../../components/Navbar';

const emptyForm = {
  name: '',
  price: '',
  quantity: '0',
  description: '',
  ingredients: '',
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
  const [nutritionRows, setNutritionRows] = useState([]);
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
    if (isCustomCategory) return '__custom__';
    if (!form.category) return '';
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
    setNutritionRows([]);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleQuantityChange = (e) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
    setForm((prev) => ({ ...prev, quantity: digitsOnly }));
  };

  const handleQuantityWheel = (e) => { e.currentTarget.blur(); };

  const fillForEdit = async (item) => {
    const nextCategory = item.category || '';
    const knownCategory = nextCategory && categoryOptions.includes(nextCategory);

    setEditingId(item.product_id);
    setForm({
      name: item.name || '',
      price: item.price?.toString() || '',
      quantity: String(getQuantityValue(item)),
      description: item.description || '',
      ingredients: item.ingredients || '',
      category: nextCategory,
      imageUrl: item.image || '',
    });
    setIsCustomCategory(Boolean(nextCategory) && !knownCategory);
    setImageFile(null);
    setMessage('Đang chỉnh sửa: ' + item.name);
    
    try {
      const resp = await api.get(`/products/${item.product_id}`);
      const mappedRows = (resp.data.nutritionFacts || []).map((row, idx) => ({
        name: row?.name || '',
        value: row?.value || '',
        unit: row?.unit || '',
        per: row?.per || '',
        sort_order: Number.isFinite(Number(row?.sort_order)) ? Number(row.sort_order) : idx,
      }));
      setNutritionRows(mappedRows);
    } catch {
      setNutritionRows([]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addNutritionRow = () => {
    setNutritionRows((prev) => ([
      ...prev,
      { name: '', value: '', unit: '', per: '', sort_order: prev.length },
    ]));
  };

  const updateNutritionRow = (index, field, value) => {
    setNutritionRows((prev) => prev.map((row, i) => {
      if (i !== index) return row;
      return { ...row, [field]: value };
    }));
  };

  const removeNutritionRow = (index) => {
    setNutritionRows((prev) => prev.filter((_, i) => i !== index).map((row, i) => ({
      ...row,
      sort_order: i,
    })));
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
      payload.append('ingredients', form.ingredients || '');
      
      const nutritionToSend = (nutritionRows || [])
        .map((row, idx) => ({
          name: (row?.name || '').trim(),
          value: (row?.value || '').trim(),
          unit: (row?.unit || '').trim() || null,
          per: (row?.per || '').trim() || null,
          sort_order: idx,
        }))
        .filter((row) => row.name !== '' && row.value !== '');
      
      payload.append('nutrition', JSON.stringify(nutritionToSend));
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
          <h1 style={styles.mainTitle}>{panelType === 'employee' ? 'ĐIỀU PHỐI SẢN PHẨM' : 'QUẢN LÝ SẢN PHẨM'}</h1>
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

              <div style={styles.inputGroup}>
                <label style={styles.label}>Danh mục</label>
                <select value={categorySelectValue} onChange={handleCategorySelectChange} style={styles.input}>
                  <option value="">Chọn danh mục</option>
                  {categoryOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                  <option value="__custom__">+ Thêm danh mục mới</option>
                </select>
              </div>

              {isCustomCategory && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Danh mục mới</label>
                  <input name="category" style={styles.input} value={form.category} onChange={handleChange} placeholder="Ví dụ: Bánh lạnh" required />
                </div>
              )}

              <div style={styles.inputGroup}>
                <label style={styles.label}>Mô tả chi tiết</label>
                <textarea name="description" style={styles.textarea} value={form.description} onChange={handleChange} rows="2" />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Thành phần</label>
                <textarea name="ingredients" style={styles.textarea} value={form.ingredients} onChange={handleChange} rows="2" placeholder="bột mì, bơ..." />
              </div>

              {/* PHẦN NUTRITION FACTS - FIX RỘNG */}
              <div style={styles.nutritionWrapper}>
                <label style={styles.label}>Nutrition Facts</label>
                
                {nutritionRows.length > 0 && (
                  <div style={styles.nutritionHeader}>
                    <span>Chất</span>
                    <span>Số</span>
                    <span>Đv</span>
                    <span>Mức</span>
                    <span></span>
                  </div>
                )}

                <div style={styles.nutritionScrollArea}>
                  {nutritionRows.map((row, index) => (
                    <div key={index} style={styles.nutritionRow}>
                      <input style={styles.nutritionInput} placeholder="vd: Calo" value={row.name} onChange={(e) => updateNutritionRow(index, 'name', e.target.value)} />
                      <input style={styles.nutritionInput} placeholder="0" value={row.value} onChange={(e) => updateNutritionRow(index, 'value', e.target.value)} />
                      <input style={styles.nutritionInput} placeholder="g" value={row.unit} onChange={(e) => updateNutritionRow(index, 'unit', e.target.value)} />
                      <input style={styles.nutritionInput} placeholder="100g" value={row.per} onChange={(e) => updateNutritionRow(index, 'per', e.target.value)} />
                      <button type="button" onClick={() => removeNutritionRow(index)} style={styles.delBtnSmall}>✕</button>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={addNutritionRow} style={styles.addRowBtn}>+ Thêm dinh dưỡng</button>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Hình ảnh</label>
                <input type="file" style={styles.fileInput} onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                <input name="imageUrl" style={styles.input} value={form.imageUrl} onChange={handleChange} placeholder="Hoặc dán URL" />
              </div>

              <div style={styles.formActions}>
                <button type="submit" disabled={submitting} style={styles.submitBtn}>
                  {submitting ? '...' : isEditing ? 'Cập Nhật' : 'Đăng Sản Phẩm'}
                </button>
                {isEditing && <button type="button" onClick={resetForm} style={styles.cancelBtn}>Hủy</button>}
              </div>

              {error && <p style={styles.errorText}>{error}</p>}
              {message && <p style={styles.successText}>{message}</p>}
            </form>
          </aside>

          {/* CỘT PHẢI: DANH SÁCH SẢN PHẨM */}
          <section style={styles.listSection}>
            <div style={styles.listHeader}>
              <h2 style={styles.listTitle}>Sản phẩm ({filteredProducts.length})</h2>
              <div style={styles.filterGroup}>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={styles.filterSelect}>
                  {categories.map((item) => (
                    <option key={item} value={item}>{item === 'all' ? 'Tất cả danh mục' : item}</option>
                  ))}
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.filterSelect}>
                  <option value="all">Tất cả trạng thái</option>
                  <option value="ACTIVE">Còn hàng</option>
                  <option value="OUT_OF_STOCK">Hết hàng</option>
                </select>
              </div>
            </div>

            {loading ? <p>Đang tải...</p> : (
              <div style={styles.scrollList}>
                {filteredProducts.map((item) => {
                  const statusValue = getStatusValue(item);
                  return (
                    <div key={item.product_id} style={styles.productRow}>
                      <div style={styles.imgContainer}>
                        {item.image ? <img src={toAssetUrl(item.image)} alt={item.name} style={styles.thumb} /> : <div style={styles.noThumb}>No Pic</div>}
                      </div>
                      <div style={styles.info}>
                        <h4 style={styles.pName}>{item.name}</h4>
                        <p style={styles.pCategory}>{item.category || 'Bakery'}</p>
                        <p style={{ ...styles.pStatus, color: statusValue === 'ACTIVE' ? '#1f7a31' : '#9b1111' }}>
                          {statusValue === 'ACTIVE' ? 'Còn hàng' : 'Hết hàng'} • Kho: {getQuantityValue(item)}
                        </p>
                        <p style={styles.pPrice}>{Number(item.price).toLocaleString('vi-VN')} đ</p>
                      </div>
                      <div style={styles.actions}>
                        <button onClick={() => fillForEdit(item)} style={styles.editBtn}>Sửa</button>
                        {canDelete && <button onClick={() => handleDelete(item.product_id)} style={styles.delBtn}>Xóa</button>}
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
  adminPage: { backgroundColor: '#fdfdfd', minHeight: '100vh', fontFamily: "'Montserrat', sans-serif" },
  headerHero: { height: '180px', position: 'relative' },
  overlay: { 
    position: 'absolute', inset: 0, backgroundColor: '#6b1111', 
    backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://i.pinimg.com/1200x/56/6a/fc/566afc90e2b4ee052f27f40295f70e5a.jpg")', 
    backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff' 
  },
  mainTitle: { fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', color: '#fff', margin: 0 },
  kicker: { textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.75rem', marginBottom: '15px' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' },
  layout: { display: 'grid', gridTemplateColumns: '1.3fr 1.2fr', gap: '30px', alignItems: 'start' },
  formSection: { position: 'sticky', top: '20px' },
  card: { backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' },
  cardTitle: { fontFamily: "'Playfair Display', serif", color: '#6b1111', marginBottom: '20px', fontSize: '1.4rem' },
  inputGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column' },
  inputRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  label: { fontSize: '0.8rem', fontWeight: '600', marginBottom: '5px', color: '#555' },
  input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem', outline: 'none' },
  textarea: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem', resize: 'none' },
  fileInput: { marginBottom: '8px', fontSize: '0.75rem' },
  formActions: { display: 'flex', gap: '10px', marginTop: '10px' },
  submitBtn: { flex: 2, backgroundColor: '#6b1111', color: '#fff', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
  cancelBtn: { flex: 1, backgroundColor: '#eee', color: '#333', padding: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer' },

  // --- FIX RỘNG NUTRITION TẠI ĐÂY ---
  nutritionWrapper: {
    marginBottom: '20px',
    padding: '12px',
    backgroundColor: '#fcfcfc',
    borderRadius: '6px',
    border: '1px solid #f0f0f0',
    maxWidth: '600px', // Khống chế chiều ngang tối đa
    alignSelf: 'flex-start' // Đẩy về trái
  },
  nutritionHeader: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.6fr 0.6fr 0.8fr 30px',
    gap: '5px',
    padding: '0 5px 5px 5px',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    color: '#999',
    textTransform: 'uppercase'
  },
  nutritionScrollArea: {
    maxHeight: '180px',
    overflowY: 'auto',
    marginBottom: '8px'
  },
  nutritionRow: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.6fr 0.6fr 0.8fr 30px',
    gap: '5px',
    marginBottom: '6px'
  },
  nutritionInput: {
    padding: '6px 4px',
    border: '1px solid #ddd',
    borderRadius: '3px',
    fontSize: '0.75rem',
    outline: 'none',
    width: '100%'
  },
  addRowBtn: {
    padding: '6px 10px',
    backgroundColor: 'transparent',
    border: '1px dashed #6b1111',
    color: '#6b1111',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem'
  },
  delBtnSmall: {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '0.9rem',
    textAlign: 'center'
  },

  listSection: { backgroundColor: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #eee' },
  listHeader: { display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' },
  listTitle: { fontSize: '1.1rem', margin: 0, borderLeft: '4px solid #6b1111', paddingLeft: '10px' },
  filterGroup: { display: 'flex', gap: '10px' },
  filterSelect: { flex: 1, border: '1px solid #ddd', borderRadius: '4px', padding: '8px', fontSize: '0.8rem' },
  scrollList: { maxHeight: '700px', overflowY: 'auto' },
  productRow: { display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f9f9f9', gap: '12px' },
  imgContainer: { width: '80px', height: '80px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#eee' },
  thumb: { width: '100%', height: '100%', objectFit: 'cover' },
  noThumb: { fontSize: '0.5rem', color: '#999', textAlign: 'center', lineHeight: '60px' },
  info: { flex: 1 },
  pName: { margin: 0, fontSize: '0.9rem', fontWeight: 'bold' },
  pCategory: { margin: 0, fontSize: '0.65rem', color: '#b89a5b', textTransform: 'uppercase' },
  pStatus: { margin: '2px 0', fontSize: '0.7rem' },
  pPrice: { margin: 0, color: '#6b1111', fontWeight: 'bold', fontSize: '0.85rem' },
  actions: { display: 'flex', gap: '5px' },
  editBtn: { padding: '5px 10px', border: '1px solid #6b1111', color: '#6b1111', backgroundColor: '#fff', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' },
  delBtn: { padding: '5px 10px', border: '1px solid #dc3545', color: '#dc3545', backgroundColor: '#fff', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' },
  errorText: { color: 'red', fontSize: '0.75rem', marginTop: '10px' },
  successText: { color: 'green', fontSize: '0.75rem', marginTop: '10px' }
};

export default AdminProducts;