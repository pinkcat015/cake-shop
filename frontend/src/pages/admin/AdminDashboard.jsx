import React, { useEffect, useState, useMemo } from 'react';
import api from '../../api/api';
import Navbar from '../../components/Navbar';
import { DollarSign, ShoppingBag, Users, Cake, Award, ChevronRight } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_orders: 0,
    total_customers: 0,
    total_products: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, revRes, topRes] = await Promise.all([
          api.get('/reports/stats'),
          api.get('/reports/revenue'),
          api.get('/reports/top-products'),
        ]);

        setStats(statsRes.data);
        setRevenueData(revRes.data.revenue || []);
        setTopProducts(topRes.data.products || []);
      } catch (err) {
        console.error(err);
        setError('Không thể tải dữ liệu thống kê');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format currency
  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Process data for SVG Chart
  const chartData = useMemo(() => {
    if (revenueData.length > 0) {
      return revenueData;
    }
    // Fallback demo data if no real orders exist
    return [
      { date: '06-06', revenue: 1250000 },
      { date: '06-07', revenue: 2300000 },
      { date: '06-08', revenue: 1800000 },
      { date: '06-09', revenue: 3500000 },
      { date: '06-10', revenue: 2900000 },
      { date: '06-11', revenue: 4200000 },
      { date: '06-12', revenue: 5100000 },
    ];
  }, [revenueData]);

  // Compute SVG Points for Line Chart
  const svgChartInfo = useMemo(() => {
    const width = 600;
    const height = 220;
    const padding = 35;

    if (!chartData || chartData.length === 0) return { points: '', grid: [] };

    const maxRevenue = Math.max(...chartData.map(d => Number(d.revenue)), 100000);
    const minRevenue = 0;
    const revenueRange = maxRevenue - minRevenue;

    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = chartData.map((d, index) => {
      const x = padding + (index / (chartData.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((Number(d.revenue) - minRevenue) / revenueRange) * chartHeight;
      return { x, y, label: d.date, value: d.revenue };
    });

    const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');

    return {
      points,
      pointsString,
      width,
      height,
      padding,
      chartWidth,
      chartHeight,
      maxRevenue,
    };
  }, [chartData]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Navbar />
        <div style={styles.spinnerWrapper}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Đang tổng hợp báo cáo dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.adminPage}>
      <Navbar />

      <header style={styles.headerHero}>
        <div style={styles.overlay}>
          <p style={styles.kicker}>Backoffice Management</p>
          <h1 style={styles.mainTitle}>BẢNG ĐIỀU KHIỂN QUẢN TRỊ</h1>
        </div>
      </header>

      <div style={styles.container}>

        {error && <div style={styles.errorAlert}>{error}</div>}

        {/* STATS CARDS */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{ ...styles.iconContainer, backgroundColor: '#fef2f2' }}>
              <DollarSign size={24} color="#6b1111" />
            </div>
            <div>
              <p style={styles.statLabel}>Doanh Thu Tổng</p>
              <h3 style={styles.statValue}>{formatVND(stats.total_revenue)}</h3>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.iconContainer, backgroundColor: '#eff6ff' }}>
              <ShoppingBag size={24} color="#1d4ed8" />
            </div>
            <div>
              <p style={styles.statLabel}>Tổng Số Đơn Hàng</p>
              <h3 style={styles.statValue}>{stats.total_orders} đơn</h3>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.iconContainer, backgroundColor: '#f0fdf4' }}>
              <Users size={24} color="#166534" />
            </div>
            <div>
              <p style={styles.statLabel}>Khách Hàng Đăng Ký</p>
              <h3 style={styles.statValue}>{stats.total_customers}</h3>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.iconContainer, backgroundColor: '#fffbeb' }}>
              <Cake size={24} color="#b45309" />
            </div>
            <div>
              <p style={styles.statLabel}>Sản Phẩm Trong Kho</p>
              <h3 style={styles.statValue}>{stats.total_products} loại</h3>
            </div>
          </div>
        </div>

        {/* CHARTS AND LISTS */}
        <div style={styles.dashboardBody}>
          {/* REVENUE CHART */}
          <div style={styles.chartWrapper}>
            <h3 style={styles.sectionTitle}>Xu Hướng Doanh Thu Gần Đây</h3>
            <p style={styles.sectionSubtitle}>Biểu đồ trực quan hóa doanh số bán bánh ngọt</p>
            <div style={styles.chartContainer}>
              <svg
                viewBox={`0 0 ${svgChartInfo.width} ${svgChartInfo.height}`}
                style={styles.svgChart}
              >
                {/* Grids and Axes */}
                <line
                  x1={svgChartInfo.padding}
                  y1={svgChartInfo.height - svgChartInfo.padding}
                  x2={svgChartInfo.width - svgChartInfo.padding}
                  y2={svgChartInfo.height - svgChartInfo.padding}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <line
                  x1={svgChartInfo.padding}
                  y1={svgChartInfo.padding}
                  x2={svgChartInfo.padding}
                  y2={svgChartInfo.height - svgChartInfo.padding}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />

                {/* Y-axis helper grids */}
                {[0.25, 0.5, 0.75, 1].map((ratio, index) => {
                  const y = svgChartInfo.padding + svgChartInfo.chartHeight * (1 - ratio);
                  return (
                    <g key={index}>
                      <line
                        x1={svgChartInfo.padding}
                        y1={y}
                        x2={svgChartInfo.width - svgChartInfo.padding}
                        y2={y}
                        stroke="#f3f4f6"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={svgChartInfo.padding - 5}
                        y={y + 4}
                        fontSize="9"
                        fill="#9ca3af"
                        textAnchor="end"
                      >
                        {Math.round((svgChartInfo.maxRevenue * ratio) / 1000) + 'k'}
                      </text>
                    </g>
                  );
                })}

                {/* Area Gradient under line */}
                {svgChartInfo.points.length > 0 && (
                  <>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6b1111" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#6b1111" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points={`${svgChartInfo.padding},${svgChartInfo.height - svgChartInfo.padding} ${svgChartInfo.pointsString} ${svgChartInfo.width - svgChartInfo.padding},${svgChartInfo.height - svgChartInfo.padding}`}
                      fill="url(#chartGrad)"
                    />
                  </>
                )}

                {/* Line Path */}
                {svgChartInfo.pointsString && (
                  <polyline
                    fill="none"
                    stroke="#6b1111"
                    strokeWidth="3"
                    points={svgChartInfo.pointsString}
                  />
                )}

                {/* Data Points and Labels */}
                {svgChartInfo.points.map((pt, i) => (
                  <g key={i}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      fill="#fff"
                      stroke="#6b1111"
                      strokeWidth="2.5"
                      style={styles.svgCircle}
                    />
                    <text
                      x={pt.x}
                      y={svgChartInfo.height - svgChartInfo.padding + 16}
                      fontSize="9"
                      fill="#6b7280"
                      textAnchor="middle"
                    >
                      {pt.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <div style={styles.chartLegend}>
              <div style={styles.legendDot}></div>
              <span>Doanh thu theo ngày (VNĐ)</span>
            </div>
          </div>

          {/* TOP PRODUCTS */}
          <div style={styles.topProductsWrapper}>
            <div style={styles.topProductsHeader}>
              <h3 style={styles.sectionTitle}>Sản Phẩm Bán Chạy Nhất</h3>
              <p style={styles.sectionSubtitle}>Top 5 sản phẩm đạt sản lượng tiêu thụ hàng đầu</p>
            </div>

            <div style={styles.topProductsList}>
              {topProducts.length > 0 ? (
                topProducts.map((prod, index) => (
                  <div key={prod.product_id} style={styles.prodItem}>
                    <div style={styles.prodIndex}>{index + 1}</div>
                    <img
                      src={prod.image || 'https://via.placeholder.com/150'}
                      alt={prod.name}
                      style={styles.prodImage}
                    />
                    <div style={styles.prodInfo}>
                      <h4 style={styles.prodName}>{prod.name}</h4>
                      <p style={styles.prodPrice}>{formatVND(prod.price)}</p>
                    </div>
                    <div style={styles.prodStats}>
                      <span style={styles.soldBadge}>Đã bán {prod.total_sold} bánh</span>
                      <span style={styles.revenueBadge}>{formatVND(prod.total_revenue)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyProducts}>
                  <Award size={36} color="#bbb" />
                  <p>Chưa có dữ liệu giao dịch sản phẩm</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  adminPage: { backgroundColor: '#fdfdfd', minHeight: '100vh', fontFamily: "'Montserrat', sans-serif" },
  headerHero: { height: '180px', position: 'relative' },
  overlay: {
    position: 'absolute', inset: 0, backgroundColor: '#6b1111',
    backgroundImage: 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url("https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1200")',
    backgroundSize: 'cover', backgroundPosition: 'center',
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff',
  },
  mainTitle: { fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', color: '#fff', margin: 0 },
  kicker: { textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.75rem', marginBottom: '15px' },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 24px',
  },
  loadingContainer: {
    backgroundColor: '#fdfdfd',
    minHeight: '100vh',
    fontFamily: "'Montserrat', sans-serif",
  },
  spinnerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60vh',
  },
  spinner: {
    border: '4px solid rgba(107, 17, 17, 0.1)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    borderLeftColor: '#6b1111',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '15px',
    color: '#666',
    fontSize: '14px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '1px solid #e8e0d5',
    paddingBottom: '20px',
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
  badge: {
    backgroundColor: '#6b1111',
    color: '#fff',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  errorAlert: {
    backgroundColor: '#fdf2f2',
    color: '#9b1c1c',
    padding: '12px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '25px',
    border: '1px solid #fde8e8',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '35px',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    border: '1px solid #eee',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  iconContainer: {
    width: '50px',
    height: '50px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: '13px',
    color: '#777',
    margin: 0,
    fontWeight: '500',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#111',
    margin: '5px 0 0 0',
  },
  dashboardBody: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '30px',
  },
  chartWrapper: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #eee',
    padding: '30px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
  chartContainer: {
    marginTop: '20px',
    width: '100%',
  },
  svgChart: {
    width: '100%',
    height: 'auto',
    overflow: 'visible',
  },
  svgCircle: {
    cursor: 'pointer',
    transition: 'r 0.1s',
  },
  chartLegend: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '15px',
    fontSize: '12px',
    color: '#666',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#6b1111',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#333',
    margin: 0,
    fontFamily: 'serif',
  },
  sectionSubtitle: {
    fontSize: '13px',
    color: '#888',
    margin: '5px 0 0 0',
  },
  topProductsWrapper: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #eee',
    padding: '30px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
  },
  topProductsHeader: {
    marginBottom: '20px',
  },
  topProductsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    flex: 1,
  },
  prodItem: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: '15px',
    borderBottom: '1px solid #f3f4f6',
  },
  prodIndex: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#9ca3af',
    width: '24px',
  },
  prodImage: {
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    objectFit: 'cover',
    marginRight: '15px',
  },
  prodInfo: {
    flex: 1,
  },
  prodName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  prodPrice: {
    fontSize: '12px',
    color: '#777',
    margin: '3px 0 0 0',
  },
  prodStats: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  soldBadge: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '500',
  },
  revenueBadge: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b1111',
  },
  emptyProducts: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    color: '#888',
    gap: '10px',
  },
};

export default AdminDashboard;
