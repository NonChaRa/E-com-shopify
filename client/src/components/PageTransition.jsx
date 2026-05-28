import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { createTimeline } from 'animejs';
import './PageTransition.css';

export default function PageTransition() {
  const curtainRef = useRef(null);
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const el = curtainRef.current;
    if (!el) return;

    // Snap back to off-screen left before animating in
    el.style.transform = 'translateX(-101%)';

    createTimeline({ defaults: { easing: 'easeInOutQuart' } })
      .add(el, { translateX: ['-101%', '0%'], duration: 380 })
      .add(el, { translateX: ['0%', '101%'], duration: 380 }, '+=70');
  }, [location.pathname]);

  return (
    <div ref={curtainRef} className="page-curtain" aria-hidden="true">
      <div className="page-curtain-content">
        <span className="page-curtain-brand">ASTÉRI</span>
        <span className="page-curtain-sub">2K STUDIO</span>
      </div>
    </div>
  );
}
