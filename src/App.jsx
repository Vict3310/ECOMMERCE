import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from './components/layout/Navbar';
import EliteLoader from './components/ui/EliteLoader';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useAppContext } from './context/AppContext';
import { getProductPath, getViewFromPathname } from './utils/productPath';
import './index.css';
import { User, LogOut } from 'lucide-react';
import { gsap } from 'gsap';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const ProductDetailRoute = lazy(() => import('./pages/ProductDetailRoute'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const ComparisonView = lazy(() => import('./pages/ComparisonView'));
const CartDrawer = lazy(() => import('./components/cart/CartDrawer'));
const ComparisonBar = lazy(() => import('./components/product/ComparisonBar'));
const LiveChatWidget = lazy(() => import('./components/chat/LiveChatWidget'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const WishlistView = lazy(() => import('./pages/WishlistView'));
const SearchOverlay = lazy(() => import('./components/layout/SearchOverlay'));
const NotFound = lazy(() => import('./pages/NotFound'));

const ORDER_CONFIRM_STORAGE = 'ifeco-order-confirmation';

const getMetaForPathname = (pathname, siteSettings) => {
  const siteName = siteSettings?.name || 'PREMIUM BRAND GADGETS';
  const brand = siteSettings?.name?.split(' ')[0] || 'BRAND';
  const description = siteSettings?.description || 'Shop elite gadgets with fast delivery, premium device choices, and intelligent inventory management.';

  if (pathname === '/') {
    return { title: `${siteName} | Premium Tech Marketplace`, description };
  }
  if (pathname.startsWith('/shop')) {
    return { title: `${brand} Shop | Browse Premium Gadgets`, description: 'Search and filter top smartphones, laptops, accessories, and premium tech deals.' };
  }
  if (pathname.startsWith('/product/')) {
    return { title: `${brand} Product Details | Elite Tech`, description: 'Product detail page with specs, inventory, and buying options.' };
  }
  if (pathname === '/about') {
    return { title: `About ${brand} | Our Story`, description: 'Learn about our premium gadget boutique and customer-first mission.' };
  }
  if (pathname === '/contact') {
    return { title: `Contact ${brand}`, description: 'Get in touch about orders, support, and product inquiries.' };
  }
  if (pathname === '/compare') {
    return { title: `Compare Products | ${brand}`, description: 'Compare featured gadget options side by side to make the best choice.' };
  }
  if (pathname === '/orders') {
    return { title: `Order Tracking | ${brand}`, description: 'View recent sales, order history, and purchase tracking for your account.' };
  }
  if (pathname === '/order-confirmation') {
    return { title: `Order Confirmation | ${brand}`, description: 'Your order confirmation page with purchase summary and next steps.' };
  }
  if (pathname === '/wishlist') {
    return { title: `Wishlist | ${brand}`, description: 'Manage saved gadgets, wishlisted items, and ready-to-buy products.' };
  }
  if (pathname === '/admin') {
    return { title: `Admin Dashboard | ${brand}`, description: 'Manage products, pricing, inventory, and content in the admin console.' };
  }
  return { title: siteName, description };
};

const AppContent = () => {
  const { user, userProfile, logout, loading, darkMode, siteSettings, notification } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const currentView = getViewFromPathname(location.pathname);
  const isAdminRoute = location.pathname.startsWith('/admin');
  const pageMeta = getMetaForPathname(location.pathname, siteSettings);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setLoadingTimeout(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const mainElement = document.querySelector('main');
    if (!loading && mainElement) {
      gsap.fromTo(mainElement, { opacity: 0.88 }, { opacity: 1, duration: 0.4 });
    }
  }, [location.pathname, loading]);

  useEffect(() => {
    if (loading) return;
    const floatingAuth = document.querySelector('.floating-auth');
    if (!floatingAuth) return;

    gsap.fromTo(
      floatingAuth,
      { scale: 0, opacity: 0, y: 50 },
      { scale: 1, opacity: 1, y: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)', delay: 1.5 }
    );
  }, [loading, location.pathname]);

  const appNavigate = useCallback(
    (to, arg2, category = 'all') => {
      if (to === 'cart') {
        setIsCartOpen(true);
        return;
      }
      if (to === 'search') {
        setIsSearchOpen(true);
        return;
      }
      if (to === 'home') {
        navigate('/');
        return;
      }
      if (to === 'detail' && arg2) {
        navigate(getProductPath(arg2));
        return;
      }
      if (to === 'shop') {
        if (arg2 && typeof arg2 === 'object' && arg2.searchQuery != null && String(arg2.searchQuery).trim()) {
          navigate(`/shop?q=${encodeURIComponent(String(arg2.searchQuery).trim())}`);
          return;
        }
        if (category && category !== 'all') {
          navigate(`/shop?category=${encodeURIComponent(category)}`);
          return;
        }
        navigate('/shop');
        return;
      }
      const paths = {
        about: '/about',
        contact: '/contact',
        orders: '/orders',
        wishlist: '/wishlist',
        compare: '/compare',
        admin: '/admin',
      };
      if (paths[to]) {
        navigate(paths[to]);
      }
    },
    [navigate]
  );

  const handleOrderComplete = (order) => {
    try {
      sessionStorage.setItem(ORDER_CONFIRM_STORAGE, JSON.stringify(order));
    } catch {
      /* ignore */
    }
    navigate('/order-confirmation', { state: { order } });
  };

  if (loading && !loadingTimeout) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff' }}>
        <h1 style={{ fontSize: '10px', letterSpacing: '0.4em', marginBottom: '32px', opacity: 0.5, textTransform: 'uppercase' }}>{siteSettings?.name || 'GADGETS'}</h1>
        <div className="skeleton" style={{ width: '100px', height: '1px', opacity: 0.2 }} />
      </div>
    );
  }

  return (
    <div
      className={`app-wrapper ${darkMode ? 'dark-mode' : ''}`}
      style={{
        paddingTop: isAdminRoute ? '0' : '120px',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        minHeight: '100vh',
      }}
    >
      <Helmet>
        <title>{pageMeta.title}</title>
        <meta name="description" content={pageMeta.description} />
      </Helmet>
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 10010,
            maxWidth: '320px',
            padding: '16px 18px',
            borderRadius: '16px',
            backgroundColor:
              notification.type === 'error'
                ? 'rgba(254, 226, 226, 0.98)'
                : notification.type === 'success'
                  ? 'rgba(220, 252, 231, 0.98)'
                  : 'rgba(239, 246, 255, 0.98)',
            color:
              notification.type === 'error' ? '#991b1b' : notification.type === 'success' ? '#166534' : '#0f172a',
            boxShadow: '0 18px 45px rgba(15,23,42,0.12)',
            border: '1px solid rgba(15,23,42,0.08)',
            fontWeight: 700,
            letterSpacing: '0.01em',
          }}
        >
          {notification.message}
        </div>
      )}
      {!isAdminRoute && <Navbar onNavigate={appNavigate} currentView={currentView} />}

      <Suspense fallback={<EliteLoader />}>
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onOrderComplete={handleOrderComplete} />
        <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onProductClick={(p) => appNavigate('detail', p)} />

        {!isAdminRoute && location.pathname !== '/compare' && <ComparisonBar onCompare={() => appNavigate('compare')} />}

        <main>
          {!isAdminRoute && (
            <div
              className="floating-auth"
              style={{
                position: 'fixed',
                bottom: '48px',
                right: '48px',
                zIndex: 5000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '12px',
              }}
            >
              {user && (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    appNavigate('home');
                  }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,59,59,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,59,59,0.3)',
                    color: '#FF3B3B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              )}

              <button
                type="button"
                onClick={() => appNavigate('admin')}
                className="auth-main-btn"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-blue)',
                  color: '#FFFFFF',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  position: 'relative',
                }}
              >
                {user ? (
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`}
                    alt=""
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <User size={24} />
                )}

                <div
                  className="auth-label"
                  style={{
                    position: 'absolute',
                    right: '80px',
                    whiteSpace: 'nowrap',
                    backgroundColor: 'var(--brand-blue)',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '10px',
                    fontWeight: 900,
                    letterSpacing: '0.1em',
                    pointerEvents: 'none',
                    textTransform: 'uppercase',
                  }}
                >
                  {user ? userProfile?.role || 'CLIENT' : 'SIGN UP / LOGIN'}
                </div>
              </button>
            </div>
          )}

          <Routes>
            <Route
              path="/"
              element={
                <Home
                  onShopClick={() => appNavigate('shop')}
                  onProductClick={(arg) => (arg === 'cart' ? appNavigate('cart') : appNavigate('detail', arg))}
                />
              }
            />
            <Route
              path="/shop"
              element={
                <Shop onProductClick={(p) => (p === 'cart' ? appNavigate('cart') : appNavigate('detail', p))} />
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/product/:slug" element={<ProductDetailRoute appNavigate={appNavigate} />} />
            <Route path="/admin" element={<AdminDashboard onExit={() => appNavigate('home')} />} />
            <Route path="/compare" element={<ComparisonView onBack={() => appNavigate('shop')} />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/wishlist" element={<WishlistView onNavigate={appNavigate} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>

          {!isAdminRoute && <LiveChatWidget />}
        </main>
      </Suspense>

      {!isAdminRoute && (
        <footer className="thin-border-top" style={{ padding: '80px 0', backgroundColor: 'var(--bg-secondary)' }}>
          <div className="container" style={{ padding: '0 24px' }}>
            <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '80px' }}>
              <div>
                <h2 style={{ fontSize: '24px', letterSpacing: '-0.05em', fontWeight: 800, marginBottom: '24px' }}>
                  <span className="hollow-text">{(siteSettings?.name?.split(' ')[0] ?? 'BRAND')}</span>{' '}
                  <span className="solid-blue">{(siteSettings?.name?.split(' ').slice(1).join(' ') || 'GADGETS')}</span>
                </h2>
                <p style={{ opacity: 0.5, fontSize: '14px', lineHeight: 1.8, marginBottom: '32px' }}>
                  Your destination for elite tech gadgets and hardware innovation based in {(siteSettings?.address?.split(',').pop() ?? '').trim()}.
                </p>
              </div>
              <div className="stack-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, marginBottom: '24px' }}>SHOP</h4>
                  <p onClick={() => appNavigate('shop')} style={{ fontSize: '13px', opacity: 0.4, marginBottom: '12px', cursor: 'pointer' }}>
                    Phones
                  </p>
                  <p onClick={() => appNavigate('shop', null, 'Laptops')} style={{ fontSize: '13px', opacity: 0.4, marginBottom: '12px', cursor: 'pointer' }}>
                    Laptops
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, marginBottom: '24px' }}>SITE</h4>
                  <p onClick={() => appNavigate('about')} style={{ fontSize: '13px', opacity: 0.4, marginBottom: '12px', cursor: 'pointer' }}>
                    About Us
                  </p>
                  <p onClick={() => appNavigate('orders')} style={{ fontSize: '13px', opacity: 0.4, marginBottom: '12px', cursor: 'pointer' }}>
                    Track Order
                  </p>
                  <p onClick={() => appNavigate('contact')} style={{ fontSize: '13px', opacity: 0.4, marginBottom: '12px', cursor: 'pointer' }}>
                    Contact
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, marginBottom: '24px' }}>LEGAL</h4>
                  <p style={{ fontSize: '13px', opacity: 0.4, marginBottom: '12px' }}>Privacy</p>
                  <p style={{ fontSize: '13px', opacity: 0.4, marginBottom: '12px' }}>Terms</p>
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: '80px',
                paddingTop: '32px',
                borderTop: 'var(--border-thin)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <p style={{ fontSize: '10px', opacity: 0.3, fontWeight: 700 }}>© 2024 {siteSettings.name}. ALL RIGHTS RESERVED.</p>
              <div style={{ display: 'flex', gap: '24px', opacity: 0.3, fontSize: '10px', fontWeight: 700 }}>
                <a href={`https://instagram.com/${siteSettings.instagram}`} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                  INSTAGRAM
                </a>
                <a href={`https://twitter.com/${siteSettings.twitter}`} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                  TWITTER
                </a>
                <a href={`https://linkedin.com/company/${siteSettings.linkedin}`} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                  LINKEDIN
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
);

export default App;

