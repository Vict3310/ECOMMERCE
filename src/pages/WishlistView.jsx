import React from 'react';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/product/ProductCard';

const WishlistView = ({ onNavigate }) => {
  const { wishlist } = useAppContext();

  if (wishlist.length === 0) {
    return (
      <div className="fade-in container" style={{ padding: '120px 24px', textAlign: 'center', height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <Heart size={80} style={{ opacity: 0.05 }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <ShoppingBag size={24} style={{ opacity: 0.2 }} />
          </div>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>YOUR WISHLIST IS EMPTY.</h2>
        <p style={{ opacity: 0.5, fontSize: '12px', marginBottom: '40px', maxWidth: '300px' }}>Save your elite gadgets here and return to close the deal via WhatsApp later.</p>
        <button 
          onClick={() => onNavigate('shop')}
          style={{ padding: '16px 32px', backgroundColor: 'var(--brand-blue)', color: '#fff', fontSize: '11px', fontWeight: 800, borderRadius: '50px', letterSpacing: '0.1em' }}
        >
          EXPLORE CATALOG <ArrowRight size={14} style={{ marginLeft: '8px' }} />
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in container mobile-p-24" style={{ padding: '80px', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px' }}>
         <div>
            <h1 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: '8px' }}>Saved.</h1>
            <p style={{ opacity: 0.5, fontSize: '11px', letterSpacing: '0.1em', fontWeight: 800 }}>YOUR CURATED GADGET COLLECTION</p>
         </div>
         <p style={{ fontSize: '12px', fontWeight: 800, opacity: 0.4 }}>{wishlist.length} ITEMS SAVED</p>
      </div>

      <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1px', backgroundColor: 'var(--border-thin)', border: 'var(--border-thin)' }}>
        {wishlist.map(product => (
          <div key={product.id} style={{ backgroundColor: 'var(--bg-primary)' }}>
            <ProductCard
              product={product}
              onClick={(arg) => (arg === 'cart' ? onNavigate('cart') : onNavigate('detail', product))}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistView;
