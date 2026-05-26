import React, { useState, useLayoutEffect, useRef } from 'react';
import { X, Search as SearchIcon, ArrowUpRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { gsap } from 'gsap';

const SearchOverlay = ({ isOpen, onClose, onProductClick }) => {
  const { products, formatPrice } = useAppContext();
  const [query, setQuery] = useState('');
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const inputRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (isOpen) {
        gsap.to(overlayRef.current, { opacity: 1, visibility: 'visible', duration: 0.6, ease: "power4.out" });
        gsap.fromTo(contentRef.current, 
          { y: 50, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8, delay: 0.1, ease: "expo.out" }
        );
        setTimeout(() => inputRef.current?.focus(), 400);
      } else {
        gsap.to(overlayRef.current, { opacity: 0, visibility: 'hidden', duration: 0.4, ease: "power4.in" });
      }
    });
    return () => ctx.revert();
  }, [isOpen]);

  const results = query.trim() === '' 
    ? [] 
    : products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.brand.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div 
      ref={overlayRef}
      style={{ 
        position: 'fixed', inset: 0, 
        backgroundColor: 'rgba(255, 255, 255, 0.98)', 
        backdropFilter: 'blur(30px)', 
        zIndex: 3000, visibility: 'hidden', opacity: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '120px 24px'
      }} 
      className="search-overlay-container"
    >
      <button 
        onClick={onClose} 
        style={{ position: 'absolute', top: '48px', right: '48px', padding: '12px' }}
        className="hover-scale"
      >
        <X size={32} strokeWidth={1.5} color="#121212" />
      </button>

      <div ref={contentRef} style={{ width: '100%', maxWidth: '800px' }}>
        <div style={{ position: 'relative', marginBottom: '80px' }}>
          <SearchIcon size={24} style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="SEARCH GADGETS..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ 
              width: '100%', border: 'none', borderBottom: '2px solid #121212', 
              padding: '24px 48px', fontSize: '48px', fontWeight: 800, 
              letterSpacing: '-0.04em', textTransform: 'uppercase',
              backgroundColor: 'transparent', outline: 'none', color: '#121212'
            }} 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2px', backgroundColor: '#E5E5E5', border: '0.5px solid #E5E5E5' }}>
          {results.map((product) => (
            <button 
              key={product.id}
              onClick={() => { onProductClick(product); onClose(); setQuery(''); }}
              style={{ 
                width: '100%', padding: '32px', backgroundColor: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.3s'
              }}
              className="search-result-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '32px', textAlign: 'left' }}>
                <img src={product.image} style={{ width: '64px', height: '64px', objectFit: 'contain', filter: 'grayscale(1)' }} />
                <div>
                   <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{product.name}</h4>
                   <span style={{ fontSize: '11px', opacity: 0.4, fontWeight: 800, textTransform: 'uppercase' }}>{product.brand} · {product.category}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>{formatPrice(product.prices.brandNew || product.prices.ukUsed)}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.3, fontSize: '9px', fontWeight: 800, textTransform: 'uppercase' }}>
                  Specs <ArrowUpRight size={10} />
                </div>
              </div>
            </button>
          ))}

          {query.trim() !== '' && results.length === 0 && (
            <div style={{ padding: '80px', backgroundColor: 'white', textAlign: 'center', opacity: 0.3 }}>
               <p style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.2em' }}>NO MATCHES FOUND FOR: {query.toUpperCase()}</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .search-result-item:hover { background-color: #F9F9F9 !important; }
        .search-overlay-container.dark-mode { background-color: rgba(10, 10, 10, 0.98) !important; }
        body.dark-mode .search-overlay-container { background-color: rgba(10, 10, 10, 0.98) !important; }
        body.dark-mode .search-overlay-container input { color: white !important; border-color: white !important; }
        body.dark-mode .search-overlay-container .search-result-item { background-color: #121212 !important; color: white !important; }
        body.dark-mode .search-overlay-container .search-result-item:hover { background-color: #1A1A1A !important; }
        body.dark-mode .search-overlay-container button svg { color: white !important; }
      `}</style>
    </div>
  );
};

export default SearchOverlay;
