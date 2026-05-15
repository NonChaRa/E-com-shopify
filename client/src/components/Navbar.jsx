import React, { useState, useEffect } from 'react';
import './Navbar.css';
import logo from '../assets/Asteri2k.gif';
import { useNavigate } from 'react-router-dom';

// Added onLogout to the props destructured here
const Navbar = ({ cartCount, onOpenCart, user, onOpenLogin, onLogout, forceSolid }) => {
  const [openMenu, setOpenMenu] = useState(null);
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

  return (
    <>
      <div className={`mega-menu-blur ${openMenu ? 'active' : ''}`} onClick={() => setOpenMenu(null)} />

      <nav className={`navbar-editorial
        ${isVisible ? 'nav-visible' : 'nav-hidden'}
        ${(isScrolled || forceSolid || openMenu) ? 'scrolled' : ''}
        ${openMenu ? 'mega-expanded' : ''}`}
      >
        <div className="nav-top-row">
          <div className="nav-group left">
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

          <div className="nav-logo-centered" onClick={() => navigate('/')}>
            <img src={logo} alt="Logo" className="main-logo" />
          </div>

          <div className="nav-group right">
            {user && (
              <div className="nav-item-wrapper" onClick={() => navigate('/account')}>
                <span className="nav-link">PROFILE</span>
              </div>
            )}
            <div className="nav-item-wrapper" onClick={user ? onLogout : onOpenLogin}>
              <span className="nav-link">
                {user ? 'LOGOUT' : 'LOGIN'}
              </span>
            </div>

            <div className="nav-item-wrapper bag-trigger" onClick={onOpenCart}>
              <span className="nav-link">BAG</span>
              <span className="bag-count-editorial">{cartCount}</span>
            </div>
          </div>
        </div>

        <div className={`mega-menu-container ${openMenu ? 'active' : ''}`} onMouseLeave={() => setOpenMenu(null)}>
          {openMenu === 'shop' && (
            <div className="mega-menu-content">

              <div className="mega-column">
                <h4 className="mega-col-title">PRESS-ON NAILS</h4>
                <ul className="mega-list">
                  <li onClick={() => {navigate('/shop'); setOpenMenu(null);}}>ALL</li>
                  <li>NEW ARRIVALS</li>
                  <li>BEST SELLERS</li>
                </ul>
              </div>

              <div className="mega-column">
                <h4 className="mega-col-title">SHOP BY LENGTH</h4>
                <ul className="mega-list">
                  <li>SHORT</li>
                  <li>MEDIUM</li>
                  <li>LONG</li>
                  <li>EXTRA LONG</li>
                </ul>
              </div>

              <div className="mega-column">
                <h4 className="mega-col-title">COLLECTIONS</h4>
                <ul className="mega-list">
                  <li>Y2K</li>
                  <li>IMPERIAL BLUE</li>
                  <li>GADOM</li>
                </ul>
              </div>


            </div>
          )}
          <div className="mega-footer-link" onClick={() => {navigate('/shop'); setOpenMenu(null);}}>
            Shop All
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;