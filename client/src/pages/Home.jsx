import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import SplitFeature from '../components/SplitFeature';
import VideoLoopSection from '../components/VideoLoopSection';
import EditorialHero from '../components/EditorialHero';
import { useCurrency } from '../store/CurrencyContext';
import { useToast } from '../store/ToastContext';
import { SkeletonEditorialCard } from '../components/SkeletonCard';
import useInView from '../hooks/useInView';
import "./Home.css";

const TICKER_ITEMS = [
  'HANDMADE', 'MADE TO ORDER', 'ASTÉRI-2K-STUDIO', 'LIMITED EDITION',
  'SHIPS IN 3–4 DAYS', 'BANGKOK STUDIO', 'EACH PIECE IS UNIQUE', 'PRESS-ON NAIL ART',
];

const TickerStrip = () => (
  <div className="brand-ticker-strip" aria-hidden="true">
    <div className="brand-ticker-track">
      {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
        <React.Fragment key={i}>
          <span className="ticker-item">{item}</span>
          <span className="ticker-dot">✦</span>
        </React.Fragment>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// ProductCard
// ---------------------------------------------------------------------------
const ProductCard = ({ p, navigate, addToCart }) => {
  const [showSizes, setShowSizes]         = useState(false);
  const [pendingPreorder, setPendingPreorder] = useState(null);
  const { formatPrice } = useCurrency();
  const { showToast }   = useToast();

  const handleSizeClick = (e, variant) => {
    e.stopPropagation();
    const isPreorder = variant.stock <= 0 && variant.available;
    if (isPreorder) {
      setPendingPreorder(variant);
    } else {
      addToCart(p, variant.title, variant.id);
      setShowSizes(false);
      showToast(`${p.name} added to bag`, 'success');
    }
  };

  const confirmPreorder = (e) => {
    e.stopPropagation();
    addToCart(p, pendingPreorder.title, pendingPreorder.id);
    setPendingPreorder(null);
    setShowSizes(false);
    showToast(`${p.name} pre-order confirmed`, 'success');
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
        <img src={p.image_url} alt={p.name} loading="lazy" />

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
                Ready to ship in 3–4 days.
              </p>
              <div className="confirm-actions">
                <button className="confirm-add-btn" onClick={confirmPreorder}>ADD TO BAG</button>
                <button className="confirm-cancel-btn" onClick={cancelPreorder}>CANCEL</button>
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
        <p className="product-price">{formatPrice(p.price)}</p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------
const Home = ({ allProducts, fetchByCollection, fetchAllProducts, loading, addToCart }) => {
  const [activeCollection, setActiveCollection] = useState('ALL');
  const navigate = useNavigate();

  // Scroll-reveal refs
  const [headerRef, headerInView]   = useInView({ threshold: 0.15 });
  const [gridRef,   gridInView]     = useInView({ threshold: 0.08 });
  const [craftRef,  craftInView]    = useInView({ threshold: 0.15 });

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

  const displayProducts = allProducts?.slice(0, 8) ?? [];

  return (
    <>
      <Hero />
      <TickerStrip />

      <main className="store-container">

        {/* ----------------------------------------------------------------
            Collection header — fade-up on scroll
            ---------------------------------------------------------------- */}
        <div
          ref={headerRef}
          className={`collection-header reveal ${headerInView ? 'is-visible' : ''}`}
        >
          <div className="collection-header-left">
            <span className="collection-eyebrow">— SHOP</span>
            <h1 className="collection-title">COLLECTION</h1>
          </div>
          <div className="collection-categories">
            <span
              className={`category-link ${activeCollection === 'IMPERIAL BLUE' ? 'active' : ''}`}
              onClick={() => handleCollectionChange('imperial-blue', 'IMPERIAL BLUE')}
            >
              Imperial Blue
            </span>
            <span
              className={`category-link ${activeCollection === 'GADOM' ? 'active' : ''}`}
              onClick={() => handleCollectionChange('gadom', 'GADOM')}
            >
              Gadom
            </span>
            <span
              className={`category-link shop-all-link ${activeCollection === 'ALL' ? 'active' : ''}`}
              onClick={() => handleCollectionChange('all', 'ALL')}
            >
              View All
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------------------
            Product grid — skeletons while loading, staggered cards on reveal
            ---------------------------------------------------------------- */}
        <div
          ref={gridRef}
          className={`editorial-grid-wrapper ${loading ? 'products-fading' : ''} ${gridInView ? 'is-visible' : ''}`}
        >
          {loading ? (
            // Show 8 shimmer skeleton cards that match the editorial-card shape
            Array.from({ length: 8 }, (_, i) => (
              <SkeletonEditorialCard key={i} index={i} />
            ))
          ) : displayProducts.length > 0 ? (
            displayProducts.map((p) => (
              <ProductCard key={p.id} p={p} navigate={navigate} addToCart={addToCart} />
            ))
          ) : (
            <p className="no-products-msg">NO PRODUCTS FOUND IN THIS COLLECTION.</p>
          )}
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
            Explore All Sets
          </button>
        </div>

        {/* ----------------------------------------------------------------
            Craft process strip — children stagger in
            ---------------------------------------------------------------- */}
        <div
          ref={craftRef}
          className={`craft-process-strip reveal ${craftInView ? 'is-visible' : ''}`}
        >
          <div className={`craft-step reveal ${craftInView ? 'is-visible' : ''}`}>
            <span className="craft-num">01</span>
            <h3 className="craft-title">BESPOKE DESIGN</h3>
            <p className="craft-desc">Each set is designed for your hands, your nails, your style. Never repeated.</p>
          </div>
          <div className={`craft-arrow reveal reveal--delay-1 ${craftInView ? 'is-visible' : ''}`} aria-hidden="true">→</div>
          <div className={`craft-step reveal reveal--delay-1 ${craftInView ? 'is-visible' : ''}`}>
            <span className="craft-num">02</span>
            <h3 className="craft-title">HANDMADE</h3>
            <p className="craft-desc">Shaped and painted by hand in our Bangkok studio. No shortcuts, no mass production.</p>
          </div>
          <div className={`craft-arrow reveal reveal--delay-2 ${craftInView ? 'is-visible' : ''}`} aria-hidden="true">→</div>
          <div className={`craft-step reveal reveal--delay-2 ${craftInView ? 'is-visible' : ''}`}>
            <span className="craft-num">03</span>
            <h3 className="craft-title">SHIPS IN 3–4 DAYS</h3>
            <p className="craft-desc">Made to order. Worth the wait. Each piece arrives ready to wear.</p>
          </div>
        </div>

        <SplitFeature />
        <VideoLoopSection />
      </main>
      <EditorialHero />
    </>
  );
};

export default Home;
