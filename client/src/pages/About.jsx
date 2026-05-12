import React, { useEffect } from 'react';
import './About.css';
import nail1 from '../assets/about/nail-1.png'; // Adjust extension if needed
import nail2 from '../assets/about/nail-2.png';
import nail3 from '../assets/about/nail-3.png';
import couple from '../assets/about/couple.png';

const About = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="about-page-wrapper">

      {/* PHASE 1: THE GREY YEARS */}
      <section className="story-section monochrome-bg">
        <div className="story-container-narrow">
          <h1 className="serif-title">The Faded Child</h1>
          <div className="narrative-text">
            <p className="drop-cap">
              Before Astéri was a studio, it was a survival mechanism.
              My childhood wasn't filled with the bright colors of play;
              it was painted in the grey shades of responsibility.
              Working from a young age to support my family, I learned
              that life was about duty, not beauty.
            </p>
            <p>
              I spent my youth chasing the corporate promise—persuading
              myself that money and title were the only measures of safety.
              But the higher I climbed, the more my inner child faded.
              The girl who loved the sparkle of a gemstone or the curve
              of a painted line was buried under spreadsheets and soul-draining
              deadlines. I was successful, but I was grey.
            </p>
          </div>
        </div>
      </section>

      {/* PHASE 2: THE ANCHOR (Support & Shift) */}
      <section className="editorial-feature bg-off-white">
        <div className="editorial-split-grid">
          <div className="split-image">
            <img src={couple} alt="Support and Love" />
          </div>
          <div className="split-content">
            <h2 className="caps-title">The Turning Point</h2>
            <p className="narrative-text-small">
              Everything changed when I met my partner. He didn't just support my
              dreams; he supported *me*. For the first time in my life, I was
              given the safety to stop running. He held the world at bay so I
              could finally learn how to take care of myself.
            </p>
            <p className="narrative-text-small">
              In that stillness, the grey began to lift. I found my hands reaching
              for brushes again. I found myself looking in the mirror and
              wanting to feel *pretty*—not for a meeting, but for my soul.
            </p>
          </div>
        </div>
      </section>

      {/* PHASE 3: THE RADIANCE (Creativity & Beauty) */}
      <section className="editorial-feature radiance-section">
          <div className="feature-header">
            {/* Changed class to editorial-title */}
            <h2 className="editorial-title">Reclaiming the Astéri</h2>
            <p className="editorial-subtitle">
              Beauty was always there, waiting for the situation to allow it to bloom.
            </p>
          </div>

          <div className="editorial-three-grid">
            <div className="grid-item"><img src={nail1} alt="Nail 1" /></div>
            <div className="grid-item"><img src={nail2} alt="Nail 2" /></div>
            <div className="grid-item"><img src={nail3} alt="Nail 3" /></div>
          </div>
      </section>

      {/* PHASE 4: THE MISSION */}
      <section className="mission-statement-section">
          <div className="mission-container">
            <h2 className="caps-title">Our Shared Creativity</h2>
            <p className="final-statement">
              I regained my strength so I could share it with you. Astéri Studio
              is my way of inviting every woman to reclaim her own beauty.
              No matter how 'grey' the world gets, your fingertips can always be
              a canvas for your inner light.
            </p>
          </div>
      </section>
    </div>
  );
};

export default About;