import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaYoutube, FaTiktok } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setStatusMsg('');

    try {
      const response = await fetch('https://jhproyifnoxcxswkwgci.supabase.co/functions/v1/newsletter-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) throw new Error("Sync failure.");

      setStatusMsg('WELCOME TO THE ARCHIVE LIST. ✿');
      setEmail('');
    } catch (err) {
      console.error(err);
      setStatusMsg('Subscription failed. Please verify formatting.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="studio-site-footer">
      {/* --- NOTE: UPPER BRAND BANNER REMOVED FROM HERE TO PREVENT OVERRIDING YOUR HERO COMPONENT --- */}

      {/* Main Structural Column Links */}
      <section className="footer-main-grid-area">
        <div className="footer-layout-container">

          {/* Newsletter Segment */}
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
                disabled={submitting}
              />
              <button type="submit" className="footer-minimal-submit-btn" disabled={submitting}>
                {submitting ? 'PROCESSING...' : 'SUBSCRIBE'}
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

          {/* Brand Links Column */}
          <div className="footer-column-block links-block">
            <h3 className="column-editorial-title">THE BRAND</h3>
            <nav className="footer-nav-list">
              <Link to="/about" onClick={scrollToTop}>ABOUT</Link>
              <Link to="/values" onClick={scrollToTop}>VALUES</Link>
              <Link to="/contact" onClick={scrollToTop}>CONTACT</Link>
            </nav>
          </div>

          {/* Legal Links Column */}
          <div className="footer-column-block links-block">
            <h3 className="column-editorial-title">LEGAL</h3>
            <nav className="footer-nav-list">
              <Link to="/policy/shipping" onClick={scrollToTop}>SHIPPING POLICY</Link>
              <Link to="/policy/refund" onClick={scrollToTop}>REFUND POLICY</Link>
              <Link to="/policy/privacy" onClick={scrollToTop}>PRIVACY POLICY</Link>
            </nav>
          </div>

          {/* Automated Collection Links Column */}
          <div className="footer-column-block links-block">
            <h3 className="column-editorial-title">SHOP</h3>
            <nav className="footer-nav-list">
              <Link to="/shop" onClick={scrollToTop}>SHOP ALL</Link>
              <Link to="/shop?collection=gadom" onClick={scrollToTop}>GADOM</Link>
              <Link to="/shop?collection=imperial-blue" onClick={scrollToTop}>IMPERIAL BLUE</Link>
            </nav>
          </div>
        </div>

        {/* Footer Base Subtext Metadata */}
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