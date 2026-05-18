import React, { useState, useEffect } from 'react';
import './Navbar.css';
import logo from '../assets/Asteri2k.gif';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ cartCount, onOpenCart, user, onOpenLogin, onLogout, forceSolid }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setIsScrolled(currentScrollPos > 20);

      // Desktop Only: Hide/Show navbar on scroll direction maps
      if (window.innerWidth > 1024) {
        const scrollingUp = prevScrollPos > currentScrollPos;
        setIsVisible(scrollingUp || currentScrollPos < 10);
      } else {
        // Mobile Only: Always keep visible all the time
        setIsVisible(true);
      }
      setPrevScrollPos(currentScrollPos);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  const handleMobileNav = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Dimmed Background Overlay */}
      <div
        className={`mega-menu-blur ${openMenu || mobileMenuOpen ? 'active' : ''}`}
        onClick={() => { setOpenMenu(null); setMobileMenuOpen(false); }}
      />

      <nav className={`navbar-editorial
        ${isVisible ? 'nav-visible' : 'nav-hidden'}
        ${(isScrolled || forceSolid || openMenu || mobileMenuOpen) ? 'scrolled' : ''}
        ${openMenu ? 'mega-expanded' : ''}
        ${mobileMenuOpen ? 'mobile-expanded' : ''}`}
      >
        <div className="nav-top-row">

          {/* --- LEFT NAVIGATION BLOCK --- */}
          <div className="nav-group left">
            {/* Desktop Link Channels */}
            <div className="nav-item-wrapper desktop-only" onClick={() => navigate('/')}>
              <span className="nav-link">Home</span>
            </div>
            <div className="nav-item-wrapper desktop-only" onMouseEnter={() => setOpenMenu('shop')}>
              <span className="nav-link">SHOP</span>
              <span className={`nav-arrow ${openMenu === 'shop' ? 'open' : ''}`}>▾</span>
            </div>
            <div className="nav-item-wrapper desktop-only" onMouseEnter={() => setOpenMenu('tutorials')}>
              <span className="nav-link">TUTORIALS</span>
              <span className={`nav-arrow ${openMenu === 'tutorials' ? 'open' : ''}`}>▾</span>
            </div>

            {/* Mobile Only: Hamburger Toggle Icon */}
            <button
              className={`mobile-action-icon mobile-only hamburger-btn ${mobileMenuOpen ? 'is-active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>

            {/* Mobile Only: Search Icon */}
            <button className="mobile-action-icon mobile-only" onClick={() => navigate('/shop')} aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </div>

          {/* --- CENTER LOGO BLOCK --- */}
          <div className="nav-logo-centered" onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>
            <img src={logo} alt="ASTÉRI STUDIO" className="main-logo" />
          </div>

          {/* --- RIGHT NAVIGATION BLOCK --- */}
          <div className="nav-group right">
            {/* Desktop Profile Link Channels */}
            {user && (
              <div className="nav-item-wrapper desktop-only" onClick={() => navigate('/account')}>
                <span className="nav-link">PROFILE</span>
              </div>
            )}
            <div className="nav-item-wrapper desktop-only" onClick={user ? onLogout : onOpenLogin}>
              <span className="nav-link">{user ? 'LOGOUT' : 'LOGIN'}</span>
            </div>

            {/* Mobile Only: Profile Avatar Action Icon */}
            <button className="mobile-action-icon mobile-only" onClick={user ? () => navigate('/account') : onOpenLogin} aria-label="Account">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </button>

            {/* Unified Bag Trigger Action Component */}
            <div className="nav-item-wrapper bag-trigger" onClick={() => { onOpenCart(); setMobileMenuOpen(false); }}>
              <span className="desktop-only nav-link">BAG</span>

              {/* Mobile Shopping Bag Vector Icon */}
              <button className="mobile-action-icon mobile-only" aria-label="Open Shopping Bag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
              </button>

              <span className="bag-count-editorial">{cartCount}</span>
            </div>
          </div>
        </div>

        {/* Desktop Only: Dropdown Mega Panel Blocks */}
        <div className={`mega-menu-container desktop-only ${openMenu ? 'active' : ''}`} onMouseLeave={() => setOpenMenu(null)}>
          {openMenu === 'shop' && (
            <div className="mega-menu-content">
              <div className="mega-column">
                <h4 className="mega-col-title">PRESS-ON NAILS</h4>
                <ul className="mega-list">
                  <li onClick={() => {navigate('/shop'); setOpenMenu(null);}}>ALL PRODUCTS</li>
                  <li onClick={() => {navigate('/shop'); setOpenMenu(null);}}>NEW ARRIVALS</li>
                </ul>
              </div>
              <div className="mega-column">
                <h4 className="mega-col-title">SHOP BY LENGTH</h4>
                <ul className="mega-list">
                  <li onClick={() => {navigate('/shop?collection=short'); setOpenMenu(null);}}>SHORT SETS</li>
                  <li onClick={() => {navigate('/shop?collection=medium'); setOpenMenu(null);}}>MEDIUM SETS</li>
                  <li onClick={() => {navigate('/shop?collection=long'); setOpenMenu(null);}}>LONG SETS</li>
                </ul>
              </div>
              <div className="mega-column">
                <h4 className="mega-col-title">COLLECTIONS</h4>
                <ul className="mega-list">
                  <li onClick={() => {navigate('/shop?collection=imperial-blue'); setOpenMenu(null);}}>BLUE IMPERIAL</li>
                  <li onClick={() => {navigate('/shop?collection=gadom'); setOpenMenu(null);}}>GADOM</li>
                </ul>
              </div>
            </div>
          )}
          <div className="mega-footer-link" onClick={() => {navigate('/shop'); setOpenMenu(null);}}>
            Shop All Archives ➜
          </div>
        </div>

        {/* Mobile Fullscreen Navigation Drawer */}
        <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'drawer-active' : ''}`}>
          <div className="mobile-drawer-inner-scroller">
            <nav className="mobile-drawer-links-wrapper">
              <div className="mobile-drawer-root-item" onClick={() => handleMobileNav('/')}>HOME</div>

              <div className="mobile-drawer-header-tag">SHOP BY DESIGN</div>
              <div className="mobile-drawer-child-item" onClick={() => handleMobileNav('/shop')}>ALL CREATIONS</div>
              <div className="mobile-drawer-child-item" onClick={() => handleMobileNav('/shop?collection=blue-imperial')}>BLUE IMPERIAL</div>
              <div className="mobile-drawer-child-item" onClick={() => handleMobileNav('/shop?collection=gadom')}>GADOM</div>

              <div className="mobile-drawer-header-tag">THE MANIFESTO</div>
              <div className="mobile-drawer-child-item" onClick={() => handleMobileNav('/about')}>ABOUT THE STUDIO</div>
              <div className="mobile-drawer-child-item" onClick={() => handleMobileNav('/values')}>OUR VALUES</div>
              <div className="mobile-drawer-child-item" onClick={() => handleMobileNav('/contact')}>CONTACT</div>
            </nav>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;