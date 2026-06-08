import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCurrency } from '../store/CurrencyContext';
import { SkeletonShopCard } from '../components/SkeletonCard';
import useInView from '../hooks/useInView';
import './AllProducts.css';

const CANONICAL_COLORS = [
  'white', 'yellow', 'orange', 'green', 'blue', 'pastel blue',
  'purple', 'silver', 'pink', 'red', 'blood red', 'beige', 'gold', 'rose gold',
];

const COLOR_SWATCHES = {
  'white':       '#FFFFFF',
  'yellow':      '#F5D53E',
  'orange':      '#E8802A',
  'green':       '#3D9C57',
  'blue':        '#2B6CB0',
  'pastel blue': '#A8D1ED',
  'purple':      '#7C3AED',
  'silver':      '#A8A9AD',
  'pink':        '#F472B6',
  'red':         '#DC2626',
  'blood red':   '#7B0000',
  'beige':       '#E8D5B0',
  'gold':        'linear-gradient(135deg, #C9961B 0%, #F5E17A 50%, #D4AF37 100%)',
  'rose gold':   'linear-gradient(135deg, #B76E79 0%, #D4A5A5 50%, #C0817D 100%)',
};

const AllProducts = ({ allProducts, loading, fetchByCollection, fetchAllProducts }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { formatPrice } = useCurrency();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Scroll-reveal for the product grid
  const [gridRef, gridInView] = useInView({ threshold: 0.06 });

  const [activeFilters, setActiveFilters] = useState({
    availability: [],
    color: [],
    size: [],
  });

  const availableColors = useMemo(() => {
    const colorsInProducts = new Set(
      (allProducts || []).flatMap(p => p.colors || [])
    );
    return CANONICAL_COLORS.filter(c => colorsInProducts.has(c));
  }, [allProducts]);

  const totalActiveFilters =
    activeFilters.availability.length +
    activeFilters.color.length +
    activeFilters.size.length;

  useEffect(() => {
    const requestedCollection = searchParams.get('collection');
    // new-arrival is a tag filter applied client-side — always load all products first
    if (requestedCollection) {
      fetchByCollection(requestedCollection);
    } else {
      fetchAllProducts();
    }
    window.scrollTo(0, 0);
  }, [searchParams, fetchByCollection, fetchAllProducts]);

  const toggleFilter = (category, value) => {
    setActiveFilters(prev => {
      const current = prev[category];
      const next = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [category]: next };
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({ availability: [], color: [], size: [] });
    setSearchTerm('');
  };

  const filterParam = searchParams.get('filter');
  const isNewArrivalFilter = filterParam === 'new-arrival';

  const filteredProducts = useMemo(() => {
    let result = (allProducts || []).filter(p => {
      const matchesNewArrival = !isNewArrivalFilter || p.tags?.includes('new-arrival');
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAvailability = activeFilters.availability.length === 0 ||
        activeFilters.availability.some(status => {
          const hasStock = p.variants.some(v => v.stock > 0);
          return status === 'in-stock' ? hasStock : !hasStock;
        });
      const matchesColor = activeFilters.color.length === 0 ||
        (p.colors || []).some(c => activeFilters.color.includes(c));
      const matchesSize = activeFilters.size.length === 0 ||
        p.variants.some(v => activeFilters.size.includes(v.title));

      return matchesNewArrival && matchesSearch && matchesAvailability && matchesColor && matchesSize;
    });

    if (sortBy === 'price-low') result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    if (sortBy === 'price-high') result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    if (sortBy === 'alpha-az') result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [allProducts, searchTerm, sortBy, activeFilters, isNewArrivalFilter]);

  return (
    <div className="all-products-wrapper">
      <header className="shop-header-minimal">
        <h1 className="shop-main-title">{isNewArrivalFilter ? 'NEW ARRIVALS' : 'THE ARCHIVE'}</h1>
        <p className="shop-sub-title">
          {isNewArrivalFilter
            ? 'FRESHLY ADDED TO THE STUDIO — HANDMADE SETS'
            : 'EXPLORE THE FULL RANGE OF ASTÉRI HANDMADE SETS'}
        </p>
      </header>

      <nav className="shop-utility-bar">
        <div className="utility-inner">
          <div className="utility-left">
            <button className="pdp-filter-trigger" onClick={() => setIsSidebarOpen(true)}>
              FILTERS{totalActiveFilters > 0 ? ` (${totalActiveFilters})` : ''}
            </button>
          </div>

          <div className="utility-center">
            <input
              type="text"
              className="pdp-search-input"
              placeholder="SEARCH THE STUDIO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="utility-right">
            <select className="pdp-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="featured">SORT: FEATURE</option>
              <option value="price-low">PRICE: LOW-HIGH</option>
              <option value="price-high">PRICE: HIGH-LOW</option>
              <option value="alpha-az">ALPHABETICAL: A-Z</option>
            </select>
          </div>
        </div>
      </nav>

      {/* Filter Slide-out Drawer — rendered in <body> via portal to escape stacking contexts */}
      {createPortal(
        <div className={`filter-overlay-dark ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
          <div className="filter-panel" onClick={e => e.stopPropagation()}>
            <div className="panel-header">
              <h3>REFINE BY</h3>
              <button className="panel-close" onClick={() => setIsSidebarOpen(false)}>✕</button>
            </div>

            <div className="panel-body">
              <div className="filter-section">
                <h4 className="filter-label">AVAILABILITY</h4>
                <label className="filter-checkbox">
                  <input type="checkbox" checked={activeFilters.availability.includes('in-stock')} onChange={() => toggleFilter('availability', 'in-stock')} />
                  <span>READY TO SHIP</span>
                </label>
                <label className="filter-checkbox">
                  <input type="checkbox" checked={activeFilters.availability.includes('pre-order')} onChange={() => toggleFilter('availability', 'pre-order')} />
                  <span>MADE TO ORDER</span>
                </label>
              </div>

              <div className="filter-section">
                <h4 className="filter-label">COLOR</h4>
                <div className="color-swatch-grid">
                  {CANONICAL_COLORS.map(color => (
                      <button
                        key={color}
                        className={`color-swatch-btn${activeFilters.color.includes(color) ? ' active' : ''}`}
                        onClick={() => toggleFilter('color', color)}
                        aria-label={`Filter by ${color}`}
                        aria-pressed={activeFilters.color.includes(color)}
                      >
                        <span
                          className="swatch-dot"
                          style={{ background: COLOR_SWATCHES[color] || '#ccc' }}
                        />
                        <span className="swatch-label">{color}</span>
                      </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h4 className="filter-label">SIZE</h4>
                {['XS', 'S', 'M', 'L'].map(size => (
                  <label key={size} className="filter-checkbox">
                    <input type="checkbox" checked={activeFilters.size.includes(size)} onChange={() => toggleFilter('size', size)} />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="panel-footer">
              <button className="panel-btn clear" onClick={clearAllFilters}>RESET</button>
              <button className="panel-btn apply" onClick={() => setIsSidebarOpen(false)}>APPLY</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Main Grid View */}
      <main className="shop-content-area">
        {loading ? (
          // Skeleton grid — same column count as pdp-product-grid
          <div className="pdp-product-grid">
            {Array.from({ length: 8 }, (_, i) => <SkeletonShopCard key={i} />)}
          </div>
        ) : (
          <div
            ref={gridRef}
            className={`pdp-product-grid ${gridInView ? 'is-visible' : ''}`}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <div key={p.id} className="pdp-card" onClick={() => navigate(`/product/${encodeURIComponent(p.id)}`)}>
                  <div className="pdp-card-img-frame">
                    {p.tags?.includes('new-arrival') && (
                      <span className="pdp-new-arrival-badge">NEW</span>
                    )}
                    <img src={p.image_url} alt={p.name} loading="lazy" />
                  </div>
                  <div className="pdp-card-info">
                    <h3 className="pdp-card-name">{p.name}</h3>
                    <p className="pdp-card-price">{formatPrice(p.price)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="pdp-empty-state">NO PRODUCTS MATCH YOUR FILTERS.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllProducts;