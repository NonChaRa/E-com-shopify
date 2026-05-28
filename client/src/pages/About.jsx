import React, { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import './About.css';
import nail1 from '../assets/about/nail-1.png';
import nail2 from '../assets/about/nail-2.png';
import nail3 from '../assets/about/nail-3.png';
import couple from '../assets/about/couple.png';

const About = () => {
  const pageRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Section 1 stagger entrance
    animate(['.about-s1-eyebrow', '.about-s1-title', '.about-s1-rule', '.about-s1-body'], {
      translateY: [28, 0],
      opacity: [0, 1],
      duration: 760,
      delay: stagger(120, { start: 80 }),
      easing: 'easeOutExpo',
    });

    // Scroll-triggered reveals for sections 2–4
    const targets = pageRef.current?.querySelectorAll('[data-reveal]') ?? [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = parseInt(el.dataset.revealDelay ?? '0', 10);
          const from = el.dataset.revealFrom ?? 'bottom';
          animate(el, {
            translateY: from === 'bottom' ? [28, 0] : [0, 0],
            translateX: from === 'left' ? [-32, 0] : from === 'right' ? [32, 0] : [0, 0],
            opacity: [0, 1],
            duration: 720,
            delay,
            easing: 'easeOutExpo',
          });
          observer.unobserve(el);
        });
      },
      { threshold: 0.12 }
    );
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page" ref={pageRef}>

      {/* ── SECTION 1 — THE GREY YEARS ── */}
      <section className="about-s1">
        <span className="about-ghost-num" aria-hidden="true">01</span>
        <div className="about-s1-inner">
          <span className="about-s1-eyebrow">THE ORIGIN STORY</span>
          <h1 className="about-s1-title">The Faded<br />Child</h1>
          <div className="about-s1-rule" aria-hidden="true" />
          <div className="about-s1-body">
            <p className="about-drop-cap">
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

      {/* Torn edge divider: dark → cream */}
      <div className="torn-edge torn-edge--dark-to-cream" aria-hidden="true" />

      {/* ── SECTION 2 — THE TURNING POINT ── */}
      <section className="about-s2">
        <span className="about-ghost-num about-ghost-num--cream" aria-hidden="true">02</span>
        <div className="about-s2-inner">
          <div className="about-s2-photo-wrap" data-reveal data-reveal-from="left">
            <div className="about-polaroid">
              <div className="about-tape about-tape--tl" aria-hidden="true" />
              <div className="about-tape about-tape--tr" aria-hidden="true" />
              <img src={couple} alt="Support and Love" />
              <span className="about-polaroid-caption">Bangkok · 2024</span>
            </div>
          </div>
          <div className="about-s2-text">
            <span className="about-section-label" data-reveal data-reveal-delay="60">02 / TURNING POINT</span>
            <h2 className="about-s2-title" data-reveal data-reveal-delay="150">The Anchor</h2>
            <p data-reveal data-reveal-delay="230">
              Everything changed when I met my partner. He didn't just support my
              dreams; he supported <em>me</em>. For the first time in my life, I was
              given the safety to stop running. He held the world at bay so I
              could finally learn how to take care of myself.
            </p>
            <p data-reveal data-reveal-delay="310">
              In that stillness, the grey began to lift. I found my hands reaching
              for brushes again. I found myself looking in the mirror and
              wanting to feel <em>pretty</em>—not for a meeting, but for my soul.
            </p>
          </div>
        </div>
      </section>

      {/* Torn edge divider: cream → dark */}
      <div className="torn-edge torn-edge--cream-to-dark" aria-hidden="true" />

      {/* ── SECTION 3 — RECLAIMING ── */}
      <section className="about-s3">
        <span className="about-ghost-num" aria-hidden="true">03</span>
        <div className="about-s3-header">
          <span className="about-section-label about-section-label--light" data-reveal>03 / RECLAIMING</span>
          <h2 className="about-s3-title" data-reveal data-reveal-delay="100">
            Reclaiming<br />The Astéri
          </h2>
          <p className="about-s3-subtitle" data-reveal data-reveal-delay="200">
            Beauty was always there, waiting for the situation to allow it to bloom.
          </p>
        </div>
        <div className="about-s3-grid">
          <div className="about-img-frame about-img-frame--1" data-reveal>
            <img src={nail1} alt="Nail art 1" />
          </div>
          <div className="about-img-frame about-img-frame--2" data-reveal data-reveal-delay="110">
            <img src={nail2} alt="Nail art 2" />
          </div>
          <div className="about-img-frame about-img-frame--3" data-reveal data-reveal-delay="220">
            <img src={nail3} alt="Nail art 3" />
            <span className="about-img-caption">Handpainted in Bangkok</span>
          </div>
        </div>
      </section>

      {/* Torn edge divider: dark → cream */}
      <div className="torn-edge torn-edge--dark-to-cream" aria-hidden="true" />

      {/* ── SECTION 4 — MISSION ── */}
      <section className="about-s4">
        <div className="about-s4-inner">
          <span className="about-section-label" data-reveal>04 / THE MISSION</span>
          <div className="about-s4-rule" data-reveal data-reveal-delay="80" aria-hidden="true" />
          <h2 className="about-s4-title" data-reveal data-reveal-delay="160">
            Our Shared<br />Creativity
          </h2>
          <p className="about-s4-quote" data-reveal data-reveal-delay="260">
            I regained my strength so I could share it with you. Astéri Studio
            is my way of inviting every woman to reclaim her own beauty.
            No matter how 'grey' the world gets, your fingertips can always be
            a canvas for your inner light.
          </p>
          <div className="about-s4-rule about-s4-rule--bottom" data-reveal data-reveal-delay="340" aria-hidden="true" />
        </div>
      </section>

    </div>
  );
};

export default About;
