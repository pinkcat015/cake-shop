import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const FloatingCart = () => {
  const { token } = useAuth();
  const location = useLocation();
  const [itemCount, setItemCount] = useState(0);
  const [pulse, setPulse] = useState(false);
  const previousCountRef = useRef(0);

  useEffect(() => {
    if (!token || location.pathname === '/cart') {
      return undefined;
    }

    let isActive = true;

    const loadCount = async () => {
      try {
        const response = await api.get('/cart');
        if (!isActive) return;

        const items = response.data.items || [];
        const total = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        setItemCount(total);
      } catch {
        if (isActive) {
          setItemCount(0);
        }
      }
    };

    loadCount();

    return () => {
      isActive = false;
    };
  }, [location.pathname, token]);

  useEffect(() => {
    const handleCartUpdated = () => {
      if (!token || location.pathname === '/cart') {
        return;
      }

      api.get('/cart')
        .then((response) => {
          const items = response.data.items || [];
          const total = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
          setItemCount(total);
        })
        .catch(() => {
          setItemCount(0);
        });
    };

    window.addEventListener('cart-updated', handleCartUpdated);
    return () => window.removeEventListener('cart-updated', handleCartUpdated);
  }, [location.pathname, token]);

  useEffect(() => {
    if (itemCount > previousCountRef.current) {
      const pulseTimeout = window.setTimeout(() => {
        setPulse(true);
      }, 0);
      const timeoutId = window.setTimeout(() => setPulse(false), 620);
      previousCountRef.current = itemCount;
      return () => {
        window.clearTimeout(pulseTimeout);
        window.clearTimeout(timeoutId);
      };
    }

    previousCountRef.current = itemCount;
    return undefined;
  }, [itemCount]);

  if (!token || location.pathname === '/cart') {
    return null;
  }

  return (
    <Link
      to="/cart"
      className={`floating-cart ${pulse ? 'floating-cart--pulse' : ''}`}
      aria-label={`Giỏ hàng có ${itemCount} sản phẩm`}
      title="Giỏ hàng"
    >
      <span className="floating-cart__ring" aria-hidden="true" />
      <span className="floating-cart__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="img" focusable="false">
          <path d="M6.3 5.5h14l-1.7 7.8H8.4L6.3 5.5Zm-.6-2a1 1 0 0 0-.98.79L4.1 7H2.9a1 1 0 1 0 0 2h.4l1.8 8.9a1 1 0 0 0 1 .8H16.7a1 1 0 1 0 0-2H7.9l-.3-1.7h10.8a1 1 0 0 0 .97-.78l2.2-10A1 1 0 0 0 21 3H5.7Zm2 17.5a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Zm10 0a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Z" />
        </svg>
      </span>
      {itemCount > 0 && <span className="floating-cart__badge">{itemCount}</span>}
    </Link>
  );
};

export default FloatingCart;