import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when pathname changes
    const scrollToTop = () => {
      // Try smooth scrolling first
      try {
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      } catch (error) {
        // Fallback to instant scroll if smooth scrolling is not supported
        window.scrollTo(0, 0);
      }
    };

    // Add a small delay to ensure the page has loaded
    const timeoutId = setTimeout(scrollToTop, 100);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;
