import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-editorial">
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