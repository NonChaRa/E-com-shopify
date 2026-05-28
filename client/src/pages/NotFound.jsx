import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { animate, stagger, createTimeline } from 'animejs';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    createTimeline({ defaults: { easing: 'easeOutExpo' } })
      .add('.nf-code',     { scale: [1.12, 1],  opacity: [0, 1], duration: 900 }, 0)
      .add('.nf-eyebrow',  { translateY: [14, 0], opacity: [0, 1], duration: 600 }, 120)
      .add('.nf-headline', { translateY: [28, 0], opacity: [0, 1], duration: 720 }, 220)
      .add('.nf-body',     { translateY: [16, 0], opacity: [0, 1], duration: 600 }, 360)
      .add('.nf-btn',      { translateY: [12, 0], opacity: [0, 1], duration: 560 }, 480)
      .add('.nf-deco span', {
        scale:   [0, 1],
        opacity: [0, 1],
        duration: 400,
        delay:   stagger(80),
      }, 600);
  }, []);

  return (
    <div className="nf-wrapper">
      <div className="nf-gold-rule" />

      <div className="nf-inner">
        <span className="nf-eyebrow">ERROR · 404 · PAGE NOT FOUND</span>
        <p className="nf-code" aria-hidden="true">404</p>
        <h1 className="nf-headline">
          LOST IN<br />THE ARCHIVE
        </h1>
        <p className="nf-body">
          This page doesn&apos;t exist — or it&apos;s been moved to the vault.
          <br />
          Head back to the studio and keep exploring.
        </p>
        <button className="nf-btn" onClick={() => navigate('/')}>
          RETURN TO STUDIO ➜
        </button>
        <div className="nf-deco" aria-hidden="true">
          <span>✦</span>
          <span>✦</span>
          <span>✦</span>
        </div>
      </div>

      <div className="nf-gold-rule nf-gold-rule--bottom" />
    </div>
  );
};

export default NotFound;
