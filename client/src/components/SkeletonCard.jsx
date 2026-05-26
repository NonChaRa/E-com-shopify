import React from 'react';
import './SkeletonCard.css';

// ---------------------------------------------------------------------------
// Skeleton: Home editorial grid card
// Mirrors .editorial-card shape (border, radius, stagger offset on even items)
// ---------------------------------------------------------------------------
export const SkeletonEditorialCard = ({ index = 0 }) => (
  <div className={`sk-editorial-card ${index % 2 === 1 ? 'sk-stagger' : ''}`}>
    <div className="sk-img sk-shimmer" />
    <div className="sk-info">
      <div className="sk-line sk-line--title sk-shimmer" />
      <div className="sk-line sk-line--price sk-shimmer" />
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Skeleton: AllProducts shop grid card
// Mirrors .pdp-card shape (simple square image + two text lines)
// ---------------------------------------------------------------------------
export const SkeletonShopCard = () => (
  <div className="sk-shop-card">
    <div className="sk-img sk-shimmer" />
    <div className="sk-info">
      <div className="sk-line sk-line--title sk-shimmer" />
      <div className="sk-line sk-line--price sk-shimmer" />
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Skeleton: Product detail page (full two-column layout)
// Mirrors .pdp-main-layout grid
// ---------------------------------------------------------------------------
export const SkeletonProductPage = () => (
  <div className="sk-pdp">
    {/* Left: gallery */}
    <div className="sk-pdp-gallery-col">
      <div className="sk-pdp-main-img sk-shimmer" />
      <div className="sk-pdp-thumbs">
        {[0, 1, 2].map(i => (
          <div key={i} className="sk-pdp-thumb sk-shimmer" />
        ))}
      </div>
    </div>

    {/* Right: sidebar */}
    <div className="sk-pdp-sidebar">
      <div className="sk-line sk-line--eyebrow sk-shimmer" />
      <div className="sk-line sk-line--heading sk-shimmer" />
      <div className="sk-line sk-line--price sk-shimmer" />
      <div className="sk-line sk-line--md sk-shimmer" />
      <div className="sk-line sk-line--md sk-shimmer" />
      <div className="sk-line sk-line--sm sk-shimmer" />
      <div className="sk-line sk-line--btn sk-shimmer" />
    </div>
  </div>
);
