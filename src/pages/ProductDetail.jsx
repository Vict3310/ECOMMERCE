import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Phone, ChevronLeft, ShieldCheck, Zap, Truck, Scale, ExternalLink, CheckCircle, Heart, MessageCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/product/ProductCard';
import ReviewSection from '../components/product/ReviewSection';
import ProductMagnifier from '../components/product/ProductMagnifier';
import { getProductGalleryImages } from '../utils/productImages';

function ProductDetailImageColumn({ product }) {
  const galleryImages = useMemo(() => getProductGalleryImages(product), [product]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  return (
    <div className="thin-border-right mobile-p-24" style={{ padding: '80px 80px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden', gap: '24px' }}>
      <ProductMagnifier
        key={`${product.id}-${galleryImages[activeImageIndex] || '0'}`}
        src={galleryImages[activeImageIndex] || product.image}
        alt={product.name}
      />
      {galleryImages.length > 1 && (
        <div
          className="mobile-horizontal-scroll"
          role="tablist"
          aria-label="Product photos"
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: '100%',
            padding: '4px',
          }}
        >
          {galleryImages.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === activeImageIndex}
              onClick={() => setActiveImageIndex(i)}
              style={{
                width: '72px',
                height: '72px',
                padding: 0,
                border: i === activeImageIndex ? '2px solid var(--brand-blue)' : 'var(--border-thin)',
                borderRadius: '2px',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-primary)',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </button>
          ))}
        </div>
      )}
      <span style={{ position: 'absolute', bottom: '24px', left: '24px', fontSize: '9px', fontWeight: 800, opacity: 0.3, letterSpacing: '0.1em' }} className="hide-on-mobile">HOVER TO MAGNIFY DETAILS</span>
    </div>
  );
}

const ProductDetail = ({ product, onBack, onNavigate }) => {
  const { siteSettings, addToCart, formatPrice, toggleWishlist, wishlist, products, showNotification } = useAppContext();
  const isWishlisted = wishlist?.find(p => p.id === product?.id);
  const condition = 'brandNew';
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || 'Standard');
  const [recommendationType, setRecommendationType] = useState('similar');
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product]);

  const stockCount = Number(product?.stock ?? product?.quantity ?? product?.qty ?? 0);
  const isOutOfStock = stockCount === 0;
  const isLowStock = stockCount > 0 && stockCount < 5;


  if (!product) return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={onBack} style={{ letterSpacing: '0.2em', opacity: 0.5 }}>BACK TO SHOP</button>
    </div>
  );

  const currentPrice = product.prices ? product.prices[condition] : null;

  const handleAddToCart = () => {
    addToCart(product, condition, selectedColor);
    showNotification('ITEM ADDED TO CART', 'success');
  };

  const handleBookPickup = () => {
    const message = `I am ready to book a pickup for this ${product.name} (${condition.toUpperCase()}). Is this unit still available at your Ikeja office?`;
    const url = `https://wa.me/${siteSettings.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fade-in">
      <Helmet>
        <title>{`${product.name} | ${condition.toUpperCase()} | Ifeco Gadgets`}</title>
        <meta name="description" content={`Buy ${product.name} in Lagos. Authentic ${product.category} from Ifeco Gadgets Computer Village. Grade A++ ${condition} tech.`} />
        {/* OpenGraph for WhatsApp/Social (Elite 10) */}
        <meta property="og:title" content={`${product.name} - ${formatPrice(currentPrice)}`} />
        <meta property="og:description" content={`Premium ${condition.toUpperCase()} ${product.category}. Visit Ifeco Gadgets Ikeja to close the deal.`} />
        <meta property="og:image" content={getProductGalleryImages(product)[0] || product.image} />
        <meta property="og:type" content="product" />
      </Helmet>
      {/* Back Header */}
      <div className="thin-border-bottom" style={{ height: '64px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.6 }}>
            <ChevronLeft size={16} /> Back to Shop
          </button>
        </div>
      </div>

      <div className="container grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', minHeight: '80vh' }}>
        
        <ProductDetailImageColumn key={product.id} product={product} />

        {/* Right: Info Container */}
        <div className="mobile-p-24" style={{ padding: '80px' }}>
          <div style={{ marginBottom: '48px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, letterSpacing: '0.2em' }}>{product.brand} / {product.category}</span>
            <h1 style={{ fontSize: '48px', margin: '16px 0 24px 0', letterSpacing: '-0.04em' }}>{product.name}</h1>
            
            {/* Color Selection (Elite Upgrade) */}
            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <label style={{ fontSize: '10px', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase', marginBottom: '16px', display: 'block' }}>Choose Aesthetic / Color</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {product.colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{ 
                        padding: '12px 20px', 
                        fontSize: '11px', 
                        fontWeight: 800, 
                        border: 'var(--border-thin)',
                        backgroundColor: selectedColor === color ? 'var(--text-primary)' : 'var(--bg-secondary)',
                        color: selectedColor === color ? 'var(--bg-primary)' : 'var(--text-primary)',
                        textTransform: 'uppercase',
                        borderRadius: '2px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p style={{ fontSize: '32px', fontWeight: 800, marginBottom: '32px' }}>{formatPrice(currentPrice)}</p>

            {/* Elite Metrics Card (Epic 14) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '48px' }}>
               <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', border: isLowStock ? '1px solid var(--brand-blue)' : 'var(--border-thin)', borderRadius: '2px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, display: 'block', marginBottom: '8px' }}>AVAILABILITY</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOutOfStock ? '#FF3B3B' : isLowStock ? 'var(--brand-blue)' : '#4CAF50' }} className={isLowStock ? 'pulse' : ''} />
                    <span style={{ fontSize: '16px', fontWeight: 800 }}>{isOutOfStock ? 'SOLD OUT' : isLowStock ? `LOW STOCK (${stockCount})` : 'IN STOCK'}</span>
                  </div>
               </div>
               <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', border: 'var(--border-thin)', borderRadius: '2px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, display: 'block', marginBottom: '8px' }}>STORAGE CAP.</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={14} color="var(--brand-blue)" />
                    <span style={{ fontSize: '16px', fontWeight: 800 }}>{product.specs?.Storage || '128 GB'}</span>
                  </div>
               </div>
            </div>
          </div>

          {/* High-Intent Action Buttons (Epic 16) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '48px' }}>
            <button 
              onClick={handleBookPickup} 
              disabled={isOutOfStock}
              style={{ width: '100%', padding: '24px', backgroundColor: isOutOfStock ? 'var(--bg-secondary)' : 'var(--brand-blue)', color: isOutOfStock ? 'var(--text-primary)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '2px', opacity: isOutOfStock ? 0.3 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
            >
              <Phone size={16} strokeWidth={3} fill={isOutOfStock ? "var(--text-primary)" : "#fff"} /> {isOutOfStock ? 'OUT OF STOCK' : 'BOOK FOR PICKUP (IKEJA)'}
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleAddToCart} 
                disabled={isOutOfStock}
                style={{ flex: 1, padding: '20px', backgroundColor: isOutOfStock ? 'var(--bg-secondary)' : 'var(--text-primary)', border: 'var(--border-thin)', color: isOutOfStock ? 'var(--text-primary)' : 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', borderRadius: '2px', opacity: isOutOfStock ? 0.3 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
              >
                {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
              </button>
              <button 
                onClick={() => toggleWishlist(product)}
                style={{ 
                  padding: '20px', width: '64px', backgroundColor: isWishlisted ? 'rgba(255,59,59,0.1)' : 'var(--bg-secondary)', 
                  border: isWishlisted ? '1px solid rgba(255,59,59,0.3)' : 'var(--border-thin)', 
                  color: isWishlisted ? '#FF3B3B' : 'var(--text-primary)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px' 
                }}
              >
                <Heart size={20} fill={isWishlisted ? "#FF3B3B" : "none"} />
              </button>
            </div>
            
            {/* Transparency Link (Epic 14) */}
            <a 
              href="https://checkcoverage.apple.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textAlign: 'center', fontSize: '10px', fontWeight: 800, opacity: 0.5, marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
            >
              VERIFY HARDWARE SERIAL (APPLE.COM) <ExternalLink size={12} />
            </a>
          </div>

          {/* Value Props */}
          {/* Elite Condition Guide (Elite 10) */}
          <div style={{ marginTop: '48px', padding: '32px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--brand-blue)', borderRadius: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '2px', backgroundColor: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                <ShieldCheck size={20} />
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 800 }}>THE BRAND QUALITY PROMISE.</h4>
            </div>
            <p style={{ fontSize: '13px', opacity: 0.7, lineHeight: 1.6, marginBottom: '16px' }}>
              {condition === 'ukUsed' 
                ? "This UK Used unit has passed our 45-point diagnostic check. Guaranteed Battery Health > 85%, Grade A++ cosmetic condition, and 100% original hardware parts."
                : "This unit is Brand New, Factory Sealed, and comes with a 12-Month International Warranty. Guaranteed never activated."}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ padding: '6px 12px', backgroundColor: 'rgba(51, 120, 255, 0.1)', color: 'var(--brand-blue)', fontSize: '9px', fontWeight: 800, borderRadius: '2px' }}>✓ 12-MONTH WARRANTY</span>
              <span style={{ padding: '6px 12px', backgroundColor: 'rgba(51, 120, 255, 0.1)', color: 'var(--brand-blue)', fontSize: '9px', fontWeight: 800, borderRadius: '2px' }}>✓ 7-DAY REPLACEMENT</span>
            </div>
          </div>

          <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', opacity: 0.6, marginTop: '48px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Truck size={20} />
              <div><h4 style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>Delivery</h4><p style={{ fontSize: '11px' }}>Same-day in Lagos Main/Island</p></div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Scale size={20} />
              <div><h4 style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>Pay on Delivery</h4><p style={{ fontSize: '11px' }}>Available for Ikeja Pickup</p></div>
            </div>
          </div>

          {/* Product Description */}
          {product.description && (
            <div 
              style={{ marginTop: '48px', paddingTop: '48px', borderTop: 'var(--border-thin)', opacity: 0.8, fontSize: '14px', lineHeight: 1.8, color: 'var(--text-primary)' }}
              dangerouslySetInnerHTML={{ __html: product.description }} 
            />
          )}
        </div>
      </div>

      {/* Section: Reviews & Real-time Social Proof (Phase 1-C) */}
      <ReviewSection productId={product.id} />

      <section style={{ padding: '100px 24px', backgroundColor: 'var(--bg-primary)', borderTop: 'var(--border-thin)' }}>
        <div className="container">
           <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
              <MessageCircle size={32} style={{ marginBottom: '24px', color: 'var(--brand-blue)' }} />
              <h3 style={{ fontSize: '24px', letterSpacing: '-0.02em', fontWeight: 800, marginBottom: '16px' }}>ITEM LOW IN STOCK?</h3>
              <p style={{ fontSize: '14px', opacity: 0.6, marginBottom: '32px' }}>Subscribe to our elite notification channel. We will alert you the moment this unit is back in our Ikeja/Lagos hubs.</p>
              
              <div style={{ display: 'flex', border: 'var(--border-thin)', borderRadius: '2px', overflow: 'hidden', padding: '4px', backgroundColor: 'var(--bg-secondary)' }}>
                 <input type="email" placeholder="YOUR ELITE EMAIL" style={{ flex: 1, padding: '16px 24px', border: 'none', backgroundColor: 'transparent', fontSize: '11px', fontWeight: 800, outline: 'none' }} />
                 <button style={{ padding: '16px 32px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', fontSize: '10px', fontWeight: 1000, borderRadius: '2px' }}>NOTIFY ME</button>
              </div>
           </div>
        </div>
      </section>

      <section className="thin-border-top" style={{ padding: '100px 0', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <h2 style={{ fontSize: '14px', letterSpacing: '0.2em', fontWeight: 800, marginBottom: '60px', opacity: 0.5 }}>TECHNICAL SPECIFICATIONS.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', backgroundColor: '#E5E5E5', border: '0.5px solid #E5E5E5' }}>
            {product.specs && Object.entries(product.specs).map(([key, value]) => (
              <div key={key} style={{ padding: '40px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                <span style={{ fontSize: '10px', opacity: 0.4, fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>{key}</span>
                <p style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upsell Carousel (Epic 16 & User Request) */}
      <section className="thin-border-top" style={{ padding: '100px 0', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Elite Selection</span>
              <h2 style={{ fontSize: '32px', letterSpacing: '-0.04em', fontWeight: 800, marginTop: '12px' }}>RECOMMENDED FOR YOU</h2>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {['similar', 'trending'].map(type => (
                <button
                  key={type}
                  onClick={() => setRecommendationType(type)}
                  style={{
                    padding: '12px 18px',
                    backgroundColor: recommendationType === type ? 'var(--text-primary)' : 'var(--bg-secondary)',
                    color: recommendationType === type ? 'var(--bg-primary)' : 'var(--text-primary)',
                    border: 'var(--border-thin)',
                    borderRadius: '2px',
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  {type === 'similar' ? 'Similar Products' : 'Trending'}
                </button>
              ))}
            </div>
          </div>

          <div className="mobile-horizontal-scroll" style={{ display: 'flex', gap: '1px', backgroundColor: 'var(--border-thin)', border: 'var(--border-thin)', overflowX: 'auto', paddingBottom: '16px' }}>
            {products
              .filter(item => item.id !== product.id)
              .filter(item => recommendationType === 'similar'
                ? item.category === product.category
                : item.rating >= 4.5 || item.isNew)
              .slice(0, 6)
              .map(item => (
                <div key={item.id} className="thin-border-right thin-border-bottom" style={{ minWidth: '320px', backgroundColor: 'var(--bg-primary)' }}>
                  <ProductCard product={item} onClick={() => { window.scrollTo(0, 0); onNavigate?.('detail', item); }} />
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
