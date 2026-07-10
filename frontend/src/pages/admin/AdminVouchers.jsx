import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api, { toAssetUrl } from '../../api/api';
import Navbar from '../../components/Navbar';
import { Plus, Trash2, Edit2, Ticket, Check, X, Calendar, Percent, Clock, Tag, Globe, Lock } from 'lucide-react';

const AdminVouchers = () => {
  const [activeTab, setActiveTab] = useState('vouchers'); // 'vouchers' | 'promotions'

  // Data list states
  const [vouchers, setVouchers] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Voucher Form State
  const [isVoucherEditing, setIsVoucherEditing] = useState(false);
  const [voucherEditId, setVoucherEditId] = useState(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState('');
  const [voucherExpiryDate, setVoucherExpiryDate] = useState('');
  const [voucherIsPublic, setVoucherIsPublic] = useState(false);
  const [voucherUsageLimit, setVoucherUsageLimit] = useState('');
  const [voucherMinOrderValue, setVoucherMinOrderValue] = useState('');

  // Promotion Form State
  const [isPromoEditing, setIsPromoEditing] = useState(false);
  const [promoEditId, setPromoEditId] = useState(null);
  const [promoName, setPromoName] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('');
  const [promoStartDate, setPromoStartDate] = useState('');
  const [promoEndDate, setPromoEndDate] = useState('');
  const [promoStartTime, setPromoStartTime] = useState('');
  const [promoEndTime, setPromoEndTime] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  // Product search/filter states for Happy Hour campaign selection
  const [prodSearch, setProdSearch] = useState('');
  const [prodCategory, setProdCategory] = useState('all');
  const [prodPriceRange, setProdPriceRange] = useState('all');

  // Fetch functions
  const fetchVouchers = async () => {
    try {
      const res = await api.get('/vouchers');
      setVouchers(res.data.vouchers || []);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách voucher');
    }
  };

  const fetchPromotions = async () => {
    try {
      const res = await api.get('/promotions');
      setPromotions(res.data.promotions || []);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách chương trình khuyến mại');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await Promise.all([fetchVouchers(), fetchPromotions(), fetchProducts()]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // VOUCHER FORM SUBMIT
  const handleVoucherSubmit = async (e) => {
    e.preventDefault();
    if (!voucherCode || !voucherDiscount) {
      return setError('Vui lòng nhập đầy đủ mã code và tỷ lệ giảm giá');
    }

    setError('');
    setSuccess('');

    const formattedExpiry = voucherExpiryDate ? new Date(voucherExpiryDate).toISOString().split('T')[0] : null;

    try {
      if (isVoucherEditing) {
        await api.put(`/vouchers/${voucherEditId}`, {
          code: voucherCode.trim().toUpperCase(),
          discount: Number(voucherDiscount),
          expiry_date: formattedExpiry,
          is_public: voucherIsPublic,
          usage_limit: voucherUsageLimit === '' ? null : Number(voucherUsageLimit),
          min_order_value: voucherMinOrderValue === '' ? 0 : Number(voucherMinOrderValue),
        });
        setSuccess('Cập nhật voucher thành công!');
      } else {
        await api.post('/vouchers', {
          code: voucherCode.trim().toUpperCase(),
          discount: Number(voucherDiscount),
          expiry_date: formattedExpiry,
          is_public: voucherIsPublic,
          usage_limit: voucherUsageLimit === '' ? null : Number(voucherUsageLimit),
          min_order_value: voucherMinOrderValue === '' ? 0 : Number(voucherMinOrderValue),
        });
        setSuccess('Tạo voucher mới thành công!');
      }

      resetVoucherForm();
      fetchVouchers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi lưu thông tin voucher');
    }
  };

  const handleVoucherEdit = (v) => {
    setIsVoucherEditing(true);
    setVoucherEditId(v.voucher_id);
    setVoucherCode(v.code);
    setVoucherDiscount(v.discount);
    setVoucherIsPublic(!!v.is_public);
    setVoucherUsageLimit(v.usage_limit !== null && v.usage_limit !== undefined ? v.usage_limit : '');
    setVoucherMinOrderValue(v.min_order_value !== null && v.min_order_value !== undefined ? v.min_order_value : '');
    if (v.expiry_date) {
      setVoucherExpiryDate(new Date(v.expiry_date).toISOString().split('T')[0]);
    } else {
      setVoucherExpiryDate('');
    }
  };

  const handleVoucherDelete = async (voucherId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/vouchers/${voucherId}`);
      setSuccess('Xóa voucher thành công!');
      fetchVouchers();
    } catch (err) {
      console.error(err);
      setError('Lỗi khi xóa voucher');
    }
  };

  const resetVoucherForm = () => {
    setIsVoucherEditing(false);
    setVoucherEditId(null);
    setVoucherCode('');
    setVoucherDiscount('');
    setVoucherExpiryDate('');
    setVoucherIsPublic(false);
    setVoucherUsageLimit('');
    setVoucherMinOrderValue('');
  };

  // PROMO FORM SUBMIT
  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    if (!promoName || !promoDiscount) {
      return setError('Vui lòng nhập đầy đủ tên chiến dịch và mức giảm giá');
    }

    setError('');
    setSuccess('');

    try {
      const payload = {
        name: promoName.trim(),
        discount: Number(promoDiscount),
        start_date: promoStartDate || null,
        end_date: promoEndDate || null,
        start_time: promoStartTime ? `${promoStartTime}:00` : null,
        end_time: promoEndTime ? `${promoEndTime}:00` : null,
        product_ids: selectedProductIds
      };

      if (isPromoEditing) {
        await api.put(`/promotions/${promoEditId}`, payload);
        setSuccess('Cập nhật chiến dịch khuyến mãi thành công!');
      } else {
        await api.post('/promotions', payload);
        setSuccess('Tạo chiến dịch khuyến mãi mới thành công!');
      }

      resetPromoForm();
      fetchPromotions();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi lưu thông tin chiến dịch');
    }
  };

  const handlePromoEdit = (p) => {
    setIsPromoEditing(true);
    setPromoEditId(p.promotion_id);
    setPromoName(p.name);
    setPromoDiscount(p.discount);
    setPromoStartDate(p.start_date ? new Date(p.start_date).toISOString().split('T')[0] : '');
    setPromoEndDate(p.end_date ? new Date(p.end_date).toISOString().split('T')[0] : '');
    setPromoStartTime(p.start_time ? p.start_time.slice(0, 5) : '');
    setPromoEndTime(p.end_time ? p.end_time.slice(0, 5) : '');
    setSelectedProductIds(p.product_ids || []);
  };

  const handlePromoDelete = async (promoId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chương trình Happy Hour này?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/promotions/${promoId}`);
      setSuccess('Xóa chương trình khuyến mãi thành công!');
      fetchPromotions();
    } catch (err) {
      console.error(err);
      setError('Lỗi khi xóa chương trình khuyến mãi');
    }
  };

  const resetPromoForm = () => {
    setIsPromoEditing(false);
    setPromoEditId(null);
    setPromoName('');
    setPromoDiscount('');
    setPromoStartDate('');
    setPromoEndDate('');
    setPromoStartTime('');
    setPromoEndTime('');
    setSelectedProductIds([]);
  };

  const handleProductToggle = (productId) => {
    setSelectedProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleSelectAllProducts = () => {
    const filteredIds = filteredProductsToSelect.map(p => p.product_id);
    setSelectedProductIds(prev => [...new Set([...prev, ...filteredIds])]);
  };

  const handleClearAllProducts = () => {
    const filteredIds = filteredProductsToSelect.map(p => p.product_id);
    setSelectedProductIds(prev => prev.filter(id => !filteredIds.includes(id)));
  };

  const productCategories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => { if (p.category) set.add(p.category); });
    return ['all', ...Array.from(set)];
  }, [products]);

  const filteredProductsToSelect = useMemo(() => {
    const term = prodSearch.trim().toLowerCase();
    return products.filter(p => {
      const matchesSearch = !term || p.name?.toLowerCase().includes(term);
      const matchesCategory = prodCategory === 'all' || p.category === prodCategory;
      const price = Number(p.price || 0);
      const matchesPrice = (() => {
        switch (prodPriceRange) {
          case 'under-50000': return price < 50000;
          case '50000-100000': return price >= 50000 && price <= 100000;
          case '100000-200000': return price > 100000 && price <= 200000;
          case 'over-200000': return price > 200000;
          default: return true;
        }
      })();
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, prodSearch, prodCategory, prodPriceRange]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Không giới hạn';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'Cả ngày';
    return timeStr.slice(0, 5);
  };

  const isVoucherExpired = (dateStr) => {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    expiry.setHours(23, 59, 59, 999);
    return expiry < new Date();
  };

  const productMap = useMemo(() => {
    const map = {};
    products.forEach(p => {
      map[p.product_id] = p.name;
    });
    return map;
  }, [products]);

  return (
    <div style={styles.adminPage}>
      <Navbar />

      <header style={styles.headerHero}>
        <div style={styles.overlay}>
          <p style={styles.kicker}>Marketing Campaign</p>
          <h1 style={styles.mainTitle}>CHIẾN DỊCH KHUYẾN MÃI</h1>
        </div>
      </header>

      <div style={styles.container}>

        {/* TABS SELECTOR */}
        <div style={styles.tabsContainer}>
          <button
            onClick={() => { setActiveTab('vouchers'); setError(''); setSuccess(''); }}
            style={{ ...styles.tabBtn, ...(activeTab === 'vouchers' ? styles.activeTabBtn : {}) }}
          >
            <Ticket size={18} style={{ marginRight: 8 }} />
            Mã Giảm Giá (Vouchers)
          </button>
          <button
            onClick={() => { setActiveTab('promotions'); setError(''); setSuccess(''); }}
            style={{ ...styles.tabBtn, ...(activeTab === 'promotions' ? styles.activeTabBtn : {}) }}
          >
            <Clock size={18} style={{ marginRight: 8 }} />
            Chiến dịch Happy Hour
          </button>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}
        {success && <div style={styles.successAlert}>{success}</div>}

        {loading ? (
          <div style={styles.loadingText}>Đang tải dữ liệu...</div>
        ) : activeTab === 'vouchers' ? (
          /* TAB 1: VOUCHERS */
          <div style={styles.contentLayout}>
            {/* Vouchers List */}
            <div style={styles.listCard}>
              <h3 style={styles.cardTitle}>Danh sách Voucher đang chạy</h3>
              {vouchers.length > 0 ? (
                <div style={styles.vouchersGrid}>
                  {vouchers.map(v => {
                    const expired = isVoucherExpired(v.expiry_date);
                    return (
                      <div key={v.voucher_id} style={{ ...styles.voucherItem, ...(expired ? styles.expiredItem : {}) }}>
                        <div style={styles.ticketIconContainer}>
                          <Ticket size={24} color={expired ? '#9ca3af' : '#6b1111'} />
                        </div>
                        <div style={styles.voucherDetails}>
                          <div style={styles.voucherCode}>{v.code}</div>
                          <div style={styles.voucherDiscount}>Giảm giá: {Number(v.discount)}%</div>
                          {v.min_order_value > 0 && (
                            <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
                              Đơn tối thiểu: <strong>{Number(v.min_order_value).toLocaleString()}đ</strong>
                            </div>
                          )}
                          {v.usage_limit !== null && v.usage_limit !== undefined && (
                            <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
                              Đã dùng: <strong>{v.used_count || 0}</strong> / <strong>{v.usage_limit}</strong> lượt
                            </div>
                          )}
                          <div style={styles.voucherExpiry}>
                            Hạn dùng: <span style={expired ? styles.expiredText : {}}>{formatDate(v.expiry_date)}</span>
                            {expired && <span style={styles.expiredBadge}>Hết hạn</span>}
                          </div>
                          <div style={{ marginTop: 6 }}>
                            {v.is_public ? (
                              <span style={styles.publicBadge}><Globe size={11} style={{ marginRight: 4 }} />Công khai</span>
                            ) : (
                              <span style={styles.privateBadge}><Lock size={11} style={{ marginRight: 4 }} />Riêng tư</span>
                            )}
                          </div>
                        </div>
                        <div style={styles.actions}>
                          <button onClick={() => handleVoucherEdit(v)} style={styles.editBtn} title="Sửa voucher">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleVoucherDelete(v.voucher_id)} style={styles.deleteBtn} title="Xóa voucher">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={styles.emptyList}>Chưa có mã giảm giá nào được tạo.</div>
              )}
            </div>

            {/* Voucher Form */}
            <div style={styles.formCard}>
              <h3 style={styles.cardTitle}>{isVoucherEditing ? 'Sửa Mã Giảm Giá' : 'Thêm Voucher Mới'}</h3>
              <form onSubmit={handleVoucherSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Mã giảm giá (Code)</label>
                  <div style={styles.inputWrapper}>
                    <Ticket size={16} color="#777" style={styles.inputIcon} />
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="Ví dụ: SCARLETT10"
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Mức giảm giá (%)</label>
                  <div style={styles.inputWrapper}>
                    <Percent size={16} color="#777" style={styles.inputIcon} />
                    <input
                      type="number"
                      value={voucherDiscount}
                      onChange={(e) => setVoucherDiscount(e.target.value)}
                      placeholder="Mức giảm từ 1 đến 100"
                      min="1"
                      max="100"
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Ngày hết hạn (Hạn cuối dùng)</label>
                  <div style={styles.inputWrapper}>
                    <Calendar size={16} color="#777" style={styles.inputIcon} />
                    <input
                      type="date"
                      value={voucherExpiryDate}
                      onChange={(e) => setVoucherExpiryDate(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                </div>

                {/* IS_PUBLIC TOGGLE */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Hiển thị cho khách hàng</label>
                  <label style={styles.toggleRow}>
                    <div
                      onClick={() => setVoucherIsPublic(v => !v)}
                      style={{
                        ...styles.toggleTrack,
                        backgroundColor: voucherIsPublic ? '#16a34a' : '#d1d5db',
                      }}
                    >
                      <div style={{
                        ...styles.toggleThumb,
                        transform: voucherIsPublic ? 'translateX(20px)' : 'translateX(0px)',
                      }} />
                    </div>
                    <span style={{ fontSize: '13px', color: voucherIsPublic ? '#16a34a' : '#6b7280', fontWeight: 600 }}>
                      {voucherIsPublic ? '✓ Công khai — hiển thị tại trang Checkout' : 'Riêng tư — chỉ dùng khi biết mã'}
                    </span>
                  </label>
                </div>

                <div style={styles.formActions}>
                  <button type="submit" style={styles.submitBtn}>
                    <Check size={16} style={{ marginRight: '6px' }} />
                    {isVoucherEditing ? 'Cập Nhật' : 'Lưu Lại'}
                  </button>
                  {isVoucherEditing && (
                    <button type="button" onClick={resetVoucherForm} style={styles.cancelBtn}>
                      <X size={16} style={{ marginRight: '6px' }} />
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* TAB 2: HAPPY HOUR CAMPAIGNS */
          <div style={styles.contentLayout}>
            {/* Promotions List */}
            <div style={styles.listCard}>
              <h3 style={styles.cardTitle}>Danh sách Chiến dịch Happy Hour</h3>
              {promotions.length > 0 ? (
                <div style={styles.vouchersGrid}>
                  {promotions.map(p => {
                    return (
                      <div key={p.promotion_id} style={styles.voucherItem}>
                        <div style={{ ...styles.ticketIconContainer, backgroundColor: '#fff0f0' }}>
                          <Clock size={24} color="#9b1c1c" />
                        </div>
                        <div style={styles.voucherDetails}>
                          <div style={{ ...styles.voucherCode, color: '#9b1c1c' }}>{p.name}</div>
                          <div style={styles.voucherDiscount}>Mức giảm: <strong style={{color:'#9b1c1c'}}>{Number(p.discount)}%</strong></div>
                          <div style={styles.voucherExpiry}>
                            <Calendar size={14} style={{ marginRight: 2 }} />
                            {formatDate(p.start_date)} - {formatDate(p.end_date)}
                            <span style={{ margin: '0 4px', color: '#ccc' }}>|</span>
                            <Clock size={14} style={{ marginRight: 2 }} />
                            Khung giờ: {formatTime(p.start_time)} - {formatTime(p.end_time)}
                          </div>
                          
                          {/* Display participating products */}
                          {p.product_ids && p.product_ids.length > 0 && (
                            <div style={styles.tagContainer}>
                              {p.product_ids.map(pid => (
                                <span key={pid} style={styles.productTag}>
                                  <Tag size={10} style={{ marginRight: 4 }} />
                                  {productMap[pid] || `Sản phẩm #${pid}`}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={styles.actions}>
                          <button onClick={() => handlePromoEdit(p)} style={styles.editBtn} title="Sửa chiến dịch">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handlePromoDelete(p.promotion_id)} style={styles.deleteBtn} title="Xóa chiến dịch">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={styles.emptyList}>Chưa có chiến dịch Happy Hour nào được tạo.</div>
              )}
            </div>

            {/* Promotion Form */}
            <div style={styles.formCard}>
              <h3 style={styles.cardTitle}>{isPromoEditing ? 'Sửa Chiến Dịch' : 'Tạo Chiến Dịch Happy Hour'}</h3>
              <form onSubmit={handlePromoSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Tên chiến dịch</label>
                  <input
                    type="text"
                    value={promoName}
                    onChange={(e) => setPromoName(e.target.value)}
                    placeholder="Ví dụ: Giảm giá buổi tối 30%"
                    style={{ ...styles.input, paddingLeft: '12px' }}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Mức giảm giá (%)</label>
                  <div style={styles.inputWrapper}>
                    <Percent size={16} color="#777" style={styles.inputIcon} />
                    <input
                      type="number"
                      value={promoDiscount}
                      onChange={(e) => setPromoDiscount(e.target.value)}
                      placeholder="Mức giảm từ 1 đến 100"
                      min="1"
                      max="100"
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.inputRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Từ ngày</label>
                    <input
                      type="date"
                      value={promoStartDate}
                      onChange={(e) => setPromoStartDate(e.target.value)}
                      style={{ ...styles.input, paddingLeft: '12px' }}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Đến ngày</label>
                    <input
                      type="date"
                      value={promoEndDate}
                      onChange={(e) => setPromoEndDate(e.target.value)}
                      style={{ ...styles.input, paddingLeft: '12px' }}
                    />
                  </div>
                </div>

                <div style={styles.inputRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Giờ bắt đầu</label>
                    <input
                      type="time"
                      value={promoStartTime}
                      onChange={(e) => setPromoStartTime(e.target.value)}
                      style={{ ...styles.input, paddingLeft: '12px' }}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Giờ kết thúc</label>
                    <input
                      type="time"
                      value={promoEndTime}
                      onChange={(e) => setPromoEndTime(e.target.value)}
                      style={{ ...styles.input, paddingLeft: '12px' }}
                    />
                  </div>
                </div>

                {/* PRODUCT SELECTION GRID */}
                <div style={styles.inputGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={styles.label}>Sản phẩm áp dụng ({selectedProductIds.length})</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" onClick={handleSelectAllProducts} style={styles.miniLinkBtn}>Chọn tất</button>
                      <button type="button" onClick={handleClearAllProducts} style={styles.miniLinkBtn}>Bỏ chọn</button>
                    </div>
                  </div>

                  {/* SEARCH AND FILTERS */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      placeholder="Tìm tên bánh..."
                      value={prodSearch}
                      onChange={(e) => setProdSearch(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      style={{
                        padding: '8px 8px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        outline: 'none',
                        cursor: 'pointer',
                        maxWidth: '120px',
                      }}
                    >
                      <option value="all">Tất cả loại</option>
                      {productCategories.filter(cat => cat !== 'all').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <select
                      value={prodPriceRange}
                      onChange={(e) => setProdPriceRange(e.target.value)}
                      style={{
                        padding: '8px 8px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        outline: 'none',
                        cursor: 'pointer',
                        maxWidth: '120px',
                      }}
                    >
                      <option value="all">Tất cả giá</option>
                      <option value="under-50000">Dưới 50k</option>
                      <option value="50000-100000">50k - 100k</option>
                      <option value="100000-200000">100k - 200k</option>
                      <option value="over-200000">Trên 200k</option>
                    </select>
                  </div>

                  <div style={styles.productSelectScrollBox}>
                    {filteredProductsToSelect.map(p => (
                      <label key={p.product_id} style={{
                        ...styles.productSelectRow,
                        backgroundColor: selectedProductIds.includes(p.product_id) ? '#fff5f5' : '#fff',
                        borderColor: selectedProductIds.includes(p.product_id) ? '#ffcccc' : '#eee'
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(p.product_id)}
                          onChange={() => handleProductToggle(p.product_id)}
                          style={{ marginRight: 10, accentColor: '#9b1c1c' }}
                        />
                        {p.image && <img src={toAssetUrl(p.image)} alt={p.name} style={styles.miniProductThumb} />}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>{Number(p.price).toLocaleString('vi-VN')} đ • {p.category}</div>
                        </div>
                      </label>
                    ))}
                    {filteredProductsToSelect.length === 0 && (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>
                        Không tìm thấy sản phẩm nào
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.formActions}>
                  <button type="submit" style={{ ...styles.submitBtn, backgroundColor: '#9b1c1c' }}>
                    <Check size={16} style={{ marginRight: '6px' }} />
                    {isPromoEditing ? 'Cập Nhật' : 'Kích Hoạt'}
                  </button>
                  {isPromoEditing && (
                    <button type="button" onClick={resetPromoForm} style={styles.cancelBtn}>
                      <X size={16} style={{ marginRight: '6px' }} />
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  adminPage: {
    backgroundColor: '#fdfdfd',
    minHeight: '100vh',
    paddingBottom: '60px',
    fontFamily: "'Montserrat', sans-serif"
  },
  headerHero: { height: '180px', position: 'relative' },
  overlay: {
    position: 'absolute', inset: 0, backgroundColor: '#6b1111',
    backgroundImage: 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url("https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1200")',
    backgroundSize: 'cover', backgroundPosition: 'center',
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff',
  },
  mainTitle: { fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', color: '#fff', margin: 0 },
  kicker: { textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.75rem', marginBottom: '15px' },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
  },
  header: {
    marginBottom: '25px',
    borderBottom: '1px solid #e8e0d5',
    paddingBottom: '15px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#6b1111',
    fontFamily: "'Playfair Display', serif",
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginTop: '5px',
    marginRight: 0,
  },
  tabsContainer: {
    display: 'flex',
    borderBottom: '2px solid #eee',
    marginBottom: '25px',
    gap: '15px'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    border: 'none',
    background: 'none',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.3s',
  },
  activeTabBtn: {
    color: '#6b1111',
    fontWeight: '700',
    borderBottom: '3px solid #6b1111',
    marginBottom: '-2px'
  },
  errorAlert: {
    backgroundColor: '#fdf2f2',
    color: '#9b1c1c',
    padding: '12px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
    border: '1px solid #fde8e8',
  },
  successAlert: {
    backgroundColor: '#f0fdf4',
    color: '#166534',
    padding: '12px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
    border: '1px solid #dcfce7',
  },
  contentLayout: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1.1fr',
    gap: '30px',
    alignItems: 'start'
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #eee',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    padding: '24px',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #eee',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    padding: '24px',
    height: 'fit-content',
    position: 'sticky',
    top: '100px',
  },
  cardTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#333',
    fontFamily: "'Playfair Display', serif",
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '12px',
  },
  loadingText: {
    padding: '80px',
    textAlign: 'center',
    color: '#888',
    fontSize: '16px',
    fontWeight: '500'
  },
  emptyList: {
    padding: '40px',
    textAlign: 'center',
    color: '#888',
  },
  vouchersGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  voucherItem: {
    display: 'flex',
    alignItems: 'flex-start',
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: '#fdfbf7',
    position: 'relative',
  },
  expiredItem: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    opacity: 0.75,
  },
  ticketIconContainer: {
    marginRight: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: '#f5eded',
    flexShrink: 0
  },
  voucherDetails: {
    flex: 1,
  },
  voucherCode: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#6b1111',
    letterSpacing: '0.5px',
  },
  voucherDiscount: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    marginTop: '3px',
  },
  voucherExpiry: {
    fontSize: '12px',
    color: '#666',
    marginTop: '5px',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px',
  },
  expiredText: {
    color: '#b91c1c',
    fontWeight: '500',
  },
  expiredBadge: {
    backgroundColor: '#fee2e2',
    color: '#9b1c1c',
    padding: '1px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  editBtn: {
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#4b5563',
    padding: '6px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  deleteBtn: {
    border: '1px solid #fee2e2',
    background: '#fff',
    color: '#b91c1c',
    padding: '6px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  inputRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
  },
  input: {
    width: '100%',
    padding: '10px 12px 10px 36px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
    outline: 'none',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  submitBtn: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6b1111',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    padding: '10px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  tagContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '10px'
  },
  productTag: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#faf5f5',
    color: '#9b1c1c',
    border: '1px solid #ffeded',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500'
  },
  miniLinkBtn: {
    background: 'none',
    border: 'none',
    color: '#9b1c1c',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline'
  },
  productSelectScrollBox: {
    maxHeight: '200px',
    overflowY: 'auto',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  productSelectRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    border: '1px solid #eee',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  miniProductThumb: {
    width: '32px',
    height: '32px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginRight: '10px',
    backgroundColor: '#eee'
  },
  publicBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    border: '1px solid #bbf7d0',
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
  },
  privateBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    color: '#6b7280',
    border: '1px solid #e5e7eb',
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  toggleTrack: {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    position: 'relative',
    cursor: 'pointer',
    transition: 'background-color 0.25s ease',
    flexShrink: 0,
  },
  toggleThumb: {
    position: 'absolute',
    top: '3px',
    left: '3px',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
    transition: 'transform 0.25s ease',
  },
};

export default AdminVouchers;
