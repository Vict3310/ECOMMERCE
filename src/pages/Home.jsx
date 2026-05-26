import React from 'react';
import ProductGrid from '../components/product/ProductGrid';
import HeroCarousel from '../components/home/HeroCarousel';
import FeedCarousel from '../components/home/FeedCarousel';
import ContactSection from '../components/layout/ContactSection';
import { ShieldCheck, MapPin, Zap, TrendingDown, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import CountdownTimer from '../components/ui/CountdownTimer';

const Home = ({ onProductClick, onShopClick }) => {
  const { products, formatPrice, siteSettings, categoryFilter } = useAppContext();
  const flashDeals = products?.filter(p => p.isDeal) || [];

  return (
    <div className="fade-in">
      <HeroCarousel onExplore={onShopClick} />

      {/* Flash Deals / Clearance Engine (Epic 15) */}
      {flashDeals.length > 0 && (
        <section style={{ padding: '64px 0', borderBottom: 'var(--border-thin)', backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>
          <div className="container">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '8px', backgroundColor: 'var(--brand-blue)', borderRadius: '2px' }}><Zap size={16} color="#fff" fill="#fff" /></div>
                  <h2 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>FLASH DEALS / CLEARANCE</h2>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.5 }}>LIMITED STOCK REMAINING</span>
             </div>

             <div className="hide-scrollbar" style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '24px' }}>
                {flashDeals.map(deal => (
                  <div key={deal.id} onClick={() => onProductClick(deal)} style={{ minWidth: '320px', padding: '32px', backgroundColor: 'var(--bg-secondary)', border: 'var(--border-thin)', borderRadius: '2px', cursor: 'pointer', position: 'relative', transition: 'transform 0.3s ease' }} className="hover-scale">
                    <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                       <div style={{ padding: '6px 12px', backgroundColor: '#FF3B3B', color: '#fff', fontSize: '9px', fontWeight: 900, borderRadius: '2px' }}>-20% OFF</div>
                       <CountdownTimer targetDate={new Date().setHours(23,59,59,999)} />
                    </div>
                    <img 
                      src={deal.image.includes('unsplash.com') ? `${deal.image.split('?')[0]}?auto=format&fit=crop&q=80&w=800` : deal.image} 
                      alt={deal.name} 
                      loading="lazy"
                      style={{ width: '100%', height: '180px', objectFit: 'contain', marginBottom: '24px', filter: 'grayscale(1)' }} 
                    />
                    <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>{deal.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <span style={{ fontSize: '16px', fontWeight: 900, color: '#FF3B3B' }}>{formatPrice(deal.prices?.ukUsed || deal.prices?.brandNew)}</span>
                       <span style={{ fontSize: '12px', opacity: 0.4, textDecoration: 'line-through' }}>{formatPrice((deal.prices?.ukUsed || deal.prices?.brandNew) * 1.25)}</span>
                    </div>
                    <button style={{ marginTop: '24px', width: '100%', padding: '16px', border: 'var(--border-thin)', borderRadius: '2px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                       VIEW DEAL <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
             </div>
          </div>
        </section>
      )}
      
      <div className="thin-border-bottom" style={{ padding: '80px 24px', textAlign: 'center', backgroundColor: 'var(--bg-secondary)' }}>
        <h2 style={{ fontSize: '11px', letterSpacing: '0.3em', fontWeight: 800, textTransform: 'uppercase', opacity: 0.5 }}>
          {categoryFilter === 'all' ? 'CURATED SELECTION' : `DISCOVERING: ${categoryFilter}`}
        </h2>
      </div>

      {/* Trending Feed Carousel */}
      <FeedCarousel onExplore={onShopClick} />

      {/* Featured Products */}
      <ProductGrid onProductClick={onProductClick} filter={categoryFilter} limit={4} />

      {/* Professional Verification Hub (The Trust Gap Solution) */}
      <section className="thin-border-top" style={{ padding: '120px 24px', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '80px', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.3em', opacity: 0.5, marginBottom: '24px' }}>VERIFIED CORPORATE HUB</h3>
              <h2 style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.05em', marginBottom: '32px' }}>A Physical Presence You Can Trust.</h2>
              <p style={{ fontSize: '16px', lineHeight: 1.8, opacity: 0.6, marginBottom: '40px' }}>
                We aren't just a digital storefront. Visit our physical center in the heart of Computer Village, Ikeja, for direct inspections, hardware testing, and instant procurement. 
              </p>
              
              <div style={{ display: 'grid', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '2px' }}><ShieldCheck size={20} color="var(--brand-blue)" /></div>
                  <div><h4 style={{ fontSize: '12px', fontWeight: 800 }}>DIASPORA VERIFIED</h4><p style={{ fontSize: '10px', opacity: 0.5 }}>Secure procurement for family in Nigeria.</p></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '2px' }}><MapPin size={20} color="var(--brand-blue)" /></div>
                  <div><h4 style={{ fontSize: '12px', fontWeight: 800 }}>IKEJA HEADQUARTERS</h4><p style={{ fontSize: '10px', opacity: 0.5 }}>{siteSettings.address}</p></div>
                </div>
              </div>
            </div>

            <div style={{ height: '500px', border: 'var(--border-thin)', borderRadius: '2px', overflow: 'hidden', filter: 'grayscale(1) contrast(1.1)', position: 'relative' }}>
               <iframe 
                src={siteSettings.googleMapsUrl} 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
};

export default Home;
