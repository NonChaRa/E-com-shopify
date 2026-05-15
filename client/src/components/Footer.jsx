import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';
import { FaInstagram, FaFacebookF, FaYoutube, FaTiktok } from 'react-icons/fa';

const Footer = () => {
  const navigate = useNavigate();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      {/* 2. DARK NAVIGATION SECTION */}
      <section className="footer-main">
        <div className="footer-container">
          <div className="footer-column newsletter">
            <p className="column-title">BE THE FIRST TO KNOW ABOUT NEW COLLECTIONS AND DROPS.</p>
            <div className="newsletter-input">
              <input type="email" placeholder="Email address" />
              <button>SUBSCRIBE</button>
            </div>
            <div className="social-links">
              <FaInstagram /> <FaFacebookF /> <FaYoutube /> <FaTiktok />
            </div>
          </div>

          <div className="footer-column">
              <p className="column-title">THE BRAND</p>
              <ul>
                <li onClick={() => navigate('/about')}>ABOUT</li>
                <li onClick={() => navigate('/values')}>VALUES</li>
                <li onClick={() => navigate('/contact')}>CONTACT</li>
              </ul>
          </div>

          <div className="footer-column">
              <p className="column-title">LEGAL</p>
              <ul>
                <li onClick={() => navigate('/shipping')}>SHIPPING POLICY</li>
                <li onClick={() => navigate('/refund')}>REFUND POLICY</li>
                <li onClick={() => navigate('/privacy')}>PRIVACY POLICY</li>
              </ul>
          </div>

          <div className="footer-column">
              <p className="column-title">SHOP</p>
              <ul>
                <li onClick={() => navigate('/shop')}>ENCHANTED GARDEN</li>
                <li onClick={() => navigate('/shop')}>POLE POLE</li>
                <li onClick={() => navigate('/shop')}>ACCESSORIES</li>
              </ul>
          </div>
        </div>

        <div className="scroll-top" onClick={scrollToTop}>
          <span className="arrow-up">⌃</span>
        </div>
      </section>
    </footer>
  );
};

export default Footer;