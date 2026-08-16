import { useEffect } from 'react';

/**
 * Custom hook to trigger silky-smooth rise-in on-scroll animations
 * observing all elements with .scroll-reveal or .scroll-reveal-scale classes.
 */
export function useScrollReveal(dependencies = []) {
  useEffect(() => {
    const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.12,
    });

    const elements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-scale');
    elements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, dependencies);
}
