import React from 'react';
import './Hero.css';

const Hero = () => (
  <section className="hero-editorial">
    {/* The background image is handled in CSS */}
    <div className="hero-content-wrapper">
      <h1 className="hero-main-title">Dream on your <br/> Fingertips.</h1>
      <p className="hero-sub-text">
        Nail art is more than just color—it’s about the stories you tell.
        Reunite with your <strong>inner child</strong> and let your imagination
        lead the way. It's time to flaunt your magic.
      </p>
      <div className="hero-actions">
        <button className="hero-cta-box">START SHOWING OFF</button>
      </div>
    </div>
  </section>
);

export default Hero;