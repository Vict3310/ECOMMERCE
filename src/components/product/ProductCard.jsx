import React, { useState } from 'react';
import { ShoppingCart, ArrowUpRight, Scale, Heart } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import WishlistFolders from '../layout/WishlistFolders';

const ProductCard = ({ product, onClick }) => {
  const { addToCart, formatPrice, toggleComparison, comparisonList, wishlist, showNotification } = useAppContext();
  const [condition, setCondition] = useState('brandNew');
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const isComparing = comparisonList?.find(p => p.id === product.id);
  const isWishlisted = wishlist?.find(p => p.id === product.id);

  const currentPrice = product.prices[condition];
  const hasMultiplePrices = product.prices.brandNew && product.prices.ukUsed;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, condition);
    showNotification('ITEM ADDED TO CART', 'success');
  };

  const stockCount = Number(product?.stock ?? product?.quantity ?? product?.qty ?? 0);
  const isOutOfStock = stockCount === 0;
  const isLowStock = stockCount > 0 && stockCount < 5;

  return (
    <>
      <div className="product-card product-card-mobile thin-border-right thin-border-bottom" style={{ padding: '28px', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', boxSizing: 'border-box' }}>

        {/* Wishlist Toggle (Elite 10) */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsWishlistModalOpen(true); }}
          style={{
            position: 'absolute', top: '24px', right: '24px', zIndex: 10,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '12px', borderRadius: '2px', backgroundColor: 'var(--bg-secondary)',
            color: isWishlisted ? '#FF3B3B' : 'var(--text-primary)',
            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          className="wishlist-btn-hover"
        >
          <Heart size={18} fill={isWishlisted ? "#FF3B3B" : "none"} />
        </button>

      {/* Stock Status Badges (Elite Inventory) */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10, display: 'flex', gap: '8px' }}>
         {isOutOfStock ? (
           <span style={{ padding: '6px 12px', backgroundColor: '#FF3B3B', color: '#FFF', fontSize: '9px', fontWeight: 900, borderRadius: '2px', letterSpacing: '0.1em' }}>SOLD OUT</span>
         ) : isLowStock ? (
           <span style={{ padding: '6px 12px', backgroundColor: 'var(--brand-blue)', color: '#FFF', fontSize: '9px', fontWeight: 900, borderRadius: '2px', letterSpacing: '0.1em' }} className="pulse">LOW STOCK</span>
         ) : null}
         {product.isDeal && <span style={{ padding: '6px 12px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', fontSize: '9px', fontWeight: 900, borderRadius: '2px', letterSpacing: '0.1em' }}>ELITE DEAL</span>}
      </div>

      {/* Product Image & Link (Simulated) */}
      <div 
        onClick={onClick} 
        className="product-card-mobile-img"
        style={{ cursor: 'pointer', position: 'relative', width: '100%', aspectRatio: '0.9', overflow: 'hidden', marginBottom: '32px' }}
      >
        <img 
          src={product.image ? (product.image.includes('unsplash.com') ? `${product.image.split('?')[0]}?auto=format&fit=crop&q=80&w=600` : product.image) : ''} 
          alt={product.name || 'Product image'} 
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'var(--product-drop-shadow, none)', transition: 'filter 0.25s ease' }} 
        />
        <div className="view-details" style={{ 
          position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.08)', 
          backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
          opacity: 0, transition: 'opacity 0.25s ease' 
        }}>
           <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              View Specs <ArrowUpRight size={14} />
           </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.04em' }}>{product.name}</h3>
            <p style={{ fontSize: '24px', fontWeight: 800, color: isOutOfStock ? '#FF3B3B' : 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              {isOutOfStock ? 'OUT OF STOCK' : formatPrice(currentPrice)}
            </p>
            <span style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '0.1em', fontWeight: 800 }}>{product.brand} / {product.category}</span>
          </div>
        </div>
        
        {/* Condition Toggle */}
        {hasMultiplePrices && (
          <div style={{ display: 'flex', border: 'var(--border-thin)', width: 'fit-content', marginBottom: '24px', marginTop: '16px' }}>
            <button 
              className="condition-btn"
              onClick={(e) => { e.stopPropagation(); setCondition('brandNew'); }}
              style={{ 
                padding: '6px 16px', fontSize: '10px', fontWeight: 800, 
                backgroundColor: condition === 'brandNew' ? 'var(--text-primary)' : 'transparent',
                color: condition === 'brandNew' ? 'var(--bg-primary)' : 'inherit',
                textTransform: 'uppercase'
              }}
            >
              New
            </button>
            <button 
              className="condition-btn"
              onClick={(e) => { e.stopPropagation(); setCondition('ukUsed'); }}
              style={{ 
                padding: '6px 16px', fontSize: '10px', fontWeight: 800, 
                backgroundColor: condition === 'ukUsed' ? 'var(--text-primary)' : 'transparent',
                color: condition === 'ukUsed' ? 'var(--bg-primary)' : 'inherit',
                borderLeft: 'var(--border-thin)',
                textTransform: 'uppercase'
              }}
            >
              UK Used
            </button>
          </div>
        )}

      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1px', flexWrap: 'nowrap', backgroundColor: 'var(--border-thin)', border: 'var(--border-thin)' }}>
        <button 
          disabled={!currentPrice || isOutOfStock}
          onClick={handleAddToCart}
          className="cart-btn-text"
          style={{ 
            flex: '1 1 0',
            minWidth: 0,
            padding: '18px 14px',
            backgroundColor: isOutOfStock ? 'var(--bg-secondary)' : 'var(--brand-blue)',
            color: isOutOfStock ? 'var(--text-primary)' : 'var(--bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
            opacity: isOutOfStock ? 0.4 : 1,
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          <ShoppingCart size={14} className="hide-mobile-actions" /> {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); toggleComparison(product); }}
          style={{ 
            flex: '1 1 0',
            minWidth: 0,
            padding: '18px 14px',
            backgroundColor: isComparing ? 'var(--text-primary)' : 'var(--bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
            color: isComparing ? 'var(--bg-primary)' : 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          className="cart-btn-text"
        >
          <Scale size={14} color={isComparing ? "var(--bg-primary)" : "var(--text-primary)"} className="hide-mobile-actions" /> {isComparing ? 'SELECTED' : 'COMPARE'}
        </button>
      </div>

      <style>{`
        .product-card:hover .view-details { opacity: 1; }
        .whatsapp-btn-hover:hover { background-color: transparent !important; }

        @media (max-width: 640px) {
          .product-card-mobile { padding: 12px !important; }
          .product-card-mobile-img { margin-bottom: 12px !important; }
          .product-card-mobile h3 { font-size: 13px !important; margin-bottom: 2px !important; }
          .product-card-mobile p  { font-size: 13px !important; margin-bottom: 4px !important; }
          .product-card-mobile span { font-size: 9px !important; }
          .product-card-mobile .condition-btn { padding: 4px 8px !important; font-size: 9px !important; }
          .product-card-mobile .cart-btn-text { padding: 12px 4px !important; font-size: 8px !important; gap: 4px !important; white-space: normal !important; line-height: 1.2 !important; text-align: center; }
          .hide-mobile-actions { display: none !important; }
          .wishlist-btn-hover { padding: 6px !important; top: 8px !important; right: 8px !important; }
        }
      `}</style>
    </div>

    {/* Wishlist Folders Modal */}
    <WishlistFolders
      isOpen={isWishlistModalOpen}
      onClose={() => setIsWishlistModalOpen(false)}
      product={product}
    />
    </>
  );
};

export default ProductCard;
