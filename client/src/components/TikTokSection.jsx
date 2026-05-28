import React, { useEffect } from 'react';
import { animate, stagger } from 'animejs';
import './TikTokSection.css';

const TikTokSection = ({ videoId = "7631174893756894482" }) => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const el = document.querySelector('.tiktok-showcase-section');
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        animate([
          '.tiktok-eyebrow',
          '.tiktok-title',
          '.tiktok-rule',
          '.tiktok-subtitle',
          '.tiktok-link',
        ], {
          translateY: [20, 0],
          opacity: [0, 1],
          duration: 660,
          delay: stagger(90, { start: 40 }),
          easing: 'easeOutExpo',
        });
        animate('.tiktok-video-wrapper', {
          translateX: [24, 0],
          opacity: [0, 1],
          duration: 720,
          delay: 160,
          easing: 'easeOutExpo',
        });
        observer.disconnect();
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="tiktok-showcase-section">
      <div className="tiktok-container">

        {/* TEXT SIDE */}
        <div className="tiktok-text-content">
          <span className="tiktok-eyebrow">BEHIND THE CRAFT</span>
          <h2 className="tiktok-title">Watch the<br />Process</h2>
          <div className="tiktok-rule" aria-hidden="true" />
          <p className="tiktok-subtitle">
            Follow the manual process behind the @_etoilesartnail_ vintage collection — every brushstroke, every detail, handpainted from our Bangkok studio.
          </p>
          <a
            href={`https://www.tiktok.com/@_etoilesartnail_/video/${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tiktok-link"
          >
            Follow on TikTok ➜
          </a>
        </div>

        {/* VIDEO */}
        <div className="tiktok-video-wrapper">
          <div className="tiktok-tape tiktok-tape--tl" aria-hidden="true" />
          <iframe
            src={`https://www.tiktok.com/embed/v2/${videoId}`}
            className="tiktok-embed-frame"
            allowFullScreen
            scrolling="no"
            allow="encrypted-media; autoplay; clipboard-write; gyroscope; picture-in-picture"
            title="ASTÉRI 2K Studio — Process Video"
          />
        </div>

      </div>
    </section>
  );
};

export default TikTokSection;
