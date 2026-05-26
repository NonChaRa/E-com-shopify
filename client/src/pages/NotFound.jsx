import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="nf-wrapper">

      {/* Decorative gold rule at top */}
      <div className="nf-gold-rule" />

      <div className="nf-inner">

        {/* Eyebrow */}
        <span className="nf-eyebrow">ERROR · 404 · PAGE NOT FOUND</span>

        {/* Giant number */}
        <p className="nf-code" aria-hidden="true">404</p>

        {/* Headline */}
        <h1 className="nf-headline">
          LOST IN<br />THE ARCHIVE
        </h1>

        {/* Body copy */}
        <p className="nf-body">
          This page doesn&apos;t exist — or it&apos;s been moved to the vault.
          <br />
          Head back to the studio and keep exploring.
        </p>

        {/* CTA */}
        <button
          className="nf-btn"
          onClick={() => navigate('/')}
        >
          RETURN TO STUDIO ➜
        </button>

        {/* Decorative sparkle glyphs */}
        <div className="nf-deco" aria-hidden="true">
          <span>✦</span>
          <span>✦</span>
          <span>✦</span>
        </div>

      </div>

      {/* Bottom rule */}
      <div className="nf-gold-rule nf-gold-rule--bottom" />
    </div>
  );
};

export default NotFound;
