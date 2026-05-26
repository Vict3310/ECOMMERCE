import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import FilterSidebar from '../components/layout/FilterSidebar';
import FilterChips from '../components/layout/FilterChips';
import { useAppContext } from '../context/AppContext';
import { Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';

const Shop = ({ onProductClick }) => {
  const { products, categoryFilter, setCategoryFilter, getFilteredProducts } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';
  const setSearchQuery = useCallback(
    (value) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set('q', value);
          else next.delete('q');
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat != null && cat !== '') setCategoryFilter(cat);
  }, [searchParams, setCategoryFilter]);

  const categories = ['all', 'Phones', 'Laptops', 'Accessories'];

  const filteredProducts = useMemo(() => {
    let result = getFilteredProducts();

    // Apply category filter (existing logic)
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Apply search query
    if (searchQuery.trim()) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [categoryFilter, searchQuery, getFilteredProducts]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [categoryFilter, searchQuery]);

  // Pagination logic
  const paginatedProducts = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  return (
    <div className="fade-in" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Shop Header */}
      <div className="thin-border-bottom" style={{ padding: '80px 0', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '32px' }}>
            <div>
              <h1 style={{ fontSize: '80px', letterSpacing: '-0.05em', marginBottom: '8px', color: 'var(--text-primary)' }}>COLLECTION.</h1>
              <p style={{ opacity: 0.5, fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', color: 'var(--text-primary)' }}>
                SHOWING {filteredProducts.length} OF {products.length} PREMIUM GADGETS
              </p>
            </div>

            <div style={{ display: 'flex', gap: '32px', marginBottom: '12px' }}>
              <div style={{ position: 'relative' }}>
                 <input
                   type="text"
                   placeholder="SEARCH CATALOG..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   style={{
                     backgroundColor: 'transparent', border: 'none', borderBottom: 'var(--border-thin)',
                     padding: '8px 0', fontSize: '11px', fontWeight: 800, width: '250px', outline: 'none',
                     color: 'var(--text-primary)'
                   }}
                 />
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-primary)',
                  border: 'var(--border-thin)',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  color: 'var(--text-primary)'
                }}
              >
                <SlidersHorizontal size={16} />
                FILTERS
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '80px 24px' }}>

        {/* Category Navigation */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }} className="mobile-horizontal-scroll">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  opacity: categoryFilter === cat ? 1 : 0.3,
                  color: 'var(--text-primary)',
                  transition: 'var(--transition-smooth)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 0'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filter Chips */}
        <FilterChips />

        {/* Products Grid */}
        <div className="product-grid-container product-grid-2" style={{
          display: 'grid',
          gap: '0',
          marginBottom: '80px'
        }}>
          {paginatedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={(arg) => (arg === 'cart' ? onProductClick('cart') : onProductClick(product))}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '80px',
            flexWrap: 'wrap'
          }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                style={{
                  padding: '12px 16px',
                  backgroundColor: page === pageNum ? 'var(--brand-blue)' : 'var(--bg-secondary)',
                  color: page === pageNum ? '#fff' : 'var(--text-primary)',
                  border: 'var(--border-thin)',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  minWidth: '44px'
                }}
              >
                {pageNum}
              </button>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {filteredProducts.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '120px 0',
            opacity: 0.5
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 800,
              marginBottom: '16px',
              color: 'var(--text-primary)'
            }}>
              NO PRODUCTS FOUND
            </h3>
            <p style={{
              fontSize: '13px',
              marginBottom: '32px'
            }}>
              Try adjusting your filters or search terms.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                // Clear all filters would be called here
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: 'var(--brand-blue)',
                color: '#fff',
                border: 'none',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer'
              }}
            >
              CLEAR ALL FILTERS
            </button>
          </div>
        )}
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
};

export default Shop;
