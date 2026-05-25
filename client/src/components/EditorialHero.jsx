import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EditorialHero.css';

const EditorialHero = () => {
  const navigate = useNavigate();

  return (
    <section className="footer-story">
        <div className="story-content">
          <h2>HANDMADE IN BANGKOK MADE TO LAST</h2>
          <p>LOCALLY PRODUCED NAIL ART CELEBRATING CREATIVITY THROUGH MODERN DESIGN.</p>
          <button className="story-btn" onClick={() => navigate('/about')}>OUR STORY</button>
        </div>
    </section>
  );
};

export default EditorialHero;