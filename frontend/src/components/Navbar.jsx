import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { token, logout, role } = useAuth();
  const isLoggedIn = Boolean(token);

  const handleLogout = () => {
    logout();
  };

  return (
    <header style={styles.header}>
      <div style={styles.topBar}>
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navItem}>Home</Link>
          <Link to="/products" style={styles.navItem}>Products</Link>
          <Link to="/locations" style={styles.navItem}>Locations</Link>
          <Link to="/news" style={styles.navItem}>News</Link>
        </div>
        <div style={styles.logo}>SCARLETT</div>
        <div style={styles.authLinks}>
          {isLoggedIn ? (
            // Khi đã đăng nhập
            <>
              <span style={styles.welcomeText}>Welcome back!</span>
              {role === 'admin' && <Link to="/admin/products" style={styles.navItem}>Admin</Link>}
              {role === 'employee' && <Link to="/employee/products" style={styles.navItem}>Employee</Link>}
              <Link to="/profile" style={styles.navItem}>Profile</Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </>
          ) : (
            // Khi chưa đăng nhập
            <>
              <Link to="/login" style={styles.navItem}>Login</Link>
              <Link to="/register" style={styles.navItem}>Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e2e2e2',
    padding: '20px 0',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  logo: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#6b1111', // Màu đỏ đặc trưng TLJ
    letterSpacing: '3px',
    fontFamily: 'serif',
  },
  navItem: {
    textDecoration: 'none',
    color: '#333',
    margin: '0 15px',
    fontSize: '14px',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  authLinks: {
    display: 'flex',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#333',
    margin: '0 15px',
    fontSize: '14px',
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: '#6b1111',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    fontSize: '14px',
    textTransform: 'uppercase',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '4px',
    marginLeft: '15px',
  },
};

export default Navbar;