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
    } else {
      setFilteredOrders(orders.filter(o => o.status === filterStatus));
    }
  }, [filterStatus, orders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setError('');
    setSuccess('');
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setSuccess(`Cập nhật đơn hàng #${orderId} sang trạng thái ${newStatus} thành công!`);

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
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Quản Lý Đơn Hàng</h1>
            <p style={styles.subtitle}>Xem thông tin và xử lý quy trình đơn hàng bánh ngọt</p>
          </div>
        </div>

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
        </div>

        {/* MAIN LAYOUT */}
        <div style={styles.contentLayout}>
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
                      <td style={styles.td} style={{ ...styles.td, fontWeight: '600', color: '#6b1111' }}>
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
                        <div style={{ ...styles.statusBadge, ...getStatusStyle(order.status) }}>
                          {getStatusIcon(order.status)}
                          <span style={{ marginLeft: '4px' }}>{order.status}</span>
                        </div>
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
  filterSection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '25px',
  },
  filterBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #e8e0d5',
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
    gridTemplateColumns: '1fr',
    gap: '25px',
    alignItems: 'start',
    // Dynamic grid when details selected
    '@media (min-width: 900px)': {
      gridTemplateColumns: '2fr 1fr',
    },
  },
  // We handle grid layout inline/responsively
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e8e0d5',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
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
    border: '1px solid #e8e0d5',
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
    borderRadius: '12px',
    border: '1px solid #e8e0d5',
    boxShadow: '0 4px 25px rgba(0,0,0,0.06)',
    padding: '24px',
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
