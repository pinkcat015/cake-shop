import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { token, logout, role } = useAuth();
  const isLoggedIn = Boolean(token);
  const [products, setProducts] = useState([]);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const response = await api.get('/products');
        if (isMounted) {
          setProducts(response.data || []);
        }
      } catch {
        if (isMounted) {
          setProducts([]);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set).slice(0, 8);
  }, [products]);

  const handleLogout = () => {
    logout();
  };

  return (
    <header style={styles.header}>
      <div style={styles.topBar}>
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navItem}>Home</Link>
          <div
            style={styles.productsMenuWrap}
            onMouseEnter={() => setIsProductsOpen(true)}
            onMouseLeave={() => setIsProductsOpen(false)}
          >
            <Link to="/products" style={styles.navItem}>Products</Link>
            {isProductsOpen && (
              <div style={styles.dropdown}>
                <Link to="/products" style={styles.dropdownItem}>All Products</Link>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Link
                      key={category}
                      to={`/products/category/${encodeURIComponent(category)}`}
                      style={styles.dropdownItem}
                    >
                      {category}
                    </Link>
                  ))
                ) : (
                  <div style={styles.dropdownEmpty}>No categories yet</div>
                )}
              </div>
            )}
          </div>
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
  productsMenuWrap: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: '15px',
    minWidth: '220px',
    backgroundColor: '#fff',
    border: '1px solid #e8e0d5',
    boxShadow: '0 18px 30px rgba(0,0,0,0.12)',
    borderRadius: '10px',
    padding: '10px 0',
    marginTop: '10px',
    zIndex: 20,
  },
  dropdownItem: {
    display: 'block',
    padding: '10px 18px',
    color: '#333',
    textDecoration: 'none',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  dropdownEmpty: {
    padding: '10px 18px',
    color: '#888',
    fontSize: '13px',
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