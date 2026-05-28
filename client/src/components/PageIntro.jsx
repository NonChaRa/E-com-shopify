import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/Asteri2k.gif';
import './PageIntro.css';

const FloatingShape = ({ positionStyle, delay, width, height, rotate, colorFrom }) => (
  <motion.div
    initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
    animate={{ opacity: 1, y: 0, rotate }}
    transition={{
      duration: 2.4,
      delay,
      ease: [0.23, 0.86, 0.39, 0.96],
      opacity: { duration: 1.2 },
    }}
    className="page-intro-shape"
    style={positionStyle}
  >
    <motion.div
      animate={{ y: [0, 15, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width, height }}
    >
      <div
        className="shape-pill"
        style={{ background: `linear-gradient(to right, ${colorFrom}, transparent)` }}
      />
    </motion.div>
  </motion.div>
);

const SHAPES = [
  { delay: 0.1, width: 580, height: 130, rotate: 12, colorFrom: 'rgba(196,163,90,0.2)', positionStyle: { left: '-8%', top: '18%' } },
  { delay: 0.3, width: 440, height: 110, rotate: -14, colorFrom: 'rgba(196,163,90,0.14)', positionStyle: { right: '-4%', top: '62%' } },
  { delay: 0.2, width: 280, height: 72, rotate: -8, colorFrom: 'rgba(255,182,225,0.16)', positionStyle: { left: '8%', bottom: '12%' } },
  { delay: 0.4, width: 190, height: 52, rotate: 20, colorFrom: 'rgba(196,163,90,0.18)', positionStyle: { right: '18%', top: '12%' } },
  { delay: 0.5, width: 140, height: 38, rotate: -24, colorFrom: 'rgba(255,182,225,0.12)', positionStyle: { left: '24%', top: '8%' } },
];

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.5 + i * 0.18, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

const PageIntro = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hideTimer = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(hideTimer);
  }, []);

  const handleExitComplete = () => {
    onComplete?.();
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          className="page-intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, ease: [0.25, 0.4, 0.25, 1] }}
        >
          <div className="page-intro-ambient" />

          {SHAPES.map((s, i) => (
            <FloatingShape key={i} {...s} />
          ))}

          <div className="page-intro-content">
            <motion.img
              src={logo}
              alt="ASTÉRI 2K STUDIO"
              className="page-intro-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            />

            <motion.p
              className="page-intro-tagline"
              custom={0}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
            >
              Bangkok Studio
            </motion.p>

            <motion.div
              className="page-intro-progress"
              initial={{ scaleX: 0, opacity: 0.6 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 2.4, delay: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageIntro;
