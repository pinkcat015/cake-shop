import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { KeyRound, ArrowRight, Home } from 'lucide-react';
import Navbar from '../../../components/Navbar';

const ForgotSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || 'email của bạn';

  const handleGoToReset = () => {
    navigate('/reset-password', { state: { email } });
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.iconCircle}>
            <KeyRound size={40} color="#b89a5b" />
          </div>
          
          <h2 style={styles.title}>Mã OTP Đã Được Gửi!</h2>
          <p style={styles.subtitle}>
            Hệ thống đã gửi một mã OTP khôi phục mật khẩu gồm 6 chữ số đến hòm thư:
          </p>
          
          <div style={styles.emailBox}>
            <strong>{email}</strong>
          </div>
          
          <p style={styles.description}>
            Vui lòng kiểm tra hòm thư của bạn và nhập mã OTP nhận được tại trang đặt lại mật khẩu để thiết lập mật khẩu mới cho tài khoản.
          </p>

          <div style={styles.actionRow}>
            <button onClick={handleGoToReset} style={styles.primaryButton}>
              Nhập mã OTP & Đổi mật khẩu
              <ArrowRight size={16} style={{ marginLeft: '6px' }} />
            </button>
          </div>

          <div style={styles.footer}>
            <Link to="/" style={styles.homeLink}>
              <Home size={14} style={{ marginRight: '6px' }} />
              Quay lại Trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#fdfcfb',
    fontFamily: "'Manrope', sans-serif",
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px 20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 10px 35px rgba(57, 9, 9, 0.04)',
    padding: '45px 35px',
    maxWidth: '480px',
    width: '100%',
    border: '1px solid #f1ece6',
    textAlign: 'center',
  },
  iconCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#faf6f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 25px',
    border: '1px solid #e5d8c3',
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.8rem',
    color: '#390909',
    margin: '0 0 10px 0',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: '0.92rem',
    color: '#847a8a',
    margin: '0 0 15px 0',
    lineHeight: '1.5',
  },
  emailBox: {
    backgroundColor: '#faf6f0',
    border: '1px solid #e5d8c3',
    borderRadius: '8px',
    padding: '12px 18px',
    color: '#6b1111',
    fontSize: '1rem',
    marginBottom: '20px',
    wordBreak: 'break-all',
  },
  description: {
    fontSize: '0.88rem',
    color: '#6b6375',
    lineHeight: '1.6',
    margin: '0 0 30px 0',
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '25px',
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#6b1111',
    color: '#fff',
    border: 'none',
    padding: '12px 28px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 6px 15px rgba(107, 17, 17, 0.15)',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  footer: {
    borderTop: '1px solid #f8f6f2',
    paddingTop: '20px',
    display: 'flex',
    justifyContent: 'center',
  },
  homeLink: {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#847a8a',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
};

export default ForgotSuccess;
