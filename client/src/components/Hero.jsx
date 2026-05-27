import React from 'react';
import { useNavigate } from 'react-router-dom';
import bgHeroUrl from '../assets/Bg-hero.png';
import bgHeroMobileUrl from '../assets/Bg-hero-mobile.png';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-editorial">
      <picture>
        <source media="(max-width: 768px)" srcSet={bgHeroMobileUrl} />
        <img
          src={bgHeroUrl}
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
