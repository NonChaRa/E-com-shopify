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
      <div className="loading-container">
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
    <div className="product-page-wrapper minimal-y2k">
      <div className="product-page-container">
        <button className="pdp-global-back" onClick={() => navigate('/')}>
          ← BACK TO SHOP
        </button>

        <div className="pdp-main-grid">
          {/* Vertical Image Gallery */}
          <div className="pdp-images-stack">
            {product.images.map((url, i) => (
              <div key={i} className="pdp-image-item">
                <img src={url} alt={`${product.name} view ${i + 1}`} />
              </div>
            ))}
          </div>

          {/* Product Details Sidebar */}
          <div className="pdp-info-sticky">
            <div className="pdp-info-content pdp-clean-card">
              <h1 className="pdp-name-title">{product.name}</h1>
              <p className="pdp-price-label">THB {Number(product.price).toLocaleString()}</p>

              <div className="stock-status-badge">
                {isInStock ? (
                  <span className="in-stock">● {selectedVariant.stock} UNITS IN STOCK</span>
                ) : canPreorder ? (
                  <span className="preorder-label">◈ AVAILABLE FOR PRE-ORDER</span>
                ) : (
                  <span className="sold-out">○ OUT OF STOCK</span>
                )}
              </div>

              <div className="pdp-selection-area">
                <span className="section-label">WHICH SIZE? {selectedVariant?.title}</span>
                <div className="size-pill-grid">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      className={`size-pill-item
                        ${selectedVariant?.id === v.id ? 'active' : ''}
                        ${v.stock <= 0 ? 'faint-pill' : ''}`}
                      onClick={() => setSelectedVariant(v)}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pdp-cta-group">
                {needsInquiry ? (
                  <button className="pdp-primary-btn inquiry-mode" onClick={() => setShowInquiryForm(true)}>
                    CUSTOM SIZE REQUEST
                  </button>
                ) : (
                  <>
                    <button
                      className={`pdp-primary-btn ${canPreorder ? 'preorder-mode' : ''}`}
                      onClick={handleAddToCart}
                    >
                      {canPreorder ? 'PRE-ORDER NOW' : 'ADD TO BAG'}
                    </button>

                    {canPreorder && (
                      <p className="pdp-preorder-subtext">
                        * This size is handmade to order. Ready to ship in 3-4 business days.
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="pdp-description-content">
                <p>
                  This set captures a love for the Y2K aesthetic, utilizing buttons as a primary focal point to tell a playful,
                  story-driven visual narrative. Each piece is crafted to be a vibrant, colorful addition to your collection.
                </p>
                <p className="preorder-notice">
                  Note: All pre-order pieces require approximately 3-4 days for preparation, excluding the shipping process.
                </p>
              </div>

              <div className="pdp-accordion-minimal">
                <details>
                  <summary>DELIVERY TIME</summary>
                  <div className="details-body">
                    <p>Standard orders ship within 1-2 business days. Pre-order sets are handmade and require a 3-4 day lead time before dispatch.</p>
                  </div>
                </details>
                <details>
                  <summary>ASSISTANCE</summary>
                  <div className="details-body">
                    <p>Our team is available for size consultations and custom inquiries. Contact us via email or DM for personalized support.</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>

        <TikTokSection videoId="7631174893756894482" />

        <section className="pdp-footer-section">
          <h2 className="footer-title">Similar Products</h2>
          <div className="similar-products-grid">
            {allProducts
              .filter(p => p.id !== product.id)
              .slice(0, 4)
              .map(p => (
                <div
                  key={p.id}
                  className="similar-card-minimal"
                  onClick={() => navigate(`/product/${encodeURIComponent(p.id)}`)}
                >
                  <div className="similar-image-wrap">
                    <img src={p.image_url} alt={p.name} />
                  </div>
                  <h3 className="similar-name">{p.name}</h3>
                  <p className="similar-price">THB {Number(p.price).toLocaleString()}</p>
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