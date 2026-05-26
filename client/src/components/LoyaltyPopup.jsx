import React, { useState, useEffect } from 'react';
import './loyalty.css';

export default function LoyaltyPopup({onOpenAuth}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('asteri_loyalty_dismissed');
    if (isDismissed) return;

    // Show after 10 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => {
    setIsOpen(false);
    localStorage.setItem('asteri_loyalty_dismissed', 'true');
  };
  const handleAuthAction = (modalType) => {
    closePopup();
    if (onOpenAuth) {
      onOpenAuth(modalType);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="loyalty-overlay popup-fade-in" onClick={closePopup}>
      <div className="cult-popup-card" onClick={(e) => e.stopPropagation()}>

        {/* Close button */}
        <button className="cult-popup-close" onClick={closePopup} aria-label="Close popup">
          ✕
        </button>

        <span className="cult-charm cult-charm--heart"  aria-hidden="true" />
        <span className="cult-charm cult-charm--star"   aria-hidden="true" />
        <span className="cult-charm cult-charm--sparkle cult-charm--sm" aria-hidden="true" />
        <span className="cult-charm cult-charm--bow"    aria-hidden="true" />

        {/* LEFT: image panel */}
        <div className="cult-popup-image-side">
        </div>

        {/* RIGHT: content panel */}
        <div className="cult-popup-content-side">

          <span className="cult-popup-eyebrow">exclusive members only</span>

          <h2 className="cult-popup-title">THE ASTERI2K<br/>BLESSING</h2>

          <p className="cult-popup-incentive">
            ENJOY <strong>฿200 OFF</strong> YOUR FIRST ORDER OVER ฿2,000.
          </p>

          <p className="cult-popup-perks">
            EARN DISCOUNT CODE FOR YOUR SHOP.
          </p>


          <div className="cult-popup-actions">
              <button className="buy-button cult-btn-override" onClick={() => handleAuthAction('register')}>
                JOIN NOW ➜
              </button>
              <button className="cult-btn-secondary" onClick={() => handleAuthAction('login')}>
                SIGN IN
              </button>
          </div>
        </div>

      </div>
    </div>
  );
}