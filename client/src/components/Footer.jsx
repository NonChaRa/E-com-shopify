import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaYoutube, FaTiktok } from 'react-icons/fa';
import useRateLimit from '../hooks/useRateLimit';
import { createLogger } from '../utils/logger';
import './Footer.css';

const log = createLogger('Footer');

const NEWSLETTER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/newsletter-subscribe`;

const Footer = () => {
  const [email, setEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { canSubmit, recordSubmission, secondsLeft } = useRateLimit('newsletter', 30);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !canSubmit) return;
    setSubmitting(true);
    setStatusMsg('');

    try {
      const response = await fetch(NEWSLETTER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Sync failure.');

      recordSubmission();
      setStatusMsg('WELCOME TO THE ARCHIVE LIST. ✿');
      setEmail('');
    } catch (err) {
      log.error('Newsletter subscribe failed', { error: err, action: 'handleSubscribe' });
      setStatusMsg('Subscription failed. Please verify formatting.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="studio-site-footer">
      <section className="footer-main-grid-area">
        <div className="footer-layout-container">

          <div className="footer-column-block newsletter-block">
            <h3 className="column-editorial-title">BE THE FIRST TO KNOW ABOUT NEW COLLECTIONS AND DROPS.</h3>
            <form onSubmit={handleSubscribe} className="footer-minimal-form">
              <input
                type="email"
                placeholder="ENTER YOUR EMAIL..."
                className="footer-minimal-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting || !canSubmit}
              />
              <button type="submit" className="footer-minimal-submit-btn" disabled={submitting || !canSubmit}>
                {submitting ? 'PROCESSING...' : !canSubmit ? `WAIT ${secondsLeft}s` : 'SUBSCRIBE'}
              </button>
            </form>
            {statusMsg && <p className="footer-status-alert-msg">{statusMsg}</p>}

            <div className="studio-social-row">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><FaYoutube /></a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok"><FaTiktok /></a>
            </div>
          </div>

          <div className="footer-column-block links-block">
            <h3 className="column-editorial-title">THE BRAND</h3>
            <nav className="footer-nav-list">
              <Link to="/about" onClick={scrollToTop}>ABOUT</Link>
              <Link to="/values" onClick={scrollToTop}>VALUES</Link>
              <Link to="/contact" onClick={scrollToTop}>CONTACT</Link>
            </nav>
          </div>

          <div className="footer-column-block links-block">
            <h3 className="column-editorial-title">LEGAL</h3>
            <nav className="footer-nav-list">
              <Link to="/policy/shipping" onClick={scrollToTop}>SHIPPING POLICY</Link>
              <Link to="/policy/refund" onClick={scrollToTop}>REFUND POLICY</Link>
              <Link to="/policy/privacy" onClick={scrollToTop}>PRIVACY POLICY</Link>
            </nav>
          </div>

          <div className="footer-column-block links-block">
            <h3 className="column-editorial-title">SHOP</h3>
            <nav className="footer-nav-list">
              <Link to="/shop" onClick={scrollToTop}>SHOP ALL</Link>
              <Link to="/shop?collection=gadom" onClick={scrollToTop}>GADOM</Link>
              <Link to="/shop?collection=imperial-blue" onClick={scrollToTop}>IMPERIAL BLUE</Link>
            </nav>
          </div>
        </div>

        <div className="footer-bottom-bar-metadata">
          <p className="copyright-label">© 2026 ASTÉRI STUDIO. ALL RIGHTS RESERVED.</p>
          <div className="scroll-top-trigger" onClick={scrollToTop}>
            BACK TO TOP <span className="arrow-glyph">↑</span>
          </div>
        </div>
      </section>
    </footer>
  );
};

export default Footer;
