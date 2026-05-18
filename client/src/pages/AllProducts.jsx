import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './AllProducts.css';

const AllProducts = ({ allProducts, loading, fetchByCollection, fetchAllProducts }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  const [activeFilters, setActiveFilters] = useState({
    availability: [],
    size: [],
  });

  useEffect(() => {
    const requestedCollection = searchParams.get('collection');
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
    setActiveFilters({ availability: [], size: [] });
    setSearchTerm('');
  };

  const filteredProducts = useMemo(() => {
    let result = (allProducts || []).filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAvailability = activeFilters.availability.length === 0 ||
        activeFilters.availability.some(status => {
          const hasStock = p.variants.some(v => v.stock > 0);
          return status === 'in-stock' ? hasStock : !hasStock;
        });
      const matchesSize = activeFilters.size.length === 0 ||
        p.variants.some(v => activeFilters.size.includes(v.title));

      return matchesSearch && matchesAvailability && matchesSize;
    });

    if (sortBy === 'price-low') result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    if (sortBy === 'price-high') result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    if (sortBy === 'alpha-az') result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [allProducts, searchTerm, sortBy, activeFilters]);

  return (
    <div className="all-products-wrapper">
      <header className="shop-header-minimal">
        <h1 className="shop-main-title">THE ARCHIVE</h1>
        <p className="shop-sub-title">EXPLORE THE FULL RANGE OF ASTÉRI HANDMADE SETS</p>
      </header>

      <nav className="shop-utility-bar">
        <div className="utility-inner">
          <div className="utility-left">
            <button className="pdp-filter-trigger" onClick={() => setIsSidebarOpen(true)}>
              FILTERS
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

      {/* Filter Slide-out Drawer */}
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
      </div>

      {/* Main Grid View */}
      <main className="shop-content-area">
        {loading ? (
          <div className="pdp-loading-state">SYNCHRONIZING STUDIO DATA...</div>
        ) : (
          <div className="pdp-product-grid">
            {filteredProducts.map((p) => (
              /* --- CRITICAL NAVIGATION ROUTING CORRECTION FIXED HERE --- */
              <div key={p.id} className="pdp-card" onClick={() => navigate(`/product/${encodeURIComponent(p.id)}`)}>
                <div className="pdp-card-img-frame">
                  <img src={p.image_url} alt={p.name} loading="lazy" />
                </div>
                <div className="pdp-card-info">
                  <h3 className="pdp-card-name">{p.name}</h3>
                  <p className="pdp-card-price">THB {Number(p.price).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllProducts;