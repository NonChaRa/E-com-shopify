import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { animate, stagger, createTimeline } from 'animejs';
import './ProductPage.css';
import InquiryModal from './InquiryModal';
import TikTokSection from './TikTokSection';
import { useCurrency } from '../store/CurrencyContext';
import { useToast } from '../store/ToastContext';
import { SkeletonProductPage } from './SkeletonCard';

const ProductPage = ({ allProducts, addToCart, onOpenCart }) => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { formatPrice } = useCurrency();
  const { showToast }   = useToast();

  const decodedId = decodeURIComponent(id);
  const product   = allProducts.find(p => p.id === decodedId);

  const getBestDefaultVariant = (variants) => {
    if (!variants) return null;
    return (
      variants.find(v => v.stock > 0) ||
      variants.find(v => v.available) ||
      variants[0]
    );
  };

  const [selectedVariant,  setSelectedVariant]  = useState(null);
  const [activeImg,        setActiveImg]         = useState(0);
  const [showInquiryForm,  setShowInquiryForm]   = useState(false);

  // Drag-to-scroll state for "FROM THE ARCHIVE" strip
  const archiveScrollRef = useRef(null);
  const dragState = useRef({ active: false, startX: 0, scrollLeft: 0 });

  useEffect(() => {
    if (product) {
      setSelectedVariant(getBestDefaultVariant(product.variants));
      setActiveImg(0);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [product]);

  // Entrance animation after product loads
  useEffect(() => {
    if (!product) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    createTimeline({ defaults: { easing: 'easeOutExpo' } })
      .add('.pdp-back-btn',        { translateY: [-8, 0], opacity: [0, 1], duration: 500 }, 0)
      .add('.pdp-gallery',         { translateY: [24, 0], opacity: [0, 1], duration: 680 }, 80)
      .add('.pdp-sidebar-content', { translateY: [24, 0], opacity: [0, 1], duration: 680 }, 160);
  }, [product?.id]);

  // IntersectionObserver for the archive strip
  useEffect(() => {
    if (!product) return;
    const el = document.querySelector('.pdp-archive-section');
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        animate('.pdp-archive-section .pdp-section-label, .pdp-archive-section .pdp-section-heading', {
          translateY: [18, 0], opacity: [0, 1], duration: 600,
          delay: stagger(90), easing: 'easeOutExpo',
        });
        animate('.pdp-archive-card', {
          translateY: [28, 0], opacity: [0, 1], duration: 660,
          delay: stagger(55, { start: 120 }), easing: 'easeOutExpo',
        });
        obs.disconnect();
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [product?.id]);

  // ---- Drag handlers ----
  const onDragStart = (e) => {
    const el = archiveScrollRef.current;
    if (!el) return;
    dragState.current = { active: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft };
    el.style.cursor = 'grabbing';
  };
  const onDragEnd = () => {
    if (!archiveScrollRef.current) return;
    dragState.current.active = false;
    archiveScrollRef.current.style.cursor = 'grab';
  };
  const onDragMove = (e) => {
    if (!dragState.current.active || !archiveScrollRef.current) return;
    const x = e.pageX - archiveScrollRef.current.offsetLeft;
    archiveScrollRef.current.scrollLeft = dragState.current.scrollLeft - (x - dragState.current.startX) * 1.1;
  };

  // ----- Loading / not-found states ----------------------------------------
  if (allProducts.length === 0) {
    return (
      <div className="product-page-wrapper">
        <div className="product-page-container">
          <SkeletonProductPage />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-page-wrapper">
        <div className="product-page-container pdp-not-found">
          <span className="pdp-not-found-eyebrow">ERROR · 404</span>
          <h1 className="pdp-not-found-title">SET NOT FOUND</h1>
          <p className="pdp-not-found-body">
            This product may have been archived or the link is incorrect.
          </p>
          <button className="pdp-btn-primary" onClick={() => navigate('/shop')}>
            BROWSE THE ARCHIVE ➜
          </button>
        </div>
      </div>
    );
  }

  // ----- Derive state -------------------------------------------------------
  const images        = product.images?.length > 0 ? product.images : [product.image_url];
  const isInStock     = selectedVariant?.stock > 0;
  const canPreorder   = !isInStock && selectedVariant?.available;
  const needsInquiry  = !selectedVariant?.available;
  const otherProducts = allProducts.filter(p => p.id !== product.id).slice(0, 9);

  const handleAddToCart = () => {
    addToCart(product, selectedVariant.title, selectedVariant.id);
    onOpenCart();
    showToast(
      canPreorder ? `${product.name} pre-order confirmed` : `${product.name} added to bag`,
      'success'
    );
  };

  // ----- Render -------------------------------------------------------------
  return (
    <div className="product-page-wrapper">
      <div className="product-page-container">

        {/* ── BREADCRUMB NAV ── */}
        <nav className="pdp-navigation">
          <button className="pdp-back-btn" onClick={() => navigate(-1)}>
            ← Archive
          </button>
          <span className="pdp-nav-sep" aria-hidden="true">/</span>
          <span className="pdp-nav-current">{product.name}</span>
        </nav>

        {/* ── MAIN LAYOUT: GALLERY + SIDEBAR ── */}
        <div className="pdp-main-layout">

          {/* IMAGE GALLERY */}
          <div className="pdp-gallery">
            <div className="pdp-gallery-main">
              <img
                src={images[activeImg]}
                alt={`${product.name} — view ${activeImg + 1}`}
                loading="eager"
              />
              {images.length > 1 && (
                <span className="pdp-gallery-count">
                  {activeImg + 1} / {images.length}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="pdp-gallery-thumbs" role="list">
                {images.map((url, i) => (
                  <button
                    key={i}
                    role="listitem"
                    className={`pdp-thumb ${activeImg === i ? 'is-active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                    aria-current={activeImg === i}
                  >
                    <img src={url} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* STICKY SIDEBAR */}
          <aside className="pdp-sidebar-sticky">
            <div className="pdp-sidebar-content">

              <span className="pdp-eyebrow">HANDMADE IN BANGKOK · ASTÉRI 2K</span>

              <h1 className="pdp-title-main">{product.name}</h1>
              <p className="pdp-price-tag">{formatPrice(product.price)}</p>

              <div className="pdp-status-indicator">
                {isInStock ? (
                  <span className="pdp-stock-msg">● {selectedVariant.stock} units ready</span>
                ) : canPreorder ? (
                  <span className="pdp-preorder-msg">◈ Made to order</span>
                ) : (
                  <span className="pdp-soldout-msg">○ Archived / sold out</span>
                )}
              </div>

              <div className="pdp-variant-selector">
                <span className="pdp-label-mini">Size — {selectedVariant?.title}</span>
                <div className="pdp-size-grid">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      className={`pdp-size-btn
                        ${selectedVariant?.id === v.id ? 'is-active' : ''}
                        ${v.stock <= 0 && !v.available ? 'is-disabled' : ''}`}
                      onClick={() => setSelectedVariant(v)}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pdp-action-area">
                {needsInquiry ? (
                  <button className="pdp-btn-primary inquiry" onClick={() => setShowInquiryForm(true)}>
                    REQUEST CUSTOM SIZE
                  </button>
                ) : (
                  <>
                    <button
                      className={`pdp-btn-primary ${canPreorder ? 'preorder' : ''}`}
                      onClick={handleAddToCart}
                    >
                      {canPreorder ? 'PRE-ORDER NOW' : 'ADD TO BAG'}
                    </button>
                    {canPreorder && (
                      <p className="pdp-preorder-disclaimer">
                        Handmade in Bangkok. Dispatched within 3–5 business days.
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="pdp-description-box">
                {product.descriptionHtml ? (
                  <div
                    className="pdp-description-rich-text"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.descriptionHtml) }}
                  />
                ) : (
                  <p>
                    {product.description || 'This set captures a love for the Y2K aesthetic, utilizing custom art as a primary focal point to tell a playful, story-driven visual narrative.'}
                  </p>
                )}
              </div>

              <div className="pdp-utility-accordion">
                <details>
                  <summary>Shipping &amp; Lead Times <span>+</span></summary>
                  <div className="pdp-details-inner">
                    <p>Standard sets ship within 48 hours. Pre-order sets are handmade and require a short production lead time before dispatch from our Bangkok studio.</p>
                  </div>
                </details>
                <details>
                  <summary>Sizing Guide <span>+</span></summary>
                  <div className="pdp-details-inner">
                    <p>Need help? Refer to our sizing chart in the Tutorials section or contact us for a custom measurement consultation.</p>
                  </div>
                </details>
              </div>

            </div>
          </aside>
        </div>

        {/* ── EXTENDED SECTIONS ── */}
        <div className="pdp-extended-sections-wrapper">

          {/* TikTok Feature */}
          <TikTokSection videoId="7631174893756894482" />

          {/* FROM THE ARCHIVE — horizontal scroll strip */}
          {otherProducts.length > 0 && (
            <section className="pdp-archive-section">
              <div className="pdp-archive-header">
                <span className="pdp-section-label">THE COLLECTION</span>
                <h2 className="pdp-section-heading">FROM THE ARCHIVE</h2>
              </div>

              <div
                className="pdp-archive-scroll"
                ref={archiveScrollRef}
                onMouseDown={onDragStart}
                onMouseLeave={onDragEnd}
                onMouseUp={onDragEnd}
                onMouseMove={onDragMove}
              >
                {otherProducts.map((p) => (
                  <div
                    key={p.id}
                    className="pdp-archive-card"
                    onClick={() => navigate(`/product/${encodeURIComponent(p.id)}`)}
                  >
                    <div className="pdp-archive-img">
                      <img src={p.image_url} alt={p.name} loading="lazy" />
                      <div className="pdp-archive-overlay">
                        <span>VIEW SET ➜</span>
                      </div>
                    </div>
                    <div className="pdp-archive-info">
                      <h3 className="pdp-archive-name">{p.name}</h3>
                      <p className="pdp-archive-price">{formatPrice(p.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>

      {showInquiryForm && (
        <InquiryModal
          product={product}
          size={selectedVariant?.title}
          onClose={() => setShowInquiryForm(false)}
        />
      )}
    </div>
  );
};

export default ProductPage;
