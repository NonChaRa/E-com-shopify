import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import './ProductPage.css';
import InquiryModal from './InquiryModal';
import TikTokSection from './TikTokSection';
import { useCurrency } from '../store/CurrencyContext';
import { useToast } from '../store/ToastContext';
import { SkeletonProductPage } from './SkeletonCard';
import useInView from '../hooks/useInView';

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

  // Scroll-reveal for the "More from the studio" section
  const [similarRef, similarInView] = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (product) {
      setSelectedVariant(getBestDefaultVariant(product.variants));
      setActiveImg(0);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [product]);

  // ----- Loading / not-found states ----------------------------------------

  // Still fetching: allProducts is empty — show skeleton
  if (allProducts.length === 0) {
    return (
      <div className="product-page-wrapper">
        <div className="product-page-container">
          <SkeletonProductPage />
        </div>
      </div>
    );
  }

  // Products loaded but this ID wasn't found — show error
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

  const images    = product.images?.length > 0 ? product.images : [product.image_url];
  const isInStock = selectedVariant?.stock > 0;
  const canPreorder   = !isInStock && selectedVariant?.available;
  const needsInquiry  = !selectedVariant?.available;

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
        <nav className="pdp-navigation">
          <button className="pdp-back-btn" onClick={() => navigate('/')}>
            ← RETURN TO ARCHIVE
          </button>
        </nav>

        <div className="pdp-main-layout">

          {/* ---- IMAGE GALLERY ---- */}
          <div className="pdp-gallery">
            {/* Main image */}
            <div className="pdp-gallery-main">
              <img
                src={images[activeImg]}
                alt={`${product.name} — view ${activeImg + 1}`}
                loading="eager"
              />
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

          {/* ---- STICKY SIDEBAR ---- */}
          <aside className="pdp-sidebar-sticky">
            <div className="pdp-sidebar-content">
              <h1 className="pdp-title-main">{product.name}</h1>
              <p className="pdp-price-tag">{formatPrice(product.price)}</p>

              <div className="pdp-status-indicator">
                {isInStock ? (
                  <span className="pdp-stock-msg">• {selectedVariant.stock} UNITS READY TO SHIP</span>
                ) : canPreorder ? (
                  <span className="pdp-preorder-msg">◈ MADE TO ORDER (PRE-ORDER)</span>
                ) : (
                  <span className="pdp-soldout-msg">○ ARCHIVED / SOLD OUT</span>
                )}
              </div>

              <div className="pdp-variant-selector">
                <span className="pdp-label-mini">SELECT SIZE: {selectedVariant?.title}</span>
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
                        * Handmade in Bangkok. Expected dispatch in 3–5 business days.
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
                  <summary>SHIPPING & LEAD TIMES <span>+</span></summary>
                  <div className="pdp-details-inner">
                    <p>Standard sets ship within 48 hours. Pre-order sets are handmade and require a short production lead time before dispatch from our Bangkok studio.</p>
                  </div>
                </details>
                <details>
                  <summary>SIZING GUIDE <span>+</span></summary>
                  <div className="pdp-details-inner">
                    <p>Need help? Refer to our sizing chart in the Tutorials section or contact us for a custom measurement consultation.</p>
                  </div>
                </details>
              </div>
            </div>
          </aside>
        </div>

        {/* ---- EXTENDED SECTIONS ---- */}
        <div className="pdp-extended-sections-wrapper">
          <TikTokSection videoId="7631174893756894482" />

          <section
            ref={similarRef}
            className={`pdp-similar-section reveal ${similarInView ? 'is-visible' : ''}`}
          >
            <h2 className="pdp-section-heading">MORE FROM THE STUDIO</h2>
            <div className="pdp-similar-grid">
              {allProducts
                .filter(p => p.id !== product.id)
                .slice(0, 4)
                .map((p, i) => (
                  <div
                    key={p.id}
                    className={`pdp-similar-card reveal ${similarInView ? 'is-visible' : ''}`}
                    style={{ transitionDelay: similarInView ? `${i * 0.1}s` : '0s' }}
                    onClick={() => navigate(`/product/${encodeURIComponent(p.id)}`)}
                  >
                    <div className="pdp-similar-img-wrapper">
                      <img src={p.image_url} alt={p.name} loading="lazy" />
                    </div>
                    <h3 className="pdp-similar-name">{p.name}</h3>
                    <p className="pdp-similar-price">{formatPrice(p.price)}</p>
                  </div>
                ))}
            </div>
          </section>
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
