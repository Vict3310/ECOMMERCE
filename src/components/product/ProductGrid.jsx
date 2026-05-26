import React, { useRef } from 'react';
import ProductCard from './ProductCard';
import { useAppContext } from '../../context/AppContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ProductGrid = ({ onProductClick, filter, limit }) => {
  const { products } = useAppContext();
  const containerRef = useRef(null);

  let filteredProducts = !filter || filter === 'all' 
    ? products 
    : products.filter(p => p.category.toLowerCase() === filter.toLowerCase());

  if (limit) {
    filteredProducts = filteredProducts.slice(0, limit);
  }

  useGSAP(() => {
    gsap.from(".product-gsap-target", {
      y: 60,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: "power4.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    });
  }, { scope: containerRef, dependencies: [filteredProducts.length] });

  return (
    <section ref={containerRef} className="thin-border-bottom" style={{ borderTop: 'var(--border-thin)', paddingBottom: '0' }}>
      <div className="container" style={{ padding: '0' }}>
        <div 
          className="product-grid-container thin-border-left product-grid-2" 
          style={{ 
            display: 'grid', 
            gap: '0'
          }}
        >
          {filteredProducts.map(product => (
            <div key={product.id} className="product-gsap-target">
               <ProductCard product={product} onClick={(action) => action === 'cart' ? onProductClick('cart') : onProductClick(product)} />
            </div>
          ))}

          {/* Empty state if no products found */}
          {filteredProducts.length === 0 && (
            <div style={{ padding: '120px 24px', textAlign: 'center', gridColumn: '1 / -1', borderRight: 'var(--border-thin)', borderBottom: 'var(--border-thin)' }}>
               <p style={{ fontSize: '11px', letterSpacing: '0.2em', opacity: 0.3, fontWeight: 800 }}>NEW SHIPMENT ARRIVING SOON...</p>
            </div>
          )}

          {/* Skeleton placeholders for refined aesthetics */}
          {filteredProducts.length === 0 && Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="thin-border-right thin-border-bottom" style={{ height: '400px', padding: '48px', backgroundColor: 'var(--bg-primary)' }}>
               <div className="skeleton" style={{ width: '100%', height: '200px', marginBottom: '24px' }} />
               <div className="skeleton" style={{ width: '60%', height: '24px', marginBottom: '12px' }} />
               <div className="skeleton" style={{ width: '40%', height: '16px' }} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .product-grid-container { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
        @media (max-width: 640px) {
          .product-grid-container { grid-template-columns: repeat(2, 1fr) !important; }
          .desktop-links { display: none !important; }
        }
      `}</style>
    </section>
  );
};

export default ProductGrid;
