import React, { useEffect, useState } from 'react';

const CartFlightOverlay = () => {
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    const handleCartAdded = (event) => {
      const target = document.querySelector('.floating-cart');
      const targetRect = target?.getBoundingClientRect?.();
      const sourceRect = event.detail?.sourceRect;

      const startX = sourceRect ? sourceRect.left + sourceRect.width / 2 : window.innerWidth - 56;
      const startY = sourceRect ? sourceRect.top + sourceRect.height / 2 : window.innerHeight - 56;
      const endX = targetRect ? targetRect.left + targetRect.width / 2 : window.innerWidth - 40;
      const endY = targetRect ? targetRect.top + targetRect.height / 2 : window.innerHeight - 40;

      const flight = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        startX,
        startY,
        dx: endX - startX,
        dy: endY - startY,
      };

      setFlights((current) => [...current, flight]);
    };

    window.addEventListener('cart-added', handleCartAdded);
    return () => window.removeEventListener('cart-added', handleCartAdded);
  }, []);

  const removeFlight = (id) => {
    setFlights((current) => current.filter((flight) => flight.id !== id));
  };

  if (flights.length === 0) {
    return null;
  }

  return (
    <div className="cart-flight-layer" aria-hidden="true">
      {flights.map((flight) => (
        <span
          key={flight.id}
          className="cart-flight"
          style={{
            left: `${flight.startX}px`,
            top: `${flight.startY}px`,
            '--dx': `${flight.dx}px`,
            '--dy': `${flight.dy}px`,
          }}
          onAnimationEnd={() => removeFlight(flight.id)}
        >
          <span className="cart-flight__trail" />
          <span className="cart-flight__core">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path d="M7 6h13l-1.6 7.2H9L7 6Zm-1-2a1 1 0 0 0-.98.79L4 8H2.5a1 1 0 1 0 0 2h.9l1.7 8.4a1 1 0 0 0 .98.8h10.5a1 1 0 1 0 0-2H6.9l-.3-1.4h9.9a1 1 0 0 0 .98-.78l2.1-9.2A1 1 0 0 0 18.6 5H6Zm2 15.5a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Zm8 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Z" />
            </svg>
          </span>
        </span>
      ))}
    </div>
  );
};

export default CartFlightOverlay;