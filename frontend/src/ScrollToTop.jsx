// src/components/ScrollToTop.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Delay to let DOM update before scrolling
    const timeout = setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 50); // 50ms usually works well

    return () => clearTimeout(timeout); // cleanup
  }, [pathname]); // This component doesn't render anything
};

export default ScrollToTop;