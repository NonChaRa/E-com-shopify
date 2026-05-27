import React, { useEffect, useRef } from 'react';
import './VideoLoopSection.css';
import loop1 from '../assets/videos/loop-2.webm';
import loop3 from '../assets/videos/loop-3.webm';

const VideoLoopSection = () => {
  const videoRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.play().catch(() => {});
          } else {
            entry.target.pause();
          }
        });
      },
      { threshold: 0.15 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el) => {
    if (el && !videoRefs.current.includes(el)) {
      videoRefs.current.push(el);
    }
  };

  return (
    <section className="video-loop-section">
      <div className="video-grid">

        {/* Left Loop Frame */}
        <div className="video-card">
          <video
            ref={addToRefs}
            className="loop-video"
            src={loop1}
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>

        {/* Right Loop Frame */}
        <div className="video-card">
          <video
            ref={addToRefs}
            className="loop-video"
            src={loop3}
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>

      </div>
    </section>
  );
};

export default VideoLoopSection;