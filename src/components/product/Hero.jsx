import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Hero = () => {
  const { siteSettings } = useAppContext();

  return (
    <section className="thin-border-bottom" style={{ height: '70vh', minHeight: '500px', display: 'flex', overflow: 'hidden' }}>
      <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        
        <div style={{ maxWidth: '600px', paddingRight: '48px' }}>
          <h1 style={{ fontSize: '120px', marginBottom: '24px', letterSpacing: '-0.06em', wordBreak: 'break-word', lineHeight: "0.85" }}>
            ELITE <br/> TECH.
          </h1>
          <p style={{ fontSize: '14px', marginBottom: '40px', maxWidth: '400px', letterSpacing: '-0.01em', opacity: 0.8 }}>
            Discover professional-grade gadgets at the heart of Computer Village. 
            Same-day delivery in Lagos. Uncompromising quality.
          </p>
          <button style={{ 
            padding: '16px 32px', border: 'var(--border-thin)', background: '#121212', 
            color: 'white', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em'
          }}>
            Explore Shop <ChevronRight size={14} />
          </button>
        </div>

        <div className="thin-border-left" style={{ flex: 1, height: '100%', position: 'relative' }}>
          <img 
            src={siteSettings.heroBanner} 
            alt="Elite Technology" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 991px) {
          section { flex-direction: column; height: auto !important; }
          .container { padding: 80px 24px; flex-direction: column; }
          h1 { fontSize: 80px !important; }
          .thin-border-left { border-left: none !important; border-top: var(--border-thin); height: 400px !important; margin-top: 48px; width: 100%; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
