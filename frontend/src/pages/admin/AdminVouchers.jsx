import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import Navbar from '../../components/Navbar';
import { Plus, Trash2, Edit2, Ticket, Check, X, Calendar, Percent } from 'lucide-react';

const AdminVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vouchers');
      setVouchers(res.data.vouchers || []);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !discount) {
      return setError('Vui lòng nhập đầy đủ mã code và tỷ lệ giảm giá');
    }

    setError('');
    setSuccess('');

    // Format expiry date to YYYY-MM-DD
    const formattedExpiry = expiryDate ? new Date(expiryDate).toISOString().split('T')[0] : null;

    try {
      if (isEditing) {
        await api.put(`/vouchers/${editId}`, {
          code: code.trim().toUpperCase(),
          discount: Number(discount),
          expiry_date: formattedExpiry
        });
        setSuccess('Cập nhật voucher thành công!');
      } else {
        await api.post('/vouchers', {
          code: code.trim().toUpperCase(),
          discount: Number(discount),
          expiry_date: formattedExpiry
        });
        setSuccess('Tạo voucher mới thành công!');
      }

      // Reset Form
      resetForm();
      // Reload Data
      fetchVouchers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi lưu thông tin voucher');
    }
  };

  const handleEdit = (voucher) => {
    setIsEditing(true);
    setEditId(voucher.voucher_id);
    setCode(voucher.code);
    setDiscount(voucher.discount);
    // Format date for input type="date"
    if (voucher.expiry_date) {
      setExpiryDate(new Date(voucher.expiry_date).toISOString().split('T')[0]);
    } else {
      setExpiryDate('');
    }
  };

  const handleDelete = async (voucherId) => {
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

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setCode('');
    setDiscount('');
    setExpiryDate('');
  };

  // Helper formatting
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Không giới hạn';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const isExpired = (dateStr) => {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    expiry.setHours(23, 59, 59, 999);
    return expiry < new Date();
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Quản Lý Mã Giảm Giá (Vouchers)</h1>
            <p style={styles.subtitle}>Tạo mới, sửa đổi và xóa các chương trình ưu đãi của Scarlett</p>
          </div>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}
        {success && <div style={styles.successAlert}>{success}</div>}

        <div style={styles.contentLayout}>
          {/* VOUCHERS LIST */}
          <div style={styles.listCard}>
            <h3 style={styles.cardTitle}>Danh sách Voucher đang chạy</h3>
            {loading ? (
              <div style={styles.loadingText}>Đang tải danh sách...</div>
            ) : vouchers.length > 0 ? (
              <div style={styles.vouchersGrid}>
                {vouchers.map(v => {
                  const expired = isExpired(v.expiry_date);
                  return (
                    <div key={v.voucher_id} style={{ ...styles.voucherItem, ...(expired ? styles.expiredItem : {}) }}>
                      <div style={styles.ticketIconContainer}>
                        <Ticket size={24} color={expired ? '#9ca3af' : '#6b1111'} />
                      </div>
                      <div style={styles.voucherDetails}>
                        <div style={styles.voucherCode}>{v.code}</div>
                        <div style={styles.voucherDiscount}>Giảm giá: {Number(v.discount)}%</div>
                        <div style={styles.voucherExpiry}>
                          Hạn dùng: <span style={expired ? styles.expiredText : {}}>{formatDate(v.expiry_date)}</span>
                          {expired && <span style={styles.expiredBadge}>Hết hạn</span>}
                        </div>
                      </div>
                      <div style={styles.actions}>
                        <button onClick={() => handleEdit(v)} style={styles.editBtn} title="Sửa voucher">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(v.voucher_id)} style={styles.deleteBtn} title="Xóa voucher">
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

          {/* ADD / EDIT FORM */}
          <div style={styles.formCard}>
            <h3 style={styles.cardTitle}>{isEditing ? 'Sửa Mã Giảm Giá' : 'Thêm Voucher Mới'}</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Mã giảm giá (Code)</label>
                <div style={styles.inputWrapper}>
                  <Ticket size={16} color="#777" style={styles.inputIcon} />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
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
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
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
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                <button type="submit" style={styles.submitBtn}>
                  <Check size={16} style={{ marginRight: '6px' }} />
                  {isEditing ? 'Cập Nhật' : 'Lưu Lại'}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} style={styles.cancelBtn}>
                    <X size={16} style={{ marginRight: '6px' }} />
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: '#f7f5f2',
    minHeight: '100vh',
    paddingBottom: '60px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 24px',
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
    fontFamily: 'serif',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginTop: '5px',
    marginBottom: 0,
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
    gridTemplateColumns: '2fr 1fr',
    gap: '30px',
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e8e0d5',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    padding: '24px',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e8e0d5',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
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
    fontFamily: 'serif',
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '12px',
  },
  loadingText: {
    padding: '40px',
    textAlign: 'center',
    color: '#888',
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
    alignItems: 'center',
    border: '1px solid #e8e0d5',
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
    marginTop: '3px',
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
};

export default AdminVouchers;
