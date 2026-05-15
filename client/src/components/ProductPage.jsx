import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductPage.css';
import InquiryModal from './InquiryModal';
import TikTokSection from './TikTokSection';

const ProductPage = ({ allProducts, addToCart, onOpenCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const decodedId = decodeURIComponent(id);
  const product = allProducts.find(p => p.id === decodedId);

  const getBestDefaultVariant = (variants) => {
    if (!variants) return null;
    return variants.find(v => v.stock > 0) ||
           variants.find(v => v.available) ||
           variants[0];
  };

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedVariant(getBestDefaultVariant(product.variants));
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [product]);

  if (!product) {
    return (
      <div className="pdp-loading-container">
        <p>Loading your set...</p>
      </div>
    );
  }

  const isInStock = selectedVariant?.stock > 0;
  const canPreorder = !isInStock && selectedVariant?.available;
  const needsInquiry = !selectedVariant?.available;

  const handleAddToCart = () => {
    addToCart(product, selectedVariant.title, selectedVariant.id);
    onOpenCart();
  };

  return (
    <div className="product-page-wrapper">
      <div className="product-page-container">
        <nav className="pdp-navigation">
          <button className="pdp-back-btn" onClick={() => navigate('/')}>
            ← RETURN TO ARCHIVE
          </button>
        </nav>

        <div className="pdp-main-layout">
          {/* Vertical Image Gallery */}
          <div className="pdp-gallery-stack">
            {(product.images?.length > 0 ? product.images : [product.image_url]).map((url, i) => (
              <div key={i} className="pdp-image-container">
                <img src={url} alt={`${product.name} frame ${i + 1}`} loading="lazy" />
              </div>
            ))}
          </div>

          {/* Product Details Sidebar */}
          <aside className="pdp-sidebar-sticky">
            <div className="pdp-sidebar-content">
              <span className="pdp-collection-tag">ASTÉRI STUDIO // 2026</span>
              <h1 className="pdp-title-main">{product.name}</h1>
              <p className="pdp-price-tag">THB {Number(product.price).toLocaleString()}</p>

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
                        * Handmade in Bangkok. Expected dispatch in 3-5 business days.
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="pdp-description-box">
                <p>{product.description || "This set captures a love for the Y2K aesthetic, utilizing custom art as a primary focal point to tell a playful, story-driven visual narrative."}</p>
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

        <TikTokSection videoId="7631174893756894482" />

        <section className="pdp-similar-section">
          <h2 className="pdp-section-heading">MORE FROM THE STUDIO</h2>
          <div className="pdp-similar-grid">
            {allProducts
              .filter(p => p.id !== product.id)
              .slice(0, 4)
              .map(p => (
                <div
                  key={p.id}
                  className="pdp-similar-card"
                  onClick={() => navigate(`/product/${encodeURIComponent(p.id)}`)}
                >
                  <div className="pdp-similar-img-wrapper">
                    <img src={p.image_url} alt={p.name} />
                  </div>
                  <h3 className="pdp-similar-name">{p.name}</h3>
                  <p className="pdp-similar-price">THB {Number(p.price).toLocaleString()}</p>
                </div>
              ))}
          </div>
        </section>
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