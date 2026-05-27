import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

import { useAppContext } from '../../context/AppContext';

const HeroCarousel = ({ onExplore }) => {
  const { heroSlides } = useAppContext();
  const [current, setCurrent] = useState(0);
  const slideRef = useRef(null);
  const progressRef = useRef(null);
  const timerRef = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  }, [heroSlides.length]);

  useEffect(() => {
    // Reset timer on slide change
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(nextSlide, 6000);

    // Animation
    gsap.fromTo(slideRef.current, 
      { opacity: 0, scale: 1.1 },
      { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }
    );

    gsap.fromTo(".hero-text",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.3, stagger: 0.1, ease: "power2.out" }
    );

    gsap.fromTo(progressRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 6, ease: "none" }
    );

    return () => clearInterval(timerRef.current);
  }, [current, nextSlide]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '85vh', backgroundColor: '#000', overflow: 'hidden' }}>
      {/* Slides */}
      <div ref={slideRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
         {heroSlides[current].image?.match(/\.(mp4|webm|mov|ogg)$/i) ? (
           <video 
              src={heroSlides[current].image} 
              autoPlay
              muted
              loop
              playsInline
              style={{ 
                position: 'absolute', inset: 0, 
                width: '100%', height: '100%', 
                objectFit: 'cover', 
                filter: 'brightness(0.6)',
                zIndex: 0
              }} 
           />
         ) : (
           <img 
              src={heroSlides[current].image} 
              alt={heroSlides[current].title} 
              fetchpriority="high"
              style={{ 
                position: 'absolute', inset: 0, 
                width: '100%', height: '100%', 
                objectFit: 'cover', 
                filter: 'brightness(0.6)',
                zIndex: 0
              }} 
           />
         )}
         
         <div className="container hero-content" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 2 }}>
            <h1 className="hero-text hero-title" style={{ color: '#FFF', letterSpacing: '-0.06em', lineHeight: 0.9, marginBottom: '24px' }}>
              {heroSlides[current].title}
            </h1>
            <p className="hero-text" style={{ fontSize: '12px', fontWeight: 800, color: '#FFF', opacity: 0.5, letterSpacing: '0.3em', marginBottom: '48px', maxWidth: '500px' }}>
              {heroSlides[current].subtitle}
            </p>
            <button 
              className="hero-text hero-explore-btn"
              onClick={() => onExplore(heroSlides[current].link)}
              style={{ 
                padding: '24px 48px', backgroundColor: '#FFF', color: '#000', 
                fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', 
                letterSpacing: '0.2em', width: 'fit-content', border: 'none',
                display: 'flex', alignItems: 'center', gap: '16px'
              }}
            >
              EXPLORE COLLECTION <ArrowRight size={16} />
            </button>
         </div>
      </div>

      {/* Navigation Controls */}
      <div className="hero-nav" style={{ position: 'absolute', bottom: '64px', right: '64px', display: 'flex', gap: '8px', zIndex: 10 }}>
         <button onClick={prevSlide} className="mobile-nav-btn" style={{ width: '64px', height: '64px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'transparent', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={24} />
         </button>
         <button onClick={nextSlide} className="mobile-nav-btn" style={{ width: '64px', height: '64px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'transparent', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={24} />
         </button>
      </div>

      {/* Progress Indicator */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', zIndex: 5 }}>
         <div ref={progressRef} style={{ height: '100%', backgroundColor: '#FFF', width: '100%', transformOrigin: 'left', transform: 'scaleX(0)' }} />
      </div>

      {/* Slide Counter */}
      <div className="hero-counter" style={{ position: 'absolute', bottom: '64px', left: '64px', color: '#FFF', fontSize: '11px', fontWeight: 800, letterSpacing: '0.3em', opacity: 0.3, zIndex: 5 }}>
         0{current + 1} // 0{heroSlides.length}
      </div>
    </div>
  );
};

export default HeroCarousel;
