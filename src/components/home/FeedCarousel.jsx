import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ArrowLeft, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollToPlugin);

import { useAppContext } from '../../context/AppContext';

const FeedCarousel = ({ onExplore }) => {
  const { feedItems } = useAppContext();
  const containerRef = useRef(null);

  const scroll = (direction) => {
    const scrollAmount = 400;
    gsap.to(containerRef.current, {
      scrollTo: { x: containerRef.current.scrollLeft + (direction === 'next' ? scrollAmount : -scrollAmount) },
      duration: 0.8,
      ease: "power2.out"
    });
  };

  return (
    <div style={{ padding: '120px 0', borderTop: 'var(--border-thin)', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px', gap: '24px' }}>
         <div>
            <h2 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.4em', marginBottom: '16px' }}>
              <span style={{ color: 'var(--brand-blue)' }}>FEED</span> CAROUSEL.
            </h2>
            <p style={{ fontSize: '18px', fontWeight: 800, opacity: 0.4 }}>Latest and trending consumer tech.</p>
         </div>
         <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => scroll('prev')} style={{ width: '56px', height: '56px', border: 'var(--border-thin)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
               <ArrowLeft size={20} />
            </button>
            <button onClick={() => scroll('next')} style={{ width: '56px', height: '56px', border: 'var(--border-thin)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
               <ArrowRight size={20} />
            </button>
         </div>
      </div>

      <div 
        ref={containerRef}
        style={{ 
          display: 'flex', gap: '2px', overflowX: 'auto', scrollSnapType: 'x mandatory', 
          msOverflowStyle: 'none', scrollbarWidth: 'none', padding: '0 5%'
        }}
        className="hide-scrollbar"
      >
         {feedItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => onExplore(item.category)}
              style={{ 
                flex: '0 0 380px', height: '500px', cursor: 'pointer', position: 'relative',
                scrollSnapAlign: 'start', overflow: 'hidden'
              }}
              className="feed-card"
            >
               <img 
                  src={item.image.includes('unsplash.com') ? `${item.image.split('?')[0]}?auto=format&fit=crop&q=80&w=800` : item.image} 
                  alt={item.title} 
                  loading="lazy"
                  style={{ 
                    position: 'absolute', inset: 0, 
                    width: '100%', height: '100%', 
                    objectFit: 'cover',
                    filter: 'grayscale(1) brightness(0.8)', transition: 'transform 0.8s'
                  }} 
                  className="card-bg" 
               />
               <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
               <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.2em', color: '#FFF', opacity: 0.5, textTransform: 'uppercase' }}>{item.category}</span>
                  <h4 style={{ fontSize: '24px', fontWeight: 800, color: '#FFF', marginTop: '8px' }}>{item.title}</h4>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default FeedCarousel;
