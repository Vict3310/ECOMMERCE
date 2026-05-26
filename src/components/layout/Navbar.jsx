import { Search, ShoppingBag, Menu, X, User, Moon, Sun, DollarSign, Lock, Heart } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { gsap } from 'gsap';
import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import AdvancedSearch from './AdvancedSearch';

const Navbar = ({ onNavigate, currentView }) => {
  const { cart, darkMode, setDarkMode, currency, setCurrency, userProfile, wishlist, siteSettings } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  
  const navRef = useRef(null);
  const menuRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  // Scroll Listener for Liquid Glass Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isManagement = userProfile?.role === 'owner' || userProfile?.role === 'worker';

  const navLinks = [
    { name: 'Home', view: 'home' },
    { name: 'Shop All', view: 'shop' },
    { name: 'About', view: 'about' },
    { name: 'Contact', view: 'contact' }
  ];

  // GSAP Entrance
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, { y: -100, opacity: 0, duration: 1.2, ease: "power4.out", delay: 0.5 });
    });
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (isMobileMenuOpen) {
        gsap.to(menuRef.current, { x: 0, duration: 0.6, ease: "expo.out" });
        gsap.set(".mobile-nav-item", { x: -20 });
        gsap.to(".mobile-nav-item", { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, delay: 0.2, ease: "power2.out" });
      } else {
        gsap.to(menuRef.current, { x: '100%', duration: 0.6, ease: "expo.in" });
        gsap.to(".mobile-nav-item", { opacity: 0, x: -20, duration: 0.2 });
      }
    });
    return () => ctx.revert();
  }, [isMobileMenuOpen]);

  const handleLinkClick = (link) => {
    onNavigate(link.view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav 
        ref={navRef}
        className="floating-nav"
        style={{ 
          position: 'fixed', top: scrolled ? '12px' : '16px', left: '50%', transform: 'translateX(-50%)',
          width: scrolled ? 'calc(100% - 48px)' : 'calc(100% - 32px)', maxWidth: '1200px', height: scrolled ? '56px' : '64px',
          backgroundColor: darkMode ? (scrolled ? 'rgba(18, 18, 18, 0.05)' : 'rgba(18, 18, 18, 0.02)') : (scrolled ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)'), 
          backdropFilter: scrolled ? 'blur(64px) saturate(210%) contrast(110%) brightness(1.1)' : 'blur(32px) saturate(150%) contrast(100%) brightness(1.1)', 
          border: '1px solid rgba(255, 255, 255, 0.15)', 
          borderRadius: scrolled ? '20px' : '32px',
          display: 'flex', alignItems: 'center', zIndex: 1000, 
          boxShadow: scrolled 
            ? '0 40px 100px rgba(0,0,0,0.1), inset 0 0 12px rgba(255,255,255,0.1), inset 0 0 0 1px rgba(255,255,255,0.2)' 
            : '0 8px 32px rgba(0,0,0,0.05), inset 0 0 12px rgba(255,255,255,0.05)', 
          padding: '0 32px',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          visibility: 'visible', opacity: 1
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', height: '100%' }}>
          
          {/* Left: Branding */}
          <div 
            onClick={() => onNavigate('home')} 
            className="logo-text" 
            style={{ 
              fontSize: '18px', 
              fontWeight: 800, 
              letterSpacing: '-0.05em', 
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
          >
            <span className="hollow-text">{siteSettings?.name?.split(' ')[0] || 'BRAND'}</span>{' '}<span className="solid-blue">{siteSettings?.name?.split(' ').slice(1).join(' ') || 'NAME'}</span>
          </div>

          {/* Center: Desktop Nav Items */}
          <div className="desktop-links" style={{ display: 'flex', gap: '32px' }}>
            {navLinks.map((link) => (
              <button 
                key={link.name} 
                onClick={() => handleLinkClick(link)} 
                style={{ 
                  fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', 
                  letterSpacing: '0.1em', color: 'var(--text-primary)',
                  opacity: (currentView === link.view) ? 1 : 0.5,
                  transition: 'var(--transition-smooth)'
                }}
                className="nav-link-hover"
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px', marginRight: '8px' }} className="desktop-links">
              <button onClick={() => setDarkMode(!darkMode)} className="hover-scale" style={{ opacity: 0.6 }}>
                {darkMode ? <Sun size={16} color="var(--text-primary)" /> : <Moon size={16} color="var(--text-primary)" />}
              </button>
              <button onClick={() => setCurrency(currency === 'NGN' ? 'USD' : 'NGN')} style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-primary)', opacity: 0.6 }} className="hover-scale">
                {currency}
              </button>
            </div>

            <div onClick={() => setIsAdvancedSearchOpen(true)} className="desktop-links" style={{ opacity: 0.6, cursor: 'pointer' }}>
               <Search size={18} strokeWidth={2.5} color="var(--text-primary)" />
            </div>

            <div onClick={() => onNavigate('wishlist')} style={{ position: 'relative', cursor: 'pointer', opacity: 0.6 }} className="desktop-links hover-scale">
               <Heart size={18} strokeWidth={2.5} color="var(--text-primary)" fill={wishlist?.length > 0 ? "var(--text-primary)" : "none"} />
               {wishlist?.length > 0 && (
                 <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#FF3B3B', color: '#fff', fontSize: '8px', width: '14px', height: '14px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                   {wishlist.length}
                 </span>
               )}
            </div>

            <div onClick={() => onNavigate('cart')} style={{ position: 'relative', cursor: 'pointer' }} className="hover-scale">
              <ShoppingBag size={18} strokeWidth={2.5} color="var(--text-primary)" />
              {cart?.length > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--brand-blue)', color: '#fff', fontSize: '8px', width: '14px', height: '14px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {cart.length}
                </span>
              )}
            </div>

            {/* Minimalist Staff Link (Only visible when logged in as staff/owner) */}
            {isManagement && (
              <button 
                onClick={() => onNavigate('admin')} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: darkMode ? "#E5FF00" : "var(--brand-blue)",
                  opacity: 0.8
                }} 
                className="desktop-links hover-scale"
              >
                 <User size={18} strokeWidth={2.5} />
              </button>
            )}
            
            <button className="mobile-trigger" onClick={() => setIsMobileMenuOpen(true)} style={{ display: 'none', padding: '0', background: 'none' }}>
              <Menu size={24} color="var(--text-primary)" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      <div 
        onClick={() => setIsMobileMenuOpen(false)}
        style={{ 
           position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1999, 
           opacity: isMobileMenuOpen ? 1 : 0, pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
           transition: 'opacity 0.5s ease', backdropFilter: 'blur(4px)'
        }} 
      />

      {/* Mobile Menu Drawer */}
      <div 
        ref={menuRef}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '75vw', minWidth: '280px', maxWidth: '400px', backgroundColor: 'var(--bg-primary)', zIndex: 2000, transform: 'translateX(100%)', display: 'flex', flexDirection: 'column', padding: '32px 24px', overflowY: 'auto', borderLeft: 'var(--border-thin)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
           <div className="logo-text" style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--text-primary)' }}>
             <span className="hollow-text">{siteSettings?.name?.split(' ')[0] || 'BRAND'}</span>{' '}<span className="solid-blue">{siteSettings?.name?.split(' ').slice(1).join(' ') || 'NAME'}</span>
           </div>
           <button onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '8px', color: 'var(--text-primary)', marginLeft: 'auto' }}><X size={24} strokeWidth={2} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
          {navLinks.map((link, index) => (
            <button key={link.name} className="mobile-nav-item" onClick={() => handleLinkClick(link)} style={{ textAlign: 'left', opacity: 0, display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, letterSpacing: '0.2em', paddingTop: '8px' }}>0{index + 1}</span>
              <span style={{ fontSize: '32px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.05em', color: 'var(--text-primary)', lineHeight: 1 }}>{link.name}</span>
            </button>
          ))}
          {isManagement && (
            <button className="mobile-nav-item" onClick={() => handleLinkClick({ view: 'admin' })} style={{ textAlign: 'left', opacity: 0, display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
               <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, letterSpacing: '0.2em', color: '#E5FF00', paddingTop: '8px' }}>05</span>
               <span style={{ fontSize: '32px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.05em', color: isManagement ? "#E5FF00" : "var(--text-primary)", lineHeight: 1 }}>DASHBOARD</span>
            </button>
          )}
        </div>

        <div className="mobile-nav-item" style={{ opacity: 0, borderTop: 'var(--border-thin)', paddingTop: '24px', marginTop: '48px', paddingBottom: '24px' }}>
           <h4 style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.2em', opacity: 0.4, marginBottom: '16px', textTransform: 'uppercase', color: 'var(--text-primary)' }}>Preferences</h4>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', backgroundColor: 'var(--border-thin)', border: 'var(--border-thin)' }}>
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                 {darkMode ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
                 <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{darkMode ? 'Light' : 'Dark'}</span>
              </button>
              
              <button 
                onClick={() => setCurrency(currency === 'NGN' ? 'USD' : 'NGN')} 
                style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                 <DollarSign size={20} strokeWidth={2} />
                 <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{currency}</span>
              </button>
           </div>
        </div>
      </div>


      <style>{`
        .nav-link-hover:hover { opacity: 1 !important; transform: translateY(-1px); }
        .hover-scale:hover { transform: scale(1.05); }
        @media (max-width: 850px) {
          .desktop-links { display: none !important; }
          .mobile-trigger { display: flex !important; }
          nav { height: 50px !important; top: 12px !important; border-radius: 25px !important; padding: 0 16px !important; width: calc(100% - 24px) !important; }
        }
      `}</style>

      {/* Advanced Search Modal */}
      <AdvancedSearch
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
        onSearch={(query) => {
          setIsAdvancedSearchOpen(false);
          // Navigate to shop with search query
          onNavigate('shop', { searchQuery: query });
        }}
      />
    </>
  );
};

export default Navbar;
