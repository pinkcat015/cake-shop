import React, { useEffect, useRef, useState } from 'react';

const RevealOnScroll = ({ children, className = '', style = {}, delay = 0, threshold = 0.2, rootMargin = '0px 0px -120px 0px' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'visible' : ''} ${className}`.trim()}
      style={{ transitionDelay: `${delay}s`, ...style }}
    >
      {children}
    </div>
  );
};

export default RevealOnScroll;
