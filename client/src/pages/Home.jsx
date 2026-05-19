import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import SplitFeature from '../components/SplitFeature';
import VideoLoopSection from '../components/VideoLoopSection';
import EditorialHero from '../components/EditorialHero';
import "./Home.css"

const ProductCard = ({ p, navigate, addToCart }) => {
  const [showSizes, setShowSizes] = useState(false);
  const [pendingPreorder, setPendingPreorder] = useState(null);

  const handleSizeClick = (e, variant) => {
      e.stopPropagation();
      const isPreorder = variant.stock <= 0 && variant.available;

      if (isPreorder) {
        setPendingPreorder(variant);
      } else {
        addToCart(p, variant.title, variant.id);
        setShowSizes(false);
      }
  };
  const confirmPreorder = (e) => {
      e.stopPropagation();
      addToCart(p, pendingPreorder.title, pendingPreorder.id);
      setPendingPreorder(null);
      setShowSizes(false);
  };

  const cancelPreorder = (e) => {
      e.stopPropagation();
      setPendingPreorder(null);
  };

  return (
    <div
      className="editorial-card"
      onClick={() => navigate(`/product/${encodeURIComponent(p.id)}`)}
      onMouseLeave={() => setShowSizes(false)}
    >
      <div className="editorial-image-wrapper">
        <img src={p.image_url} alt={p.name} />

        <div className={`quick-size-overlay ${showSizes ? 'active' : ''}`}>
          {!pendingPreorder ? (
            <>
              <span className="quick-add-label">SELECT SIZE</span>
              <div className="size-btn-grid">
                {p.variants.map((v) => {
                  const isPreorder = v.stock <= 0 && v.available;
                  return (
                    <button
                      key={v.id}
                      className={`mini-size-btn ${isPreorder ? 'preorder-dot' : ''}`}
                      disabled={!v.available}
                      onClick={(e) => handleSizeClick(e, v)}
                    >
                      {v.title}
                      {isPreorder && <span className="dot">◈</span>}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="preorder-confirm-ui">
              <p className="confirm-text">
                This size (<strong>{pendingPreorder.title}</strong>) is handmade to order.
                Ready to ship in 3-4 days.
              </p>
              <div className="confirm-actions">
                <button className="confirm-add-btn" onClick={confirmPreorder}>
                  ADD TO BAG
                </button>
                <button className="confirm-cancel-btn" onClick={cancelPreorder}>
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          className={`quick-add-trigger-circle ${showSizes ? 'is-active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setShowSizes(!showSizes);
            setPendingPreorder(null);
          }}
        >
          {showSizes ? '✕' : '+'}
        </button>
      </div>

      <div className="editorial-info">
        <h3 className="product-name">{p.name}</h3>
        <p className="product-price">THB {Number(p.price).toLocaleString()}</p>
      </div>
    </div>
  );
};

const Home = ({ allProducts, fetchByCollection, fetchAllProducts, loading, addToCart }) => {
  const [activeCollection, setActiveCollection] = useState('ALL');
  const navigate = useNavigate();

  const handleCollectionChange = async (shopifyHandle, displayName) => {
    setActiveCollection(displayName);
    if (shopifyHandle === 'all') {
      await fetchAllProducts();
    } else {
      await fetchByCollection(shopifyHandle);
    }
  };

  useEffect(() => {
    fetchAllProducts();
    setActiveCollection('ALL');
  }, []);

  const scrollSlider = (direction) => {
    const slider = document.getElementById('product-slider');
    slider.scrollBy({ left: direction === 'right' ? 450 : -450, behavior: 'smooth' });
  };

  return (
    <>
      <Hero />

      <main className="store-container">
        <div className="collection-header">
          <h1 className="collection-title">SHOP BY COLLECTION</h1>
          <div className="collection-categories">
              <span
                className={`category-link ${activeCollection === 'IMPERIAL BLUE' ? 'active' : ''}`}
                onClick={() => handleCollectionChange('imperial-blue', 'IMPERIAL BLUE')}
              >
                IMPERIAL BLUE
              </span>

              <span
                className={`category-link ${activeCollection === 'GADOM' ? 'active' : ''}`}
                onClick={() => handleCollectionChange('gadom', 'GADOM')}
              >
                GADOM
              </span>

              <span
                className={`category-link shop-all-link ${activeCollection === 'ALL' ? 'active' : ''}`}
                onClick={() => handleCollectionChange('all', 'ALL')}
              >
                VIEW ALL
              </span>
          </div>
        </div>

        <div className="slider-wrapper">
          <div className={`editorial-grid slider-row ${loading ? 'products-fading' : ''}`} id="product-slider">
            {allProducts && allProducts.length > 0 ? (
              allProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  p={p}
                  navigate={navigate}
                  addToCart={addToCart}
                />
              ))
            ) : !loading ? (
              <p className="no-products-msg">NO PRODUCTS FOUND IN THIS COLLECTION.</p>
            ) : null}
          </div>
          <div className="slider-indicator-arrow" onClick={() => scrollSlider('right')}><span>→</span></div>
        </div>

        <div className="shop-all-cta-centered">
          <button
            className="editorial-explore-btn"
            onClick={() => {
              fetchAllProducts();
              handleCollectionChange('all', 'ALL');
              navigate('/shop');
            }}
          >
            EXPLORE ALL SETS
          </button>
        </div>

        <SplitFeature />
        <VideoLoopSection />
      </main>
      <EditorialHero />
    </>
  );
};

export default Home;