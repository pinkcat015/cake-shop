import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import Navbar from '../../components/Navbar';
import { Eye, Clock, Truck, CheckCircle, XCircle, ShoppingBag, MapPin, Store } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isWide, setIsWide] = useState(window.innerWidth >= 900); // FE1: for responsive 2-col layout

  useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth >= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      const list = res.data.orders || [];
      setOrders(list);
      setFilteredOrders(list);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (filterStatus === 'ALL') {
      setFilteredOrders(orders);
    } else if (filterStatus === 'CANCEL_PENDING') {
      // FE3: Special filter for cancel-pending orders
      setFilteredOrders(orders.filter(o => o.cancel_requested === 1 && o.status === 'CONFIRMED'));
    } else {
      setFilteredOrders(orders.filter(o => o.status === filterStatus));
    }
  }, [filterStatus, orders]);

  const handleStatusChange = async (orderId, newStatus) => {
    // FE4: Add confirmation for irreversible transitions
    const irreversible = ['CANCELLED', 'DELIVERED'];
    if (irreversible.includes(newStatus)) {
      if (!window.confirm(`Bạn có chắc chắn muốn đổi trạng thái thành "${newStatus}" không? Hành động này khó hoàn tác.`)) return;
    }
    setUpdatingId(orderId);
    setError('');
    setSuccess('');
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      const msg = `Cập nhật đơn hàng #${orderId} sang trạng thái ${newStatus} thành công!`;
      setSuccess(msg);
      // Auto-clear success message after 4 seconds
      setTimeout(() => setSuccess(prev => prev === msg ? '' : prev), 4000);

      // Update local state
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));

      if (selectedOrder && selectedOrder.order_id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApproveCancel = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn đồng ý hủy đơn hàng này không?')) return;
    setUpdatingId(orderId);
    setError('');
    setSuccess('');
    try {
      await api.put(`/orders/${orderId}/approve-cancel`);
      setSuccess(`Đồng ý hủy đơn hàng #${orderId} thành công!`);
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: 'CANCELLED', cancel_requested: 0 } : o));
      if (selectedOrder && selectedOrder.order_id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: 'CANCELLED', cancel_requested: 0 }));
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Không thể đồng ý hủy đơn');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRejectCancel = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn từ chối yêu cầu hủy đơn hàng này không?')) return;
    setUpdatingId(orderId);
    setError('');
    setSuccess('');
    try {
      await api.put(`/orders/${orderId}/reject-cancel`);
      setSuccess(`Từ chối yêu cầu hủy đơn hàng #${orderId}. Đơn giữ nguyên trạng thái.`);
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, cancel_requested: 0 } : o));
      if (selectedOrder && selectedOrder.order_id === orderId) {
        setSelectedOrder(prev => ({ ...prev, cancel_requested: 0 }));
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Không thể từ chối hủy đơn');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock size={16} color="#b45309" />;
      case 'CONFIRMED': return <ShoppingBag size={16} color="#1d4ed8" />;
      case 'SHIPPING': return <Truck size={16} color="#0891b2" />;
      case 'DELIVERED': return <CheckCircle size={16} color="#166534" />;
      case 'CANCELLED': return <XCircle size={16} color="#9b1c1c" />;
      default: return null;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return { backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde8c3' };
      case 'CONFIRMED': return { backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe' };
      case 'SHIPPING': return { backgroundColor: '#ecfeff', color: '#0891b2', border: '1px solid #cffafe' };
      case 'DELIVERED': return { backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #dcfce7' };
      case 'CANCELLED': return { backgroundColor: '#fdf2f2', color: '#9b1c1c', border: '1px solid #fde8e8' };
      default: return {};
    }
  };

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div style={styles.adminPage}>
      <Navbar />

      <header style={styles.headerHero}>
        <div style={styles.overlay}>
          <p style={styles.kicker}>Operations Console</p>
          <h1 style={styles.mainTitle}>QUẢN LÝ ĐƠN HÀNG</h1>
        </div>
      </header>

      <div style={styles.container}>

        {error && <div style={styles.errorAlert}>{error}</div>}
        {success && <div style={styles.successAlert}>{success}</div>}

        {/* FILTERS */}
        <div style={styles.filterSection}>
          <button
            onClick={() => setFilterStatus('ALL')}
            style={{ ...styles.filterBtn, ...(filterStatus === 'ALL' ? styles.activeFilter : {}) }}
          >
            Tất Cả ({orders.length})
          </button>
          <button
            onClick={() => setFilterStatus('PENDING')}
            style={{ ...styles.filterBtn, ...(filterStatus === 'PENDING' ? styles.activeFilter : {}) }}
          >
            Chờ Xử Lý ({orders.filter(o => o.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilterStatus('CONFIRMED')}
            style={{ ...styles.filterBtn, ...(filterStatus === 'CONFIRMED' ? styles.activeFilter : {}) }}
          >
            Đã Xác Nhận ({orders.filter(o => o.status === 'CONFIRMED').length})
          </button>
          <button
            onClick={() => setFilterStatus('SHIPPING')}
            style={{ ...styles.filterBtn, ...(filterStatus === 'SHIPPING' ? styles.activeFilter : {}) }}
          >
            Đang Giao ({orders.filter(o => o.status === 'SHIPPING').length})
          </button>
          <button
            onClick={() => setFilterStatus('DELIVERED')}
            style={{ ...styles.filterBtn, ...(filterStatus === 'DELIVERED' ? styles.activeFilter : {}) }}
          >
            Đã Giao ({orders.filter(o => o.status === 'DELIVERED').length})
          </button>
          <button
            onClick={() => setFilterStatus('CANCELLED')}
            style={{ ...styles.filterBtn, ...(filterStatus === 'CANCELLED' ? styles.activeFilter : {}) }}
          >
            Đã Hủy ({orders.filter(o => o.status === 'CANCELLED').length})
          </button>
          {/* FE3: Add dedicated filter for cancel-pending orders */}
          <button
            onClick={() => setFilterStatus('CANCEL_PENDING')}
            style={{ 
              ...styles.filterBtn, 
              ...(filterStatus === 'CANCEL_PENDING' ? styles.activeFilter : {}),
              borderColor: '#b45309',
              color: filterStatus === 'CANCEL_PENDING' ? '#fff' : '#b45309',
            }}
          >
            Cần Duyệt Hủy ({orders.filter(o => o.cancel_requested === 1 && o.status === 'CONFIRMED').length})
          </button>
        </div>

        {/* MAIN LAYOUT - FE1: Use isWide state for responsive 2-col grid instead of @media in inline style */}
        <div style={{ ...styles.contentLayout, gridTemplateColumns: isWide && selectedOrder ? '2fr 1fr' : '1fr' }}>
          {/* ORDERS TABLE */}
          <div style={styles.tableCard}>
            {loading ? (
              <div style={styles.tableLoading}>Đang tải đơn hàng...</div>
            ) : filteredOrders.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Mã Đơn</th>
                    <th style={styles.th}>Khách Hàng</th>
                    <th style={styles.th}>Ngày Đặt</th>
                    <th style={styles.th}>Tổng Tiền</th>
                    <th style={styles.th}>Hình Thức</th>
                    <th style={styles.th}>Trạng Thái</th>
                    <th style={styles.th}>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr
                      key={order.order_id}
                      style={{
                        ...styles.tr,
                        ...(selectedOrder?.order_id === order.order_id ? styles.selectedTr : {})
                      }}
                    >
                      <td style={styles.td}>#{order.order_id}</td>
                      <td style={styles.td}>
                        <div style={styles.custName}>{order.customer_name}</div>
                        <div style={styles.custPhone}>{order.customer_phone}</div>
                      </td>
                      <td style={styles.td}>
                        {new Date(order.order_date).toLocaleDateString('vi-VN')} {new Date(order.order_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ ...styles.td, fontWeight: '600', color: '#6b1111' }}>
                        {formatVND(order.total_price)}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.deliveryBadge}>
                          {order.delivery_method === 'pickup' ? (
                            <><Store size={12} style={{ marginRight: '4px' }} /> Pickup</>
                          ) : (
                            <><MapPin size={12} style={{ marginRight: '4px' }} /> Delivery</>
                          )}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {order.cancel_requested === 1 && order.status === 'CONFIRMED' ? (
                          <div style={{ ...styles.statusBadge, backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde8c3', display: 'flex', alignItems: 'center' }}>
                            <Clock size={14} color="#b45309" />
                            <span style={{ marginLeft: '4px', fontWeight: '700' }}>CẦN DUYỆT HỦY</span>
                          </div>
                        ) : (
                          <div style={{ ...styles.statusBadge, ...getStatusStyle(order.status) }}>
                            {getStatusIcon(order.status)}
                            <span style={{ marginLeft: '4px' }}>{order.status}</span>
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          style={styles.actionBtn}
                          title="Xem chi tiết đơn hàng"
                        >
                          <Eye size={16} />
                          <span>Chi Tiết</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={styles.emptyTable}>Không tìm thấy đơn hàng nào tương ứng.</div>
            )}
          </div>

          {/* SIDEBAR DETAILS */}
          {selectedOrder && (
            <div style={styles.detailsCard}>
              <div style={styles.detailsHeader}>
                <h3 style={styles.detailsTitle}>Đơn Hàng #{selectedOrder.order_id}</h3>
                <button onClick={() => setSelectedOrder(null)} style={styles.closeBtn}>×</button>
              </div>

              <div style={styles.detailsBody}>
                {/* Cancel Request Action */}
                {selectedOrder.cancel_requested === 1 && (
                  <div style={styles.cancelRequestBlock}>
                    <div style={styles.cancelRequestAlert}>
                      ⚠️ <strong>Khách hàng yêu cầu hủy đơn này.</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button
                        onClick={() => handleApproveCancel(selectedOrder.order_id)}
                        disabled={updatingId === selectedOrder.order_id}
                        style={styles.btnApproveCancel}
                      >
                        Đồng ý hủy đơn
                      </button>
                      <button
                        onClick={() => handleRejectCancel(selectedOrder.order_id)}
                        disabled={updatingId === selectedOrder.order_id}
                        style={styles.btnRejectCancel}
                      >
                        Từ chối hủy
                      </button>
                    </div>
                  </div>
                )}

                {/* Status Update */}
                <div style={styles.detailBlock}>
                  <label style={styles.detailLabel}>Cập nhật trạng thái</label>
                  <div style={styles.statusUpdateRow}>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.order_id, e.target.value)}
                      disabled={updatingId === selectedOrder.order_id}
                      style={styles.statusSelect}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="SHIPPING">SHIPPING</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                    {updatingId === selectedOrder.order_id && <span style={styles.savingText}>Đang lưu...</span>}
                  </div>
                </div>

                {/* Customer Info */}
                <div style={styles.detailBlock}>
                  <h4 style={styles.detailSectionTitle}>Thông tin giao hàng</h4>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Khách hàng:</span>
                    <span style={styles.infoVal}>{selectedOrder.customer_name}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Số điện thoại:</span>
                    <span style={styles.infoVal}>{selectedOrder.customer_phone}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Phương thức:</span>
                    <span style={styles.infoVal} style={{ textTransform: 'capitalize', fontWeight: '600' }}>
                      {selectedOrder.delivery_method === 'pickup' ? 'Nhận tại cửa hàng' : 'Giao hàng tận nơi'}
                    </span>
                  </div>
                  {selectedOrder.delivery_method === 'pickup' ? (
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Cửa hàng:</span>
                      <span style={styles.infoVal}>{selectedOrder.store_name || 'Scarlett Bakery'} ({selectedOrder.store_address})</span>
                    </div>
                  ) : (
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Địa chỉ giao:</span>
                      <span style={styles.infoVal}>{selectedOrder.address || 'Chưa cung cấp'}</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div style={styles.detailBlock}>
                  <h4 style={styles.detailSectionTitle}>Chi tiết món bánh</h4>
                  <div style={styles.itemsList}>
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} style={styles.detailItem}>
                        <img
                          src={item.image || 'https://via.placeholder.com/150'}
                          alt={item.name}
                          style={styles.itemThumb}
                        />
                        <div style={styles.itemInfo}>
                          <div style={styles.itemName}>{item.name}</div>
                          <div style={styles.itemQty}>
                            {item.quantity} x {formatVND(item.price)}
                          </div>
                        </div>
                        <div style={styles.itemTotal}>
                          {formatVND(item.quantity * item.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing summary */}
                <div style={styles.pricingSummary}>
                  <div style={styles.priceRow}>
                    <span>Thành tiền:</span>
                    <span style={styles.finalPrice}>{formatVND(selectedOrder.total_price)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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
    backgroundImage: 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url("https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200")',
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
  filterSection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '25px',
  },
  filterBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #eee',
    backgroundColor: '#fff',
    color: '#555',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  activeFilter: {
    backgroundColor: '#6b1111',
    color: '#fff',
    borderColor: '#6b1111',
  },
  contentLayout: {
    display: 'grid',
    // FE1: @media queries not supported in inline styles — use isWide state instead (handled in JSX)
    gridTemplateColumns: '1fr',
    gap: '25px',
    alignItems: 'start',
  },
  // We handle grid layout inline/responsively
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #eee',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    overflowX: 'auto',
  },
  tableLoading: {
    padding: '40px',
    textAlign: 'center',
    color: '#888',
  },
  emptyTable: {
    padding: '40px',
    textAlign: 'center',
    color: '#888',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    borderBottom: '2px solid #f3f4f6',
    backgroundColor: '#faf9f6',
  },
  th: {
    padding: '15px 20px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s',
  },
  selectedTr: {
    backgroundColor: '#fdfbf7',
  },
  td: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#333',
    verticalAlign: 'middle',
  },
  custName: {
    fontWeight: '600',
    color: '#111',
  },
  custPhone: {
    fontSize: '12px',
    color: '#666',
    marginTop: '3px',
  },
  deliveryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '12px',
    color: '#555',
    fontWeight: '500',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '4px',
    border: '1px solid #eee',
    backgroundColor: '#fff',
    color: '#6b1111',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f7f5f2',
    },
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #eee',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: '100px',
  },
  detailsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '15px',
    marginBottom: '20px',
  },
  detailsTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#6b1111',
    fontFamily: 'serif',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#9ca3af',
    cursor: 'pointer',
    lineHeight: '1',
  },
  cancelRequestBlock: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fde8c3',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '20px',
    textAlign: 'left'
  },
  cancelRequestAlert: {
    color: '#b45309',
    fontSize: '13px',
    lineHeight: '1.5',
  },
  btnApproveCancel: {
    flex: 1,
    padding: '10px 14px',
    backgroundColor: '#9b1c1c',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnRejectCancel: {
    flex: 1,
    padding: '10px 14px',
    backgroundColor: '#fff',
    color: '#555',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  detailBlock: {
    marginBottom: '20px',
    borderBottom: '1px solid #f9fafb',
    paddingBottom: '15px',
  },
  detailLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: '8px',
  },
  statusUpdateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  statusSelect: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    outline: 'none',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  savingText: {
    fontSize: '12px',
    color: '#666',
  },
  detailSectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '700',
    color: '#111',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    marginBottom: '8px',
  },
  infoLabel: {
    color: '#777',
  },
  infoVal: {
    color: '#111',
    fontWeight: '500',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  itemThumb: {
    width: '40px',
    height: '40px',
    borderRadius: '6px',
    objectFit: 'cover',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
  },
  itemQty: {
    fontSize: '12px',
    color: '#777',
    marginTop: '2px',
  },
  itemTotal: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#111',
  },
  pricingSummary: {
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid #f3f4f6',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '700',
    fontSize: '15px',
    color: '#333',
  },
  finalPrice: {
    color: '#6b1111',
    fontSize: '18px',
  },
};

export default AdminOrders;
