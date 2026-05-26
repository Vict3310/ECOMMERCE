import React from 'react';
import { useAppContext } from '../../context/AppContext';

const EliteLoader = () => {
  const { siteSettings } = useAppContext();
  return (
    <div style={{ 
      height: '100vh', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: 'var(--bg-primary)',
      zIndex: 9999
    }}>
      <div className="loader-container" style={{ position: 'relative' }}>
        <div className="pulse-ring" style={{
           position: 'absolute',
           top: '50%',
           left: '50%',
           transform: 'translate(-50%, -50%)',
           width: '120px',
           height: '120px',
           borderRadius: '50%',
           border: '1px solid var(--brand-blue)',
           opacity: 0.1,
           animation: 'loader-pulse 2s infinite ease-out'
        }} />
        
        <h2 style={{ 
          fontSize: 'clamp(10px, 4vw, 14px)', 
          fontWeight: 900, 
          letterSpacing: '0.4em', 
          color: 'var(--brand-blue)',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textAlign: 'center'
        }}>
          {siteSettings?.name?.split(' ')[0] || 'BRAND'} <span style={{ opacity: 0.3 }}>|</span> {siteSettings?.name?.split(' ')[1] || 'NAME'}
        </h2>
        
        <div style={{ 
          marginTop: '16px', 
          height: '1px', 
          width: '40px', 
          backgroundColor: 'var(--brand-blue)', 
          margin: '16px auto',
          position: 'relative',
          overflow: 'hidden'
        }}>
           <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              height: '100%', 
              width: '30%', 
              backgroundColor: '#fff', 
              animation: 'loader-slide 1.5s infinite linear' 
           }} />
        </div>
      </div>

      <style>{`
        @keyframes loader-pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        @keyframes loader-slide {
          0% { left: -30%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default EliteLoader;
