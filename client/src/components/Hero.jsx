import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import bgHeroVideo         from '../assets/Bg-hero.webm';
import bgHeroPoster        from '../assets/Bg-hero.png';
import bgHeroMobileVideo   from '../assets/Bg-hero-mobile.webm';
import bgHeroMobilePoster  from '../assets/Bg-hero-mobile.avif';

import './Hero.css';

const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

const Hero = () => {
  const navigate  = useNavigate();
  const videoRef  = useRef(null);
  const [mobile, setMobile] = useState(isMobile);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Swap src when breakpoint changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
  }, [mobile]);

  const src    = mobile ? bgHeroMobileVideo  : bgHeroVideo;
  const poster = mobile ? bgHeroMobilePoster : bgHeroPoster;

  return (
    <section className="hero-editorial">
      <video
        ref={videoRef}
        key={src}
        className="hero-bg-img"
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      <div className="hero-content-wrapper">
        <div className="hero-actions">
          <button className="hero-cta-box" onClick={() => navigate('/shop')}>
            START SHOWING OFF
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
