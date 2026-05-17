import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Values.css';

const Values = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, []);

  return (
    <div className="values-page-container">
      {/* Editorial Hero Header */}
      <header className="values-header">
        <span className="values-context-tag">THE MANIFESTO // 01</span>
        <h1>Our Values</h1>
        <p className="values-subtitle">
          Countering the culture of the disposable. We design for individuals who view beauty as a form of curation.
        </p>
      </header>

      {/* Core Value Pillars Grid */}
      <section className="values-pillars-grid">

        {/* Pillar 01 */}
        <div className="pillar-row">
          <div className="pillar-meta">
            <span className="pillar-number">01 /</span>
            <h2 className="pillar-title">Intentional Craftsmanship</h2>
          </div>
          <div className="pillar-description">
            <p>
              We reject the rush of the assembly line. Every set that leaves ASTÉRI Studio is painted completely by hand in our Bangkok studio. By committing to a made-to-order production cycle, we preserve the precision of true nail artistry, ensuring that no two sets are ever completely identical. Your nails are a personal canvas, not a factory byproduct.
            </p>
          </div>
        </div>

        {/* Pillar 02 */}
        <div className="pillar-row">
          <div className="pillar-meta">
            <span className="pillar-number">02 /</span>
            <h2 className="pillar-title">Reusable Longevity</h2>
          </div>
          <div className="pillar-description">
            <p>
              True luxury is designed to endure. We construct our press-on nail sets using premium-grade, multi-layered aprés bases to guarantee salon-strength density. Paired with careful application techniques, our pieces are engineered to be worn, safely stored, and endlessly reused—redefining non-committal beauty without sacrificing structural integrity.
            </p>
          </div>
        </div>

        {/* Pillar 03 - Redesigned for Solo Artistry */}
        <div className="pillar-row">
          <div className="pillar-meta">
            <span className="pillar-number">03 /</span>
            <h2 className="pillar-title">A Singular Vision</h2>
          </div>
          <div className="pillar-description">
            <p>
              ASTÉRI Studio operates on an intimate scale of one. From the initial collection concept and color palette selection to the final precise brushstroke and packaging layer, every single piece is executed by a single artist. This uncompromising, solitary dedication ensures a flawless standard of quality control and a direct, personal link between the creator and the wearer. No outsourcing, no shortcuts.
            </p>
          </div>
        </div>

      </section>

      {/* Lookbook Call to Action Section */}
      <section className="values-cta-section">
        <div className="values-cta-card">
          <h3>EXPLORE THE ARCHIVES</h3>
          <p>Discover our distinct design collections, built carefully by hand.</p>
          <button className="values-shop-btn" onClick={() => navigate('/shop')}>
            VIEW COLLECTIONS ➜
          </button>
        </div>
      </section>
    </div>
  );
};

export default Values;