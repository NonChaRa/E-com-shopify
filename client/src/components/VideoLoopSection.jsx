import React, { useEffect, useRef } from 'react';
import './VideoLoopSection.css';
// Import assets correctly for the build tool
import loop1 from '../assets/videos/loop-1.mp4';
import loop3 from '../assets/videos/loop-3.mp4';

const VideoLoopSection = () => {
  const videoRefs = useRef([]);

  useEffect(() => {
    // Create an observer to play/pause videos only when visible
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
      <div className="section-header">
        <h2 className="section-title">THE ART IN MOTION</h2>
        <p className="section-subtitle">A closer look at the manual craft behind every set.</p>
      </div>

      <div className="video-grid">
        {/* Left Video */}
        <div className="video-card video-left">
          <video
            ref={addToRefs}
            className="loop-video"
            src={loop1}
            muted
            loop
            playsInline
            preload="metadata" // Only loads enough to show the first frame
          />
        </div>

        {/* Middle Spacer - Holds the SVG background */}
        <div className="video-spacer"></div>

        {/* Right Video */}
        <div className="video-card video-right">
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