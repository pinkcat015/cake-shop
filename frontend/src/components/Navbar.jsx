import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { token, logout, role } = useAuth();
  const isLoggedIn = Boolean(token);
  const [products, setProducts] = useState([]);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const response = await api.get('/products');
        if (isMounted) setProducts(response.data || []);
      } catch {
        if (isMounted) setProducts([]);
      }
    };
    loadCategories();
    return () => { isMounted = false; };
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((item) => { if (item.category) set.add(item.category); });
    return Array.from(set).slice(0, 8);
  }, [products]);

  return (
    <header style={styles.header}>
      <div style={styles.topBar}>

        {/* TRÁI: nav chính */}
        <nav style={styles.navLinks}>
          <Link to="/" style={styles.navItem}>Home</Link>


          <div
            style={styles.menuWrap}
            onMouseEnter={() => setIsProductsOpen(true)}
            onMouseLeave={() => setIsProductsOpen(false)}
          >
            <Link to="/products" style={styles.navItem}>Products</Link>
            {isProductsOpen && (
              <div style={styles.dropdown}>
                <Link to="/products" style={styles.dropdownItem}>All Products</Link>
                {categories.length > 0
                  ? categories.map(cat => (
                    <Link
                      key={cat}
                      to={`/products/category/${encodeURIComponent(cat)}`}
                      style={styles.dropdownItem}
                    >
                      {cat}
                    </Link>
                  ))
                  : <div style={styles.dropdownEmpty}>No categories yet</div>
                }
              </div>
            )}
          </div>

          <Link to="/locations" style={styles.navItem}>Locations</Link>
          <Link to="/news" style={styles.navItem}>News</Link>
          <Link to="/cart" style={styles.navItem}>Cart</Link>
        </nav>

        {/* GIỮA: logo */}
        <div style={styles.logo}>SCARLETT</div>

        {/* PHẢI: auth */}
        <div style={styles.authLinks}>
          {isLoggedIn ? (
            <>
              <span style={styles.welcomeText}>Welcome back!</span>
              <Link to="/orders" style={styles.navItem}>Orders</Link>

              {role === 'admin' && (
                <div
                  style={styles.menuWrap}
                  onMouseEnter={() => setIsAdminOpen(true)}
                  onMouseLeave={() => setIsAdminOpen(false)}
                >
                  <span style={styles.navItem}>Admin ▾</span>
                  {isAdminOpen && (
                    <div style={styles.dropdown}>
                      <Link to="/admin/dashboard" style={styles.dropdownItem}>Dashboard</Link>
                      <Link to="/admin/orders" style={styles.dropdownItem}>Đơn hàng</Link>
                      <Link to="/admin/vouchers" style={styles.dropdownItem}>Vouchers</Link>
                      <Link to="/admin/products" style={styles.dropdownItem}>Sản phẩm</Link>
                      <Link to="/admin/stores" style={styles.dropdownItem}>Cửa hàng</Link>
                    </div>
                  )}
                </div>
              )}

              {role === 'employee' && (
                <div
                  style={styles.menuWrap}
                  onMouseEnter={() => setIsEmployeeOpen(true)}
                  onMouseLeave={() => setIsEmployeeOpen(false)}
                >
                  <span style={styles.navItem}>Employee ▾</span>
                  {isEmployeeOpen && (
                    <div style={styles.dropdown}>
                      <Link to="/admin/orders" style={styles.dropdownItem}>Đơn hàng</Link>
                      <Link to="/employee/products" style={styles.dropdownItem}>Sản phẩm</Link>
                    </div>
                  )}
                </div>
              )}

              <Link to="/profile" style={styles.navItem}>Profile</Link>
              <button onClick={logout} style={styles.logoutBtn}>Logout</button>
            </>
          ) : (
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
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
  },
  logo: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#6b1111',
    letterSpacing: '3px',
    fontFamily: 'serif',
    flexShrink: 0,
  },

  // Nav trái & phải dùng chung flex
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: 1,
  },
  authLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: 1,
    justifyContent: 'flex-end',
  },

  navItem: {
    textDecoration: 'none',
    color: '#333',
    padding: '6px 12px',
    fontSize: '13px',
    textTransform: 'uppercase',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  welcomeText: {
    color: '#333',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },

  // Dropdown wrapper
  menuWrap: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: '0',
    minWidth: '200px',
    backgroundColor: '#fff',
    border: '1px solid #e8e0d5',
    boxShadow: '0 18px 30px rgba(0,0,0,0.12)',
    borderRadius: '10px',
    padding: '10px 0',
    zIndex: 200,
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

  logoutBtn: {
    backgroundColor: '#6b1111',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    fontSize: '13px',
    textTransform: 'uppercase',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '4px',
    marginLeft: '8px',
    whiteSpace: 'nowrap',
  },
};

export default Navbar;