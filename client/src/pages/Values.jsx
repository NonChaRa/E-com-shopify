import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import './Values.css';

const PILLARS = [
  {
    num: '01',
    title: 'Intentional Craftsmanship',
    body: 'We reject the rush of the assembly line. Every set that leaves ASTÉRI Studio is painted completely by hand in our Bangkok studio. By committing to a made-to-order production cycle, we preserve the precision of true nail artistry, ensuring that no two sets are ever completely identical. Your nails are a personal canvas, not a factory byproduct.',
  },
  {
    num: '02',
    title: 'Reusable Longevity',
    body: 'True luxury is designed to endure. We construct our press-on nail sets using premium-grade, multi-layered aprés bases to guarantee salon-strength density. Paired with careful application techniques, our pieces are engineered to be worn, safely stored, and endlessly reused—redefining non-committal beauty without sacrificing structural integrity.',
  },
  {
    num: '03',
    title: 'A Singular Vision',
    body: 'ASTÉRI Studio operates on an intimate scale of one. From the initial collection concept and color palette selection to the final precise brushstroke and packaging layer, every single piece is executed by a single artist. This uncompromising, solitary dedication ensures a flawless standard of quality control and a direct, personal link between the creator and the wearer. No outsourcing, no shortcuts.',
  },
];

const Values = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Header entrance
    animate(['.values-tag', '.values-h1', '.values-divider-line', '.values-subtitle-text'], {
      translateY: [24, 0],
      opacity: [0, 1],
      duration: 720,
      delay: stagger(110, { start: 60 }),
      easing: 'easeOutExpo',
    });

    // CTA section
    const ctaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animate(['.values-cta-eyebrow', '.values-cta-h3', '.values-cta-p', '.values-cta-btn'], {
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 660,
            delay: stagger(90),
            easing: 'easeOutExpo',
          });
          ctaObserver.disconnect();
        });
      },
      { threshold: 0.2 }
    );
    const cta = document.querySelector('.values-cta-inner');
    if (cta) ctaObserver.observe(cta);

    // Pillar row scroll reveals
    const rows = document.querySelectorAll('.pillar-row');

    const pillarsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const row = entry.target;
          const numLabel = row.querySelector('.pillar-num');
          const title = row.querySelector('.pillar-title');
          const body = row.querySelector('.pillar-body');
          const ghost = row.querySelector('.pillar-ghost');

          if (ghost) animate(ghost, { opacity: [0, 0.055], translateX: [16, 0], duration: 900, easing: 'easeOutExpo' });
          if (numLabel) animate(numLabel, { translateX: [-16, 0], opacity: [0, 1], duration: 600, delay: 60, easing: 'easeOutExpo' });
          if (title) animate(title, { translateY: [18, 0], opacity: [0, 1], duration: 650, delay: 140, easing: 'easeOutExpo' });
          if (body) animate(body, { translateY: [14, 0], opacity: [0, 1], duration: 620, delay: 240, easing: 'easeOutExpo' });
          pillarsObserver.unobserve(row);
        });
      },
      { threshold: 0.15 }
    );
    rows.forEach((row) => pillarsObserver.observe(row));

    return () => {
      ctaObserver.disconnect();
      pillarsObserver.disconnect();
    };
  }, []);

  return (
    <div className="values-page">

      {/* ── HEADER ── */}
      <header className="values-header">
        <span className="values-tag">THE MANIFESTO // 01</span>
        <h1 className="values-h1">Our Values</h1>
        <div className="values-divider-line" aria-hidden="true" />
        <p className="values-subtitle-text">
          Countering the culture of the disposable. We design for individuals who view beauty as a form of curation.
        </p>
      </header>

      {/* ── PILLARS ── */}
      <section className="values-pillars">
        {PILLARS.map((pillar) => (
          <div className="pillar-row" key={pillar.num}>
            <span className="pillar-ghost" aria-hidden="true">{pillar.num}</span>
            <div className="pillar-meta">
              <span className="pillar-num">{pillar.num} /</span>
              <h2 className="pillar-title">{pillar.title}</h2>
            </div>
            <p className="pillar-body">{pillar.body}</p>
          </div>
        ))}
      </section>

      {/* ── CTA ── */}
      <section className="values-cta">
        <div className="values-cta-inner">
          <span className="values-cta-eyebrow">EXPLORE THE STUDIO</span>
          <div className="values-cta-rule" aria-hidden="true" />
          <h3 className="values-cta-h3">EXPLORE THE ARCHIVES</h3>
          <p className="values-cta-p">Discover our distinct design collections, built carefully by hand.</p>
          <button className="values-cta-btn" onClick={() => navigate('/shop')}>
            VIEW COLLECTIONS ➜
          </button>
        </div>
      </section>

    </div>
  );
};

export default Values;
