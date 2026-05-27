import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplitFeature.css';
import leftImg from '../assets/Blue-Imperial-Collection/Royal.webp';
import rightImg from '../assets/Gadom-Collection/Gadom.webp';

const SplitFeature = memo(() => {
  const navigate = useNavigate();

  return (
    <section className="split-feature-section">
      <div className="feature-panel">
        <div className="feature-bg" style={{ backgroundImage: `url(${leftImg})` }} />
        <div className="feature-content">
          {/* Link to the specific handle */}
          <button className="feature-btn" onClick={() => navigate('/shop?collection=imperial-blue')}>
            Shop Collection
          </button>
        </div>
      </div>

      <div className="feature-panel">
        <div className="feature-bg" style={{ backgroundImage: `url(${rightImg})` }} />
        <div className="feature-content">
          {/* Link to the specific handle */}
          <button className="feature-btn" onClick={() => navigate('/shop?collection=gadom')}>
            Shop Collection
          </button>
        </div>
      </div>
    </section>
  );
});

export default SplitFeature;
