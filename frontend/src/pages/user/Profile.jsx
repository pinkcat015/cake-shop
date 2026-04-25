import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Navbar from '../../components/Navbar';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const { token, logout } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        setProfile(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch profile');
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleLogout = () => {
    logout();
  };

  if (!profile) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div style={styles.loadingWrap}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.shell}>
        <section style={styles.card}>
          <div style={styles.topRow}>
            <div style={styles.avatar}>{profile.username?.slice(0, 1)?.toUpperCase()}</div>
            <div>
              <span style={styles.kicker}>ACCOUNT PROFILE</span>
              <h1 style={styles.title}>Hello, {profile.username}</h1>
              <p style={styles.subtitle}>Your bakery account at a glance.</p>
            </div>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Username</span>
              <strong style={styles.statValue}>{profile.username}</strong>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Email</span>
              <strong style={styles.statValue}>{profile.email}</strong>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Role</span>
              <strong style={styles.roleBadge}>{profile.role_name}</strong>
            </div>
          </div>

          <div style={styles.actionsRow}>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top left, rgba(255, 190, 190, 0.2), transparent 28%), linear-gradient(135deg, #43080d 0%, #6b161d 34%, #9d3a3a 68%, #2b0508 100%)',
  },
  shell: {
    minHeight: 'calc(100vh - 72px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px 64px',
  },
  loadingWrap: {
    minHeight: 'calc(100vh - 72px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff2f2',
    fontSize: '18px',
  },
  card: {
    width: '100%',
    maxWidth: '980px',
    backgroundColor: 'rgba(255, 244, 244, 0.94)',
    border: '1px solid rgba(120, 25, 31, 0.18)',
    borderRadius: '30px',
    boxShadow: '0 24px 60px rgba(38, 6, 10, 0.24)',
    padding: '36px',
    backdropFilter: 'blur(10px)',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    marginBottom: '28px',
  },
  avatar: {
    width: '82px',
    height: '82px',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #c53a3a 0%, #8c1f28 100%)',
    color: '#fff',
    fontFamily: "'Playfair Display', serif",
    fontSize: '34px',
    fontWeight: 700,
    boxShadow: '0 18px 32px rgba(140, 31, 40, 0.3)',
  },
  kicker: {
    display: 'inline-block',
    marginBottom: '10px',
    color: '#ffd0d0',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '3px',
  },
  title: {
    margin: 0,
    color: '#5c0f15',
    fontSize: 'clamp(32px, 4vw, 50px)',
    lineHeight: 1,
    fontFamily: "'Playfair Display', serif",
  },
  subtitle: {
    margin: '12px 0 0',
    color: '#7a4b4f',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  statCard: {
    borderRadius: '20px',
    padding: '20px',
    backgroundColor: '#fff8f8',
    border: '1px solid rgba(120, 25, 31, 0.12)',
    textAlign: 'left',
  },
  statLabel: {
    display: 'block',
    marginBottom: '10px',
    color: '#7a4b4f',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '1.4px',
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#5c0f15',
    fontSize: '18px',
    wordBreak: 'break-word',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '999px',
    padding: '10px 14px',
    backgroundColor: '#f0c6c6',
    color: '#8c1f28',
    fontSize: '14px',
    fontWeight: 700,
    textTransform: 'capitalize',
  },
  actionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '28px',
  },
  logoutButton: {
    border: 'none',
    borderRadius: '999px',
    padding: '14px 22px',
    background: 'linear-gradient(135deg, #c53a3a 0%, #8c1f28 100%)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 14px 28px rgba(140, 31, 40, 0.3)',
  },
};

export default Profile;