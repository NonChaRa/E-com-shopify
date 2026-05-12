import React, { memo } from 'react';
import './SplitFeature.css';
import leftImg from '../assets/Blue-Imperial-Collection/Royal.png';
import rightImg from '../assets/Gadom-Collection/Gadom.png';

// memo prevents unnecessary re-renders
const SplitFeature = memo(() => {
  return (
    <section className="split-feature-section">
      <div className="feature-panel">
        <div
          className="feature-bg"
          style={{ backgroundImage: `url(${leftImg})` }}
        />
        <div className="feature-content">
          <button className="feature-btn">Shop</button>
        </div>
      </div>

      <div className="feature-panel">
        <div
          className="feature-bg"
          style={{ backgroundImage: `url(${rightImg})` }}
        />
        <div className="feature-content">
          <button className="feature-btn">Shop</button>
        </div>
      </div>
    </section>
  );
});

export default SplitFeature;