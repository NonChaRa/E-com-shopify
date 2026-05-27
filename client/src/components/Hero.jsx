import React from 'react';
import { useNavigate } from 'react-router-dom';

import bgHeroWebp        from '../assets/Bg-hero.png?format=webp&quality=80&w=1920';
import bgHeroMobileWebp  from '../assets/Bg-hero-mobile.png?format=webp&quality=75&w=828';
import bgHeroFallback    from '../assets/Bg-hero.png';
import bgHeroMobileFallback from '../assets/Bg-hero-mobile.png';

import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-editorial">
      {/*
        LCP FIX: Real <img> (not CSS ::before) so the preload scanner finds it.
        <picture> serves WebP to modern browsers, PNG as a universal fallback.
        fetchpriority="high" ensures it's fetched before lower-priority resources.
      */}
      <picture>
        <source media="(max-width: 768px)" type="image/webp" srcSet={bgHeroMobileWebp} />
        <source media="(max-width: 768px)"                   srcSet={bgHeroMobileFallback} />
        <source                             type="image/webp" srcSet={bgHeroWebp} />
        <img
          src={bgHeroFallback}
          alt=""
          className="hero-bg-img"
          fetchpriority="high"
          loading="eager"
          decoding="async"
          aria-hidden="true"
        />
      </picture>

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
