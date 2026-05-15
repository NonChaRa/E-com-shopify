import React from 'react';
import './Hero.css';

const Hero = () => (
  <section className="hero-editorial">
    {/* The background image is handled in CSS */}
    <div className="hero-content-wrapper">
      <div className="hero-actions">
        <button className="hero-cta-box">START SHOWING OFF</button>
      </div>
    </div>
  </section>
);

export default Hero;