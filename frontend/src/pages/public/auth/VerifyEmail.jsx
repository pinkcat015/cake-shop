import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../../api/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const triggerVerify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Mã xác thực email không tìm thấy hoặc không đúng.');
        return;
      }

      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Tài khoản của bạn đã được kích hoạt thành công!');
        
        // Auto redirect to login after 4 seconds
        const timer = setTimeout(() => {
          navigate('/login');
        }, 4000);
        return () => clearTimeout(timer);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Kích hoạt tài khoản thất bại. Liên kết có thể đã hết hạn.');
      }
    };

    triggerVerify();
  }, [token, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.logo}>SCARLETT</h2>
        
        {status === 'loading' && (
          <div style={styles.statusBox}>
            <Loader size={48} color="#6b1111" style={styles.spinner} />
            <h3 style={styles.statusTitle}>Đang Xác Thực Tài Khoản</h3>
            <p style={styles.statusDesc}>Vui lòng chờ trong giây lát để chúng tôi xử lý kích hoạt email của bạn...</p>
          </div>
        )}

        {status === 'success' && (
          <div style={styles.statusBox}>
            <CheckCircle size={48} color="#166534" />
            <h3 style={{ ...styles.statusTitle, color: '#166534' }}>Xác Thực Thành Công!</h3>
            <p style={styles.statusDesc}>{message}</p>
            <p style={styles.redirectText}>Đang chuyển hướng bạn về trang Đăng nhập...</p>
          </div>
        )}

        {status === 'error' && (
          <div style={styles.statusBox}>
            <XCircle size={48} color="#9b1c1c" />
            <h3 style={{ ...styles.statusTitle, color: '#9b1c1c' }}>Kích Hoạt Thất Bại</h3>
            <p style={styles.statusDesc}>{message}</p>
            <Link to="/register" style={styles.button}>Đăng ký lại</Link>
          </div>
        )}

        <div style={styles.footer}>
          <Link to="/login" style={styles.link}>Đi đến trang Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    backgroundColor: '#f7f5f2',
    padding: '20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    padding: '40px',
    maxWidth: '450px',
    width: '100%',
    border: '1px solid #e8e0d5',
    textAlign: 'center',
  },
  logo: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#6b1111',
    letterSpacing: '3px',
    fontFamily: 'serif',
    margin: '0 0 30px 0',
  },
  statusBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '25px',
  },
  statusTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#333',
    margin: '10px 0 0 0',
  },
  statusDesc: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
    margin: 0,
  },
  redirectText: {
    fontSize: '12px',
    color: '#888',
    fontStyle: 'italic',
    margin: '10px 0 0 0',
  },
  spinner: {
    animation: 'spin 1.5s linear infinite',
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#6b1111',
    color: '#fff',
    textDecoration: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: '15px',
  },
  footer: {
    marginTop: '20px',
    borderTop: '1px solid #f3f4f6',
    paddingTop: '20px',
  },
  link: {
    color: '#6b1111',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
  },
};

export default VerifyEmail;
