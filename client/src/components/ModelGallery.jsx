import React from 'react';
import { useNavigate } from 'react-router-dom';
import useInView from '../hooks/useInView';
import './ModelGallery.css';

import kneeling from '../assets/Model/Model-Knelling.avif';
import closeUp1  from '../assets/Model/Model-Close-Up.avif';
import closeUp2  from '../assets/Model/Model-Close-Up-2.avif';
import hand      from '../assets/Model/Model-Hand.avif';

const ModelGallery = () => {
  const navigate = useNavigate();
  const [sectionRef, sectionInView] = useInView({ threshold: 0.08 });

  return (
    <section
      ref={sectionRef}
      className={`model-gallery-section ${sectionInView ? 'is-visible' : ''}`}
    >
      <div className="model-gallery-header">
        <span className="model-eyebrow">— AS WORN</span>
        <h2 className="model-title">STUDIO SHOTS</h2>
      </div>

      <div className="model-gallery-grid">

        {/* Large feature — kneeling full-body */}
        <div className="model-feature">
          <img src={kneeling} alt="Model wearing ASTÉRI press-on nails" loading="lazy" />
        </div>

        {/* Three stacked detail shots */}
        <div className="model-stack">
          <div className="model-stack-item">
            <img src={closeUp1} alt="Close-up nail detail" loading="lazy" />
          </div>
          <div className="model-stack-item">
            <img src={closeUp2} alt="Close-up nail detail" loading="lazy" />
          </div>
          <div className="model-stack-item">
            <img src={hand} alt="Hand wearing ASTÉRI nails" loading="lazy" />
          </div>
        </div>
      </div>

      <div className="model-gallery-cta">
        <button className="model-shop-btn" onClick={() => navigate('/shop')}>
          Shop The Look
        </button>
      </div>
    </section>
  );
};

export default ModelGallery;
