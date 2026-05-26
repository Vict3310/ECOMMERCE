import React, { useLayoutEffect, useRef } from 'react';
import { X, Scale, ArrowRight, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { gsap } from 'gsap';

const ComparisonBar = ({ onCompare }) => {
  const { comparisonList, toggleComparison, darkMode } = useAppContext();
  const barRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (comparisonList.length > 0) {
        gsap.to(barRef.current, { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" });
      } else {
        gsap.to(barRef.current, { y: 150, opacity: 0, duration: 0.4, ease: "power2.in" });
      }
    });
    return () => ctx.revert();
  }, [comparisonList.length]);

  return (
    <div 
      ref={barRef}
      style={{ 
        position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%) translateY(150px)',
        width: 'calc(100% - 64px)', maxWidth: '600px',
        backgroundColor: darkMode ? '#121212' : '#FFFFFF', 
        border: 'var(--border-thin)', borderRadius: '2px',
        zIndex: 2500, boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: 0
      }}
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ backgroundColor: darkMode ? '#1A1A1A' : '#F9F9F9', padding: '10px', borderRadius: '2px' }}>
          <Scale size={20} color="var(--text-primary)" />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {comparisonList.map(p => (
            <div key={p.id} style={{ position: 'relative' }}>
              <img src={p.image} style={{ width: '40px', height: '40px', borderRadius: '2px', border: 'var(--border-thin)', objectFit: 'contain', backgroundColor: 'white' }} />
              <button 
                onClick={() => toggleComparison(p)}
                style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#121212', color: 'white', borderRadius: '2px', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={8} />
              </button>
            </div>
          ))}
          {Array.from({ length: 3 - comparisonList.length }).map((_, i) => (
             <div key={`empty-${i}`} style={{ width: '40px', height: '40px', borderRadius: '2px', border: 'var(--border-thin)', borderStyle: 'dashed', opacity: 0.2 }} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
         <p style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase' }}>{comparisonList.length}/3 SELECTED</p>
         <button 
          onClick={onCompare}
          disabled={comparisonList.length < 2}
          style={{ 
            backgroundColor: '#121212', color: 'white', padding: '12px 20px', borderRadius: '2px',
            fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px',
            opacity: comparisonList.length < 2 ? 0.3 : 1, transition: 'all 0.3s'
          }}
         >
           COMPARE <ArrowRight size={14} />
         </button>
      </div>
    </div>
  );
};

export default ComparisonBar;
