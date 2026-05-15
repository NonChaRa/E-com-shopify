import React from 'react';
import './EditorialHero.css';

const EditorialHero = () => {
  return (
    <section className="footer-story">
        <div className="story-content">
          <h2>HANDMADE IN BANGKOK. MADE TO LAST.</h2>
          <p>LOCALLY PRODUCED NAIL ART CELEBRATING CREATIVITY THROUGH MODERN DESIGN.</p>
          <button className="story-btn" onClick={() => navigate('/about')}>OUR STORY</button>
        </div>
    </section>
  );
};

export default EditorialHero;