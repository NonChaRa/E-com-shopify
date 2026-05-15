import React, { useEffect, useRef } from 'react';
import './VideoLoopSection.css';
import loop1 from '../assets/videos/loop-2.mp4';
import loop3 from '../assets/videos/loop-3.mp4';

const VideoLoopSection = () => {
  const videoRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.play().catch(() => {}); // Play when visible
          } else {
            entry.target.pause(); // Pause when off-screen
          }
        });
      },
      { threshold: 0.2 } // Triggers when 20% of the video is in view
    );

    // Observe each video element
    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, []);

  // Helper to add videos to the ref array
  const addToRefs = (el) => {
    if (el && !videoRefs.current.includes(el)) {
      videoRefs.current.push(el);
    }
  };

    return (
      <section className="video-loop-section">

        <div className="video-grid">
          {/* Left Video */}
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

          {/* Second Video (Previously Right) */}
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