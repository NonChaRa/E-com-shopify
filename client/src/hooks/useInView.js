import { useEffect, useRef, useState } from 'react';

/**
 * useInView
 * Fires when the target element enters the viewport using IntersectionObserver.
 * By default, unobserves after the first intersection (triggerOnce: true).
 *
 * @param {Object}  options
 * @param {number}  options.threshold   - 0–1 fraction visible to trigger (default 0.12)
 * @param {string}  options.rootMargin  - CSS margin string (default '0px')
 * @param {boolean} options.triggerOnce - stop observing after first trigger (default true)
 *
 * @returns {[React.RefObject<HTMLElement>, boolean]}
 *   [ref, inView] — attach ref to the element you want to watch.
 *
 * @example
 *   const [ref, inView] = useInView();
 *   <section ref={ref} className={`reveal ${inView ? 'is-visible' : ''}`}>
 */
const useInView = ({
  threshold   = 0.12,
  rootMargin  = '0px',
  triggerOnce = true,
} = {}) => {
  const ref    = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      // Fallback for environments without IntersectionObserver (SSR, very old browsers)
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) observer.unobserve(el);
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, inView];
};

export default useInView;
