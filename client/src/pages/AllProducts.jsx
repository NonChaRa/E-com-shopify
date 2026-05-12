import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './AllProducts.css';

const AllProducts = ({ allProducts, loading }) => {
  const navigate = useNavigate();

  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Multi-Category Filter State
  const [activeFilters, setActiveFilters] = useState({
    availability: [], // ['in-stock', 'pre-order']
    size: [],         // ['S', 'M', 'L']
    shape: [],        // ['Almond', 'Coffin', 'Square']
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    setActiveFilters({ availability: [], size: [], shape: [] });
    setSearchTerm('');
  };

  // Advanced Relevancy & Filter Logic
  const filteredProducts = useMemo(() => {
    let result = (allProducts || []).filter(p => {
      // 1. Search Relevancy
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Availability Check
      const matchesAvailability = activeFilters.availability.length === 0 ||
        activeFilters.availability.some(status => {
          const hasStock = p.variants.some(v => v.stock > 0);
          return status === 'in-stock' ? hasStock : !hasStock;
        });

      // 3. Size Check
      const matchesSize = activeFilters.size.length === 0 ||
        p.variants.some(v => activeFilters.size.includes(v.title));

      return matchesSearch && matchesAvailability && matchesSize;
    });

    // 4. Sorting Functionality
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'alpha-az') result.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'alpha-za') result.sort((a, b) => b.name.localeCompare(a.name));

    return result;
  }, [allProducts, searchTerm, sortBy, activeFilters]);

  return (
    <div className="all-products-wrapper">
      {/* Editorial Hero Header */}
      <header className="shop-all-hero">
        <h1 className="shop-all-hero-title"></h1>
      </header>

      {/* Horizontal Filter/Sort Bar (Non-Sticky) */}
      <nav className="shop-filter-bar">
        <div className="filter-inner">

          {/* 1. Left Section */}
          <div className="filter-left">
            <button className="minimal-filter-trigger" onClick={() => setIsSidebarOpen(true)}>
              Filters
            </button>
          </div>

          {/* 2. Center Section */}
          <div className="filter-center">
            <input
              type="text"
              className="minimal-search-input"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 3. Right Section */}
          <div className="filter-right">
            <select className="minimal-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low-High</option>
              <option value="price-high">Price: High-Low</option>
            </select>
          </div>

        </div>
      </nav>

      {/* Slide-out Sidebar Overlay */}
      <div className={`filter-sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
        <div className="filter-sidebar-content" onClick={e => e.stopPropagation()}>

          <div className="sidebar-header">
            <h3>Filter by</h3>
            <button className="close-sidebar" onClick={() => setIsSidebarOpen(false)}>×</button>
          </div>

          {/* WRAP FILTERS IN A BODY DIV */}
          <div className="sidebar-body">
            <div className="filter-group">
              <h4 className="group-title">Availability</h4>
              <label>
                <input type="checkbox" checked={activeFilters.availability.includes('in-stock')} onChange={() => toggleFilter('availability', 'in-stock')} />
                In stock
              </label>
              <label>
                <input type="checkbox" checked={activeFilters.availability.includes('pre-order')} onChange={() => toggleFilter('availability', 'pre-order')} />
                Out of stock
              </label>
            </div>

            <div className="filter-group">
              <h4 className="group-title">Size</h4>
              {['XS', 'S', 'M', 'L'].map(size => (
                <label key={size}>
                  <input type="checkbox" checked={activeFilters.size.includes(size)} onChange={() => toggleFilter('size', size)} />
                  {size}
                </label>
              ))}
            </div>
          </div>

          {/* FOOTER STAYS AT BOTTOM */}
          <div className="sidebar-footer">
            <button className="clear-all-btn" onClick={clearAllFilters}>Clear All</button>
            <button className="apply-filters-btn" onClick={() => setIsSidebarOpen(false)}>Apply Filters</button>
          </div>

        </div>
      </div>

      {/* Product Gallery Grid */}
      <main className="shop-grid-container">
        {loading ? (
          <div className="loading-state">Refreshing the collection...</div>
        ) : (
          <div className="editorial-product-grid">
            {filteredProducts.map((p) => (
              <div key={p.id} className="shop-card" onClick={() => navigate(`/product/${encodeURIComponent(p.id)}`)}>
                <div className="shop-image-frame">
                  <img src={p.image_url} alt={p.name} loading="lazy" />
                </div>
                <div className="shop-card-details">
                  <h3 className="shop-card-name">{p.name}</h3>
                  <p className="shop-card-price">THB {Number(p.price).toLocaleString()}</p>
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