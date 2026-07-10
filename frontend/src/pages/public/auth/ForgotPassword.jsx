import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../api/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError('Vui lòng nhập email');

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.post('/auth/forgot-password', { email });
      navigate('/forgot-success', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Quên Mật Khẩu</h2>
        <p style={styles.subtitle}>Nhập email của bạn để nhận mã xác thực OTP khôi phục mật khẩu</p>

        {error && <div style={styles.errorAlert}>{error}</div>}
        {message && <div style={styles.successAlert}>{message}</div>}



        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Địa chỉ Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
              style={styles.input}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
          </button>
        </form>

        <div style={styles.footer}>
          <Link to="/login" style={styles.link}>Quay lại Đăng nhập</Link>
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
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#6b1111',
    textAlign: 'center',
    marginBottom: '10px',
    fontFamily: 'serif',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
    marginBottom: '25px',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    backgroundColor: '#6b1111',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  errorAlert: {
    backgroundColor: '#fdf2f2',
    color: '#9b1c1c',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '20px',
    border: '1px solid #fde8e8',
  },
  successAlert: {
    backgroundColor: '#f0fdf4',
    color: '#166534',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '20px',
    border: '1px solid #dcfce7',
  },
  demoOtpBox: {
    backgroundColor: '#fffbeb',
    border: '1px dashed #f59e0b',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  otpLabel: {
    fontSize: '13px',
    color: '#b45309',
    margin: '0 0 5px 0',
    fontWeight: '600',
  },
  otpValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#d97706',
    letterSpacing: '5px',
    margin: '10px 0',
  },
  otpNote: {
    fontSize: '12px',
    color: '#666',
    margin: 0,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: '25px',
    textAlign: 'center',
  },
  link: {
    color: '#6b1111',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
  },
};

export default ForgotPassword;
