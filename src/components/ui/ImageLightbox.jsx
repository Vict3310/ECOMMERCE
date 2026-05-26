import React, { useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';

const ImageLightbox = ({ src, alt, isOpen, onClose }) => {
  useEffect(() => {
    // Prevent background scrolling when lightbox is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fade-in"
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 99999, 
        backgroundColor: 'var(--bg-primary)', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em', opacity: 0.4, textTransform: 'uppercase' }}><ZoomIn size={14} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}/> ULTRA-ZOOM</p>
        <button onClick={onClose} className="hover-scale" style={{ padding: '12px', cursor: 'pointer', backgroundColor: 'var(--bg-secondary)', borderRadius: '50%' }}>
          <X size={24} color="var(--text-primary)" strokeWidth={1.5} />
        </button>
      </div>

      <img 
        src={src} 
        alt={alt}
        style={{
          width: '90vw',
          height: '80vh',
          objectFit: 'contain',
          cursor: 'zoom-in',
          filter: 'drop-shadow(0 40px 100px rgba(0,0,0,0.15))'
        }}
        onClick={(e) => {
          // Simple toggle for an ultra-aggressive zoom state on click
          if(e.target.style.transform === 'scale(1.5)') {
             e.target.style.transform = 'scale(1)';
             e.target.style.cursor = 'zoom-in';
          } else {
             e.target.style.transform = 'scale(1.5)';
             e.target.style.cursor = 'zoom-out';
          }
          e.target.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        }}
      />
    </div>
  );
};

export default ImageLightbox;
