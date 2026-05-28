import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './loyalty.css';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.35 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: [0.25, 0.4, 0.25, 1], delay: 0.05 },
  },
  exit: {
    opacity: 0, y: 20, scale: 0.97,
    transition: { duration: 0.35, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const contentVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } },
};

const itemVariants = {
  hidden:   { opacity: 0, y: 14 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.4, 0.25, 1] } },
};

export default function LoyaltyPopup({ onOpenAuth }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('asteri_loyalty_dismissed');
    if (isDismissed) return;
    const timer = setTimeout(() => setIsOpen(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => {
    setIsOpen(false);
    localStorage.setItem('asteri_loyalty_dismissed', 'true');
  };

  const handleAuthAction = (modalType) => {
    closePopup();
    onOpenAuth?.(modalType);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="loyalty-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closePopup}
          />

          <div className="loyalty-positioner">
            <motion.div
              className="loyalty-card"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button className="loyalty-close" onClick={closePopup} aria-label="Close">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              {/* LEFT: Image */}
              <div className="loyalty-image-side" aria-hidden="true" />

              {/* RIGHT: Content */}
              <motion.div
                className="loyalty-content-side"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.span className="loyalty-eyebrow" variants={itemVariants}>
                  Members Only
                </motion.span>

                <motion.h2 className="loyalty-title" variants={itemVariants}>
                  THE ASTÉRI<br/>STUDIO CLUB
                </motion.h2>

                <motion.p className="loyalty-offer" variants={itemVariants}>
                  <strong>15% off</strong> your first order over ฿1,000
                </motion.p>

                <motion.p className="loyalty-desc" variants={itemVariants}>
                  Join to unlock exclusive discounts, early access to new collections, and studio drops.
                </motion.p>

                <motion.div className="loyalty-actions" variants={itemVariants}>
                  <button className="loyalty-btn-primary" onClick={() => handleAuthAction('register')}>
                    Join Now
                  </button>
                  <button className="loyalty-btn-secondary" onClick={() => handleAuthAction('login')}>
                    Sign In
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
