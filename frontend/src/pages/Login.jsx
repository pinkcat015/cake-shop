import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import Navbar from '../components/Navbar';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', formData);
      login(response.data.token);
      navigate('/profile');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={styles.page}>
      {/* Video background layer */}
      <video autoPlay muted loop playsInline style={styles.bgVideo}>
        <source src="https://cdn.pixabay.com/video/2024/12/24/248474_large.mp4" type="video/mp4" />
      </video>
      {/* Subtle dark overlay so text remains readable */}
      <div style={styles.videoOverlay} />

      {/* Foreground content layer */}
      <div style={styles.contentLayer}>
        <Navbar />
        <main style={styles.shell}>
          <section style={styles.heroPanel}>
            <span style={styles.kicker}>SCARLETT BAKERY</span>
            <h1 style={styles.heroTitle}>Welcome back</h1>
            <p style={styles.heroText}>
              Sign in to save your favorites, track orders, and continue your bakery story.
            </p>
          </section>

          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Login</h2>
              <p style={styles.cardSubtitle}>Use your username and password to enter your account.</p>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <label style={styles.field}>
                <span style={styles.label}>Username</span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Enter your username"
                />
              </label>

              <label style={styles.field}>
                <span style={styles.label}>Password</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Enter your password"
                />
              </label>

              <button type="submit" style={styles.primaryButton}>
                Login
              </button>
            </form>

            <p style={styles.switchText}>
              Don't have an account?{' '}
              <Link to="/register" style={styles.switchLink}>
                Register
              </Link>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Manrope', sans-serif",
  },
  bgVideo: {
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: -3,
  },
  videoOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'linear-gradient(120deg, rgba(0, 0, 0, 0.5) 0%, rgba(14, 14, 14, 0.42) 100%)',
    zIndex: -2,
  },
  contentLayer: {
    position: 'relative',
    zIndex: 1,
  },
  shell: {
    minHeight: 'calc(100vh - 72px)',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 460px)',
    gap: '32px',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 24px 64px',
  },
  heroPanel: {
    color: '#fff2f2',
    padding: '32px 20px',
    textAlign: 'left',
  },
  kicker: {
    display: 'inline-block',
    marginBottom: '18px',
    color: '#ffd0d0',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '3px',
  },
  heroTitle: {
    margin: 0,
    fontSize: 'clamp(44px, 6vw, 72px)',
    lineHeight: 1,
    color: 'rgba(255, 242, 242, 0.92)',
    fontFamily: "'Playfair Display', serif",
    letterSpacing: '-0.6px',
  },
  heroText: {
    maxWidth: '540px',
    marginTop: '20px',
    fontSize: '18px',
    lineHeight: '1.8',
    color: 'rgba(255, 242, 242, 0.88)',
  },
  card: {
    backgroundColor: 'rgba(255, 244, 244, 0.94)',
    border: '1px solid rgba(120, 25, 31, 0.18)',
    borderRadius: '28px',
    boxShadow: '0 24px 60px rgba(38, 6, 10, 0.24)',
    padding: '34px',
    backdropFilter: 'blur(10px)',
    textAlign: 'left',
  },
  cardHeader: {
    marginBottom: '24px',
  },
  cardTitle: {
    margin: 0,
    color: '#5c0f15',
    fontSize: '34px',
    fontFamily: "'Playfair Display', serif",
  },
  cardSubtitle: {
    margin: '10px 0 0',
    color: '#7a4b4f',
    lineHeight: '1.7',
  },
  errorBox: {
    backgroundColor: '#fff0f0',
    color: '#8f2328',
    border: '1px solid #efb8b8',
    borderRadius: '14px',
    padding: '12px 14px',
    marginBottom: '18px',
    textAlign: 'left',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    textAlign: 'left',
  },
  label: {
    color: '#7a161d',
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.4px',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid rgba(120, 25, 31, 0.22)',
    borderRadius: '16px',
    padding: '15px 16px',
    fontSize: '16px',
    outline: 'none',
    backgroundColor: '#fff8f8',
    color: '#5c0f15',
  },
  primaryButton: {
    marginTop: '8px',
    border: 'none',
    borderRadius: '999px',
    padding: '15px 18px',
    background: 'linear-gradient(135deg, #c53a3a 0%, #8c1f28 100%)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 14px 28px rgba(140, 31, 40, 0.3)',
  },
  switchText: {
    margin: '22px 0 0',
    color: '#7a4b4f',
    textAlign: 'center',
  },
  switchLink: {
    color: '#8c1f28',
    fontWeight: 700,
    textDecoration: 'none',
  },
};

export default Login;