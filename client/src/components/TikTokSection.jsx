import React from 'react';
import './TikTokSection.css';

const TikTokSection = ({ videoId = "7631174893756894482" }) => {
  return (
    <section className="tiktok-showcase-section">
      <div className="tiktok-container">
        <div className="tiktok-text-content">
          <h2 className="tiktok-title">See It In Action</h2>
          <p className="tiktok-subtitle">Watch the manual process behind the @etoilenail vintage collection.</p>
          <a
            href={`https://www.tiktok.com/@etoilenail/video/${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tiktok-link"
          >
            FOLLOW ON TIKTOK
          </a>
        </div>

        <div className="tiktok-video-wrapper">
          <iframe
            src={`https://www.tiktok.com/embed/v2/${videoId}`}
            className="tiktok-embed-frame"
            allowFullScreen
            scrolling="no"
            allow="encrypted-media; pyrometer; autoplay; clipboard-write; gyroscope; picture-in-picture"
            title="TikTok Video Showcase"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default TikTokSection;