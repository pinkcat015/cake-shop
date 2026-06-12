import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Copy, 
  Check, 
  QrCode, 
  Clock, 
  ArrowLeft, 
  Sparkles, 
  CreditCard, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import api from '../../api/api';
import Navbar from '../../components/Navbar';

const PaymentGateway = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('order_id');
  const amount = Number(searchParams.get('amount') || 0);

  // Countdown timer: 10 minutes (600 seconds)
  const [timeLeft, setTimeLeft] = useState(600);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedAmt, setCopiedAmt] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  // Simulation states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectCount, setRedirectCount] = useState(3);

  // Verification steps messages
  const verifySteps = [
    'Đang kết nối cổng đối soát ngân hàng...',
    'Đang tìm kiếm giao dịch chuyển khoản khớp nội dung...',
    'Xác nhận thông tin số tiền chuyển khoản...',
    'Giao dịch hợp lệ! Đang đồng bộ hóa trạng thái đơn hàng...',
  ];

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    if (!isVerifying) return;
    if (verifyStep >= verifySteps.length) {
      handleConfirmBackend();
      return;
    }

    const timer = setTimeout(() => {
      setVerifyStep((prev) => prev + 1);
    }, 800); // slightly faster transitions for better UX

    return () => clearTimeout(timer);
  }, [isVerifying, verifyStep]);

  useEffect(() => {
    if (!isSuccess) return;
    if (redirectCount <= 0) {
      navigate('/orders');
      return;
    }
    const timer = setTimeout(() => {
      setRedirectCount((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isSuccess, redirectCount, navigate]);

  const handleConfirmBackend = async () => {
    try {
      await api.post('/payments/confirm', { order_id: Number(orderId) });
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng thử lại.');
      setIsVerifying(false);
      setVerifyStep(0);
    }
  };

  const handleCopy = (text, setCopiedState) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 1500);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedAmount = amount.toLocaleString('vi-VN');
  const transferMsg = `SCARLETT ${orderId}`;
  
  // VietQR API image URL
  const qrUrl = `https://img.vietqr.io/image/MB-0348582531-print.png?amount=${amount}&addInfo=SCARLETT%20${orderId}&accountName=NGUYEN%20MINH%20TRANG`;

  return (
    <div style={styles.page}>
      <Navbar />
      
      {/* Verification Overlay */}
      {isVerifying && !isSuccess && (
        <div style={styles.overlay}>
          <div style={styles.loaderCard}>
            <div style={styles.spinner}></div>
            <h3 style={styles.loaderTitle}>Đang xác thực giao dịch</h3>
            <p style={styles.loaderStatus}>{verifySteps[verifyStep] || 'Đang hoàn tất...'}</p>
            <div style={styles.progressBarBg}>
              <div style={{
                ...styles.progressBarFill,
                width: `${((verifyStep + 1) / verifySteps.length) * 100}%`
              }} />
            </div>
            <div style={styles.sandboxLabelBox}>
              <Sparkles size={14} style={{ color: '#b89a5b', marginRight: '5px' }} />
              <span style={styles.sandboxLabel}>Hệ thống đối soát tự động của Scarlett Cake Shop</span>
            </div>
          </div>
        </div>
      )}

      {/* Success Screen Overlay */}
      {isSuccess && (
        <div style={styles.overlay}>
          <div style={styles.successCard}>
            <div style={styles.successCircle}>
              <svg style={styles.successCheck} viewBox="0 0 52 52">
                <circle style={styles.successCircleStroke} cx="26" cy="26" r="25" fill="none" />
                <path style={styles.successCheckStroke} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h2 style={styles.successTitle}>Thanh toán thành công!</h2>
            <p style={styles.successDesc}>Chúng tôi đã nhận được khoản thanh toán cho đơn hàng #{orderId}. Cảm ơn quý khách!</p>
            
            <div style={styles.successDetailBox}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Mã đơn hàng:</span>
                <strong style={styles.detailValue}>#{orderId}</strong>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Số tiền đã nhận:</span>
                <strong style={styles.detailValueHighlight}>{formattedAmount} đ</strong>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Trạng thái đơn hàng:</span>
                <span style={styles.confirmedBadge}>CONFIRMED</span>
              </div>
            </div>
            <p style={styles.redirectText}>Tự động chuyển hướng về lịch sử đơn hàng sau <strong>{redirectCount}</strong> giây...</p>
          </div>
        </div>
      )}

      <main style={styles.container}>
        {/* Breadcrumb path */}
        <div style={styles.breadcrumb}>
          <span>Cửa hàng</span> &nbsp;›&nbsp; <span>Giỏ hàng</span> &nbsp;›&nbsp; <span>Thanh toán</span> &nbsp;›&nbsp; <span style={{ color: '#6b1111', fontWeight: '700' }}>Cổng VietQR</span>
        </div>

        <div style={styles.header}>
          <div style={styles.sandboxBadge}>
            <Sparkles size={12} style={{ marginRight: '5px' }} />
            SANDBOX MODE
          </div>
          <h2 style={styles.pageTitle}>Cổng Thanh Toán Scarlett</h2>
          <div style={styles.underline}></div>
          <p style={styles.subtitle}>
            Quý khách vui lòng chuyển khoản đúng số tiền và nội dung bên dưới để hệ thống ghi nhận đơn hàng tự động.
          </p>
        </div>

        {/* Info Alert Box */}
        <div style={styles.alertBox}>
          <AlertCircle size={20} style={{ color: '#b89a5b', marginRight: '12px', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#5c1111', display: 'block', marginBottom: '3px' }}>Chế độ thử nghiệm thanh toán</strong>
            <span style={{ fontSize: '0.88rem', color: '#555' }}>
              Quý khách có thể sử dụng ứng dụng ngân hàng quét mã QR dưới đây để điền nhanh thông tin (không cần bấm chuyển tiền thực tế), sau đó nhấn nút <strong>"Xác nhận đã chuyển tiền"</strong> bên dưới để hoàn tất giả lập thanh toán.
            </span>
          </div>
        </div>

        <div style={styles.layout}>
          {/* LEFT: PAYMENT INFO */}
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <CreditCard size={18} style={{ color: '#6b1111', marginRight: '10px' }} />
              <h3 style={styles.cardTitle}>Thông tin tài khoản nhận</h3>
            </div>
            
            <div style={styles.infoList}>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Ngân hàng nhận</div>
                <div style={styles.infoValueRow}>
                  <span style={styles.infoValue}>MB Bank (Ngân hàng Quân Đội)</span>
                </div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Số tài khoản</div>
                <div style={styles.infoValueRow}>
                  <span style={styles.infoValueBold}>0348582531</span>
                  <button 
                    onClick={() => handleCopy('0348582531', setCopiedAcc)}
                    style={copiedAcc ? styles.copiedBtn : styles.copyBtn}
                  >
                    {copiedAcc ? <Check size={13} style={{ marginRight: '3px' }} /> : <Copy size={13} style={{ marginRight: '3px' }} />}
                    {copiedAcc ? 'Đã chép!' : 'Sao chép'}
                  </button>
                </div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Chủ tài khoản</div>
                <div style={styles.infoValueRow}>
                  <span style={styles.infoValue}>NGUYEN MINH TRANG</span>
                </div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Số tiền cần thanh toán</div>
                <div style={styles.infoValueRow}>
                  <span style={styles.infoPrice}>{formattedAmount} đ</span>
                  <button 
                    onClick={() => handleCopy(amount.toString(), setCopiedAmt)}
                    style={copiedAmt ? styles.copiedBtn : styles.copyBtn}
                  >
                    {copiedAmt ? <Check size={13} style={{ marginRight: '3px' }} /> : <Copy size={13} style={{ marginRight: '3px' }} />}
                    {copiedAmt ? 'Đã chép!' : 'Sao chép số tiền'}
                  </button>
                </div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Nội dung chuyển khoản (Ghi chính xác)</div>
                <div style={styles.infoValueRowHighlight}>
                  <span style={styles.infoMsg}>{transferMsg}</span>
                  <button 
                    onClick={() => handleCopy(transferMsg, setCopiedMsg)}
                    style={copiedMsg ? styles.copiedBtnHighlight : styles.copyBtnHighlight}
                  >
                    {copiedMsg ? <Check size={13} style={{ marginRight: '3px' }} /> : <Copy size={13} style={{ marginRight: '3px' }} />}
                    {copiedMsg ? 'Đã chép!' : 'Sao chép nội dung'}
                  </button>
                </div>
              </div>
            </div>

            <div style={styles.timerContainer}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Clock size={16} style={{ color: '#6b1111', marginRight: '8px' }} />
                <span style={styles.timerLabel}>Giao dịch tự động hết hạn sau:</span>
              </div>
              <span style={timeLeft < 60 ? styles.timerValueUrgent : styles.timerValue}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </section>

          {/* RIGHT: VIETQR CODE */}
          <section style={styles.cardCenter}>
            <div style={styles.cardHeaderCenter}>
              <QrCode size={18} style={{ color: '#6b1111', marginRight: '10px' }} />
              <h3 style={styles.cardTitleCenter}>Mã QR thanh toán nhanh</h3>
            </div>
            
            <div style={styles.qrWrapper}>
              {/* Corner decorative borders for premium look */}
              <div style={{...styles.qrCorner, top: -1, left: -1, borderTop: '3px solid #b89a5b', borderLeft: '3px solid #b89a5b'}} />
              <div style={{...styles.qrCorner, top: -1, right: -1, borderTop: '3px solid #b89a5b', borderRight: '3px solid #b89a5b'}} />
              <div style={{...styles.qrCorner, bottom: -1, left: -1, borderBottom: '3px solid #b89a5b', borderLeft: '3px solid #b89a5b'}} />
              <div style={{...styles.qrCorner, bottom: -1, right: -1, borderBottom: '3px solid #b89a5b', borderRight: '3px solid #b89a5b'}} />
              
              <img 
                src={qrUrl} 
                alt="VietQR MB Bank Nguyen Minh Trang" 
                style={styles.qrImage}
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = "https://via.placeholder.com/300?text=VietQR+Connection+Error";
                }}
              />
            </div>
            <p style={styles.qrHint}>
              Mở camera hoặc app ngân hàng của quý khách quét mã này để tự động điền chính xác thông tin chuyển khoản.
            </p>
          </section>
        </div>

        {/* ACTIONS */}
        <div style={styles.actionSection}>
          <button 
            onClick={() => setIsVerifying(true)}
            style={styles.confirmBtn}
          >
            <ShieldCheck size={18} style={{ marginRight: '8px' }} />
            XÁC NHẬN ĐÃ CHUYỂN TIỀN (GIẢ LẬP THANH TOÁN)
          </button>
          
          <button 
            onClick={() => navigate('/orders')} 
            style={styles.cancelBtn}
          >
            <ArrowLeft size={16} style={{ marginRight: '8px' }} />
            Quay lại trang đơn hàng của tôi
          </button>
        </div>
      </main>

      {/* Embedded CSS for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes drawCheck {
          0% { stroke-dashoffset: 48; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes drawCircle {
          0% { stroke-dashoffset: 157; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes pulseAlert {
          0% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}} />
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: '#fdfcfb', // Cream soft white
    minHeight: '100vh',
    fontFamily: "'Manrope', sans-serif",
    color: '#5c5464',
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '30px 20px 80px',
    boxSizing: 'border-box',
  },
  breadcrumb: {
    fontSize: '0.82rem',
    color: '#9e95a5',
    textAlign: 'left',
    marginBottom: '30px',
    letterSpacing: '0.5px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '35px',
  },
  sandboxBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #c88959, #b89a5b)',
    color: '#fff',
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '6px 14px',
    borderRadius: '20px',
    letterSpacing: '1px',
    marginBottom: '12px',
    boxShadow: '0 4px 10px rgba(184, 154, 91, 0.25)',
  },
  pageTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2.5rem',
    color: '#390909', // Deep dark burgundy
    margin: 0,
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  underline: {
    width: '60px',
    height: '3px',
    backgroundColor: '#6b1111', // Bordeaux red
    margin: '15px auto 20px',
    borderRadius: '1.5px',
  },
  subtitle: {
    fontSize: '0.98rem',
    color: '#847a8a',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  alertBox: {
    display: 'flex',
    alignItems: 'flex-start',
    backgroundColor: '#faf6f0', // soft golden cream
    borderLeft: '4px solid #b89a5b', // gold
    padding: '18px 22px',
    borderRadius: '0 12px 12px 0',
    marginBottom: '35px',
    textAlign: 'left',
    boxShadow: '0 4px 12px rgba(184, 154, 91, 0.05)',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1.15fr 0.85fr',
    gap: '35px',
    alignItems: 'stretch',
    marginBottom: '45px',
    '@media (max-width: 800px)': {
      gridTemplateColumns: '1fr',
    },
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid #f1ece6',
    padding: '35px',
    boxShadow: '0 10px 35px rgba(57, 9, 9, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    textAlign: 'left',
  },
  cardCenter: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid #f1ece6',
    padding: '35px',
    boxShadow: '0 10px 35px rgba(57, 9, 9, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #f8f6f2',
    paddingBottom: '15px',
    marginBottom: '25px',
    width: '100%',
  },
  cardHeaderCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid #f8f6f2',
    paddingBottom: '15px',
    marginBottom: '25px',
    width: '100%',
  },
  cardTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.25rem',
    color: '#390909',
    margin: 0,
    fontWeight: '700',
  },
  cardTitleCenter: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.25rem',
    color: '#390909',
    margin: 0,
    fontWeight: '700',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    width: '100%',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  infoLabel: {
    fontSize: '0.8rem',
    color: '#a399aa',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  infoValueRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
    backgroundColor: '#faf9f6',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #f5f1ea',
  },
  infoValueRowHighlight: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
    backgroundColor: '#fff7f7', // light bordeaux tint
    padding: '14px 18px',
    borderRadius: '8px',
    border: '1px solid #ffd8d8',
  },
  infoValue: {
    fontSize: '0.95rem',
    color: '#390909',
    fontWeight: '600',
  },
  infoValueBold: {
    fontSize: '1.08rem',
    color: '#390909',
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: '0.5px',
  },
  infoPrice: {
    fontSize: '1.2rem',
    color: '#6b1111',
    fontWeight: '800',
  },
  infoMsg: {
    fontSize: '1.15rem',
    color: '#6b1111',
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: '0.5px',
  },
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#faf6f0',
    color: '#b89a5b',
    border: '1px solid #e5d8c3',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  copyBtnHighlight: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#6b1111',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 14px',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow: '0 4px 10px rgba(107, 17, 17, 0.15)',
  },
  copiedBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    border: '1px solid #a7f3d0',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'default',
  },
  copiedBtnHighlight: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    border: '1px solid #a7f3d0',
    borderRadius: '6px',
    padding: '8px 14px',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'default',
  },
  timerContainer: {
    marginTop: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff9f9',
    border: '1px solid #ffe3e3',
    borderRadius: '10px',
    padding: '12px 18px',
  },
  timerLabel: {
    fontSize: '0.88rem',
    color: '#847a8a',
    fontWeight: '600',
  },
  timerValue: {
    fontSize: '1.15rem',
    color: '#6b1111',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  timerValueUrgent: {
    fontSize: '1.15rem',
    color: '#e11d48',
    fontWeight: '700',
    fontFamily: 'monospace',
    animation: 'pulseAlert 0.8s infinite alternate',
  },
  qrWrapper: {
    backgroundColor: '#fff',
    border: '1px solid #f5eee5',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 12px 30px rgba(57, 9, 9, 0.02)',
    marginBottom: '20px',
    position: 'relative',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCorner: {
    position: 'absolute',
    width: '18px',
    height: '18px',
  },
  qrImage: {
    width: '240px',
    height: '240px',
    objectFit: 'contain',
    display: 'block',
  },
  qrHint: {
    fontSize: '0.85rem',
    color: '#847a8a',
    lineHeight: '1.6',
    margin: 0,
    maxWidth: '280px',
  },
  actionSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    marginTop: '15px',
  },
  confirmBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6b1111',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '18px 40px',
    fontSize: '0.98rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
    cursor: 'pointer',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 8px 24px rgba(107, 17, 17, 0.25)',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    outline: 'none',
  },
  cancelBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    color: '#847a8a',
    border: '1px solid #dcd5cc',
    borderRadius: '10px',
    padding: '14px 30px',
    fontSize: '0.88rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    maxWidth: '520px',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  
  // Overlay & Modal Styles
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(57, 9, 9, 0.82)', // Burgurdy tinted backdrop
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backdropFilter: 'blur(10px)',
  },
  loaderCard: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    padding: '45px 35px',
    width: '100%',
    maxWidth: '440px',
    textAlign: 'center',
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.35)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid #f1ece6',
  },
  spinner: {
    width: '56px',
    height: '56px',
    border: '4px solid #faf6f0',
    borderTop: '4px solid #6b1111',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '25px',
  },
  loaderTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.55rem',
    color: '#390909',
    margin: '0 0 12px 0',
    fontWeight: '700',
  },
  loaderStatus: {
    fontSize: '0.95rem',
    color: '#847a8a',
    marginBottom: '25px',
    minHeight: '22px',
  },
  progressBarBg: {
    width: '100%',
    height: '6px',
    backgroundColor: '#f3f4f6',
    borderRadius: '999px',
    overflow: 'hidden',
    marginBottom: '22px',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6b1111',
    borderRadius: '999px',
    transition: 'width 0.4s ease-out',
  },
  sandboxLabelBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sandboxLabel: {
    fontSize: '0.78rem',
    color: '#a399aa',
    fontWeight: '600',
  },
  
  // Success Card Styles
  successCard: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    padding: '50px 40px',
    width: '100%',
    maxWidth: '480px',
    textAlign: 'center',
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.35)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid #f1ece6',
    animation: 'scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  successCircle: {
    width: '84px',
    height: '84px',
    borderRadius: '50%',
    backgroundColor: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '25px',
  },
  successCheck: {
    width: '52px',
    height: '52px',
  },
  successCircleStroke: {
    stroke: '#10b981',
    strokeWidth: 2,
    strokeDasharray: 157,
    strokeDashoffset: 157,
    animation: 'drawCircle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards 0.2s',
  },
  successCheckStroke: {
    stroke: '#10b981',
    strokeWidth: 3,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeDasharray: 48,
    strokeDashoffset: 48,
    animation: 'drawCheck 0.4s cubic-bezier(0.65, 0, 0.45, 1) forwards 0.8s',
  },
  successTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.9rem',
    color: '#059669',
    margin: '0 0 12px 0',
    fontWeight: '700',
  },
  successDesc: {
    fontSize: '0.96rem',
    color: '#847a8a',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  successDetailBox: {
    width: '100%',
    backgroundColor: '#faf9f6',
    border: '1px solid #f1ece6',
    borderRadius: '12px',
    padding: '18px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '30px',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: '0.88rem',
    color: '#847a8a',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: '0.92rem',
    color: '#390909',
    fontWeight: '700',
  },
  detailValueHighlight: {
    fontSize: '1.1rem',
    color: '#6b1111',
    fontWeight: '800',
  },
  confirmedBadge: {
    backgroundColor: '#ecfdf5',
    color: '#059669',
    fontSize: '0.78rem',
    fontWeight: '700',
    padding: '4px 12px',
    borderRadius: '6px',
    border: '1px solid #10b981',
  },
  redirectText: {
    fontSize: '0.88rem',
    color: '#a399aa',
    margin: 0,
  },
};

export default PaymentGateway;
