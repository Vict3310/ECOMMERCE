import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
      <p style={{ fontSize: '10px', letterSpacing: '0.4em', opacity: 0.3, fontWeight: 700 }}>404</p>
      <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em' }}>Page Not Found</h1>
      <p style={{ opacity: 0.4, fontSize: '14px' }}>The page you're looking for doesn't exist.</p>
      <button
        type="button"
        onClick={() => navigate('/')}
        style={{
          padding: '14px 32px',
          backgroundColor: 'var(--brand-blue)',
          color: '#fff',
          border: 'none',
          borderRadius: '40px',
          fontWeight: 800,
          fontSize: '11px',
          letterSpacing: '0.1em',
          cursor: 'pointer',
        }}
      >
        GO HOME
      </button>
    </div>
  );
};

export default NotFound;
