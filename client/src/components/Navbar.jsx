import React, { useState, useEffect } from 'react';
import './Navbar.css';
import logo from '../assets/Asteri2k.gif';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ cartCount, onOpenCart, user, onOpenLogin, onLogout, forceSolid }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile drawer state controller
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setIsScrolled(currentScrollPos > 50);
      const scrollingUp = prevScrollPos > currentScrollPos;
      setIsVisible(scrollingUp || currentScrollPos < 10);
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
      {/* Background overlay mask */}
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

          {/* Desktop Only: Left Navigation Link Groups */}
          <div className="nav-group left desktop-only">
            <div className="nav-item-wrapper" onClick={() => navigate('/')}>
              <span className="nav-link">Home</span>
            </div>
            <div className="nav-item-wrapper" onMouseEnter={() => setOpenMenu('shop')}>
              <span className="nav-link">SHOP</span>
              <span className={`nav-arrow ${openMenu === 'shop' ? 'open' : ''}`}>▾</span>
            </div>
            <div className="nav-item-wrapper" onMouseEnter={() => setOpenMenu('tutorials')}>
              <span className="nav-link">TUTORIALS</span>
              <span className={`nav-arrow ${openMenu === 'tutorials' ? 'open' : ''}`}>▾</span>
            </div>
          </div>

          {/* Mobile Only: Menu Button */}
          <button
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'is-active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation map"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          {/* Brand Logo Frame */}
          <div className="nav-logo-centered" onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>
            <img src={logo} alt="Logo" className="main-logo" />
          </div>

          {/* Right Action Alignment Group */}
          <div className="nav-group right">
            {user && (
              <div className="nav-item-wrapper desktop-only" onClick={() => navigate('/account')}>
                <span className="nav-link">PROFILE</span>
              </div>
            )}
            <div className="nav-item-wrapper desktop-only" onClick={user ? onLogout : onOpenLogin}>
              <span className="nav-link">
                {user ? 'LOGOUT' : 'LOGIN'}
              </span>
            </div>

            <div className="nav-item-wrapper bag-trigger" onClick={() => { onOpenCart(); setMobileMenuOpen(false); }}>
              <span className="nav-link">BAG</span>
              <span className="bag-count-editorial">{cartCount}</span>
            </div>
          </div>
        </div>

        {/* Desktop Only: Mega Menu Content Areas */}
        <div className={`mega-menu-container desktop-only ${openMenu ? 'active' : ''}`} onMouseLeave={() => setOpenMenu(null)}>
          {openMenu === 'shop' && (
            <div className="mega-menu-content">
              <div className="mega-column">
                <h4 className="mega-col-title">PRESS-ON NAILS</h4>
                <ul className="mega-list">
                  <li onClick={() => {navigate('/shop'); setOpenMenu(null);}}>ALL</li>
                  <li onClick={() => {navigate('/shop'); setOpenMenu(null);}}>NEW ARRIVALS</li>
                  <li onClick={() => {navigate('/shop'); setOpenMenu(null);}}>BEST SELLERS</li>
                </ul>
              </div>

              <div className="mega-column">
                <h4 className="mega-col-title">SHOP BY LENGTH</h4>
                <ul className="mega-list">
                  <li onClick={() => {navigate('/shop?collection=short'); setOpenMenu(null);}}>SHORT</li>
                  <li onClick={() => {navigate('/shop?collection=medium'); setOpenMenu(null);}}>MEDIUM</li>
                  <li onClick={() => {navigate('/shop?collection=long'); setOpenMenu(null);}}>LONG</li>
                  <li onClick={() => {navigate('/shop?collection=extra-long'); setOpenMenu(null);}}>EXTRA LONG</li>
                </ul>
              </div>

              <div className="mega-column">
                <h4 className="mega-col-title">COLLECTIONS</h4>
                <ul className="mega-list">
                  <li onClick={() => {navigate('/shop?collection=y2k'); setOpenMenu(null);}}>Y2K</li>
                  <li onClick={() => {navigate('/shop?collection=blue-imperial'); setOpenMenu(null);}}>BLUE IMPERIAL</li>
                  <li onClick={() => {navigate('/shop?collection=gadom'); setOpenMenu(null);}}>GADOM</li>
                </ul>
              </div>
            </div>
          )}
          <div className="mega-footer-link" onClick={() => {navigate('/shop'); setOpenMenu(null);}}>
            Shop All
          </div>
        </div>

        {/* Mobile Fullscreen Navigation Menu Overlay Drawer */}
        <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'drawer-active' : ''}`}>
          <div className="mobile-drawer-inner-scroller">
            <nav className="mobile-drawer-links-wrapper">
              <div className="mobile-drawer-root-item" onClick={() => handleMobileNav('/')}>HOME</div>

              <div className="mobile-drawer-header-tag">PRESS-ON NAILS</div>
              <div className="mobile-drawer-child-item" onClick={() => handleMobileNav('/shop')}>ALL SECTIONS</div>
              <div className="mobile-drawer-child-item" onClick={() => handleMobileNav('/shop?collection=short')}>SHORT LENGTH</div>
              <div className="mobile-drawer-child-item" onClick={() => handleMobileNav('/shop?collection=medium')}>MEDIUM LENGTH</div>
              <div className="mobile-drawer-child-item" onClick={() => handleMobileNav('/shop?collection=long')}>LONG LENGTH</div>

              <div className="mobile-drawer-header-tag">COLLECTIONS</div>
              <div className="mobile-drawer-child-item" onClick={() => handleMobileNav('/shop?collection=blue-imperial')}>BLUE IMPERIAL</div>
              <div className="mobile-drawer-child-item" onClick={() => handleMobileNav('/shop?collection=gadom')}>GADOM</div>

              <div className="mobile-drawer-header-tag">ACCOUNT</div>
              {user ? (
                <>
                  <div className="mobile-drawer-child-item" onClick={() => handleMobileNav('/account')}>PROFILE PORTAL</div>
                  <div className="mobile-drawer-child-item" onClick={() => { onLogout(); setMobileMenuOpen(false); }}>LOGOUT</div>
                </>
              ) : (
                <div className="mobile-drawer-child-item" onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }}>LOGIN / CREATE PROFILE</div>
              )}
            </nav>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;