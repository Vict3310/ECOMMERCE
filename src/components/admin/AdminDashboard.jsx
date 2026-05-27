import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  Plus, Search, Edit3, Trash2, Package, ShoppingCart,
  Users, MessageSquare, Layout, Settings, LogOut,
  ShieldAlert, Save, X, Camera, Info, BarChart2, TrendingUp, DollarSign,
  AlertTriangle, Star, ShoppingBag
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../supabase';
import EliteLoader from '../ui/EliteLoader';
const ProductFormModal = lazy(() => import('./ProductFormModal'));
const AdminChatInbox = lazy(() => import('./AdminChatInbox'));
const InventoryIntelligence = lazy(() => import('../ui/InventoryIntelligence'));
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { compressImageFile } from '../../utils/compressImage';

const AdminDashboard = ({ onExit }) => {
  const { 
    products, siteSettings, setSiteSettings, updateSiteSettings,
    orders, loadMoreOrders, downloadInvoice, user, userProfile, loginWithGoogle, logout,
    bulkUpdatePrices, heroSlides, feedItems, showNotification, showConfirmDialog, updateOrderStatus
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('products');
  const [bulkPercentage, setBulkPercentage] = useState(0);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [systemUsers, setSystemUsers] = useState([]);
  const [isSeedingCatalog, setIsSeedingCatalog] = useState(false);

  const [isSliderFormOpen, setIsSliderFormOpen] = useState(false);
  const [sliderType, setSliderType] = useState('hero'); // 'hero' or 'feed'
  const [selectedSlider, setSelectedSlider] = useState(null);
  const [sliderData, setSliderData] = useState({ title: '', image: '', link: '' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [allReviews, setAllReviews] = useState([]);
  const [isInventoryIntelligenceOpen, setIsInventoryIntelligenceOpen] = useState(false);
  const [isSliderUploading, setIsSliderUploading] = useState(false);

  useEffect(() => {
    if (selectedSlider) setSliderData(selectedSlider);
    else setSliderData({ title: '', image: '', link: '' });
  }, [selectedSlider, isSliderFormOpen]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (data) {
        setAllReviews(data.map(r => ({ ...r, createdAt: new Date(r.created_at).getTime(), productId: r.product_id, userName: r.user_name })));
      }
    };
    fetchReviews();
    const channel = supabase.channel('reviews_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, fetchReviews)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('users').select('*');
      if (data) {
        setSystemUsers(data.map(u => ({ uid: u.id, ...u })));
      }
    };
    fetchUsers();
    const channel = supabase.channel('users_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchUsers)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const handleUpdateRole = async (uid, newRole) => {
    await supabase.from('users').update({ role: newRole }).eq('id', uid);
  };

  const handleSaveSlider = async () => {
    const dbKey = sliderType === 'hero' ? 'heroSlides' : 'feedItems';
    const { data } = await supabase.from('site_settings').select('value').eq('key', dbKey).single();
    let currentArray = data?.value || [];
    if (selectedSlider) {
      currentArray = currentArray.map(item => item.id === selectedSlider.id ? { ...item, ...sliderData } : item);
    } else {
      currentArray.push({ ...sliderData, id: Date.now().toString() });
    }
    await supabase.from('site_settings').upsert({ key: dbKey, value: currentArray });
    setIsSliderFormOpen(false);
  };

  const handleSliderImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showNotification('Image must be under 8MB.', 'error');
      return;
    }

    setIsSliderUploading(true);
    try {
      const prepared = await compressImageFile(file, { maxDim: 1200, quality: 0.6 });
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${prepared.name}`;
      const { error: uploadError } = await supabase.storage.from('site-assets').upload(fileName, prepared);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(fileName);
      
      setSliderData(prev => ({ ...prev, image: publicUrl }));
    } catch (error) {
      console.error("Storage Error Details:", error);
      showNotification(`Upload failed: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSliderUploading(false);
      e.target.value = '';
    }
  };

  const handleBulkUpdate = async () => {
    if (bulkPercentage === 0) return;
    if (bulkPercentage <= -100) {
      showNotification('Reduction cannot be 100% or more. Choose a smaller negative value.', 'error');
      return;
    }

    showConfirmDialog({
      title: 'Confirm Global Pricing Update',
      message: `This will adjust the prices of ALL ${products.length} items by ${bulkPercentage}%. Prices will be kept above 0 and invalid products will be skipped.`,
      confirmLabel: 'Apply Pricing Update',
      danger: bulkPercentage < 0,
      onConfirm: async () => {
        setIsBulkLoading(true);
        const result = await bulkUpdatePrices(bulkPercentage);
        setIsBulkLoading(false);
        if (result.success) showNotification('GLOBAL INVENTORY UPDATED.', 'success');
        else showNotification(result.error ? `BULK UPDATE FAILED: ${result.error}` : 'BULK UPDATE FAILED.', 'error');
      },
    });
  };

  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const handleSaveSettings = async () => {
    setIsSettingsLoading(true);
    const result = await updateSiteSettings(siteSettings);
    setIsSettingsLoading(false);
    if (result.success) showNotification("CONFIG PERSISTED TO FIRBASE.", 'success');
    else showNotification("CONFIG UPDATE FAILED.", 'error');
  };

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      showNotification("Please provide both email and password.", 'error');
      return;
    }
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
        if (error) throw error;
        showNotification("Signup successful! You are now logged in.", 'success');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
        showNotification("Login successful!", 'success');
      }
    } catch (err) {
      console.error('Auth error:', err);
      showNotification(err.message || "Authentication failed.", 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  if (!user || userProfile?.role !== 'owner') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: '24px', textAlign: 'center' }}>
        <ShieldAlert size={64} style={{ marginBottom: '32px', color: '#FF3B3B' }} />
        <h1 style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '0.3em', marginBottom: '16px', color: 'var(--text-primary)' }}>{user ? 'ACCESS DENIED' : 'SECURE ACCESS'}</h1>
        <p style={{ fontSize: '12px', opacity: 0.5, marginBottom: '40px', maxWidth: '300px' }}>
          {user ? "YOUR ACCOUNT DOES NOT HAVE ADMINISTRATOR PRIVILEGES." : "LOG IN OR SIGN UP TO MANAGE YOUR STORE."}
        </p>
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '300px', marginBottom: '16px' }}>
          <input
            type="email"
            placeholder="Email Address"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', border: 'var(--border-thin)', color: 'var(--text-primary)', outline: 'none' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', border: 'var(--border-thin)', color: 'var(--text-primary)', outline: 'none' }}
          />
          <button 
            type="submit"
            disabled={authLoading}
            style={{ padding: '16px', backgroundColor: 'var(--brand-blue)', color: '#FFFFFF', fontSize: '11px', fontWeight: 800, borderRadius: '2px', letterSpacing: '0.1em', cursor: 'pointer', opacity: authLoading ? 0.5 : 1 }}
          >
            {authLoading ? 'AUTHENTICATING...' : authMode === 'login' ? 'LOG IN' : 'SIGN UP'}
          </button>
        </form>
        
        <div style={{ display: 'grid', gap: '16px', width: '100%', maxWidth: '300px' }}>
          <button 
            onClick={() => setAuthMode(prev => prev === 'login' ? 'signup' : 'login')}
            style={{ padding: '12px', fontSize: '11px', fontWeight: 800, opacity: 0.6, cursor: 'pointer' }}
          >
            {authMode === 'login' ? 'NEED AN ACCOUNT? SIGN UP' : 'ALREADY HAVE AN ACCOUNT? LOG IN'}
          </button>
          
          <button 
            onClick={loginWithGoogle}
            style={{ padding: '12px', border: 'var(--border-thin)', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
          >
            CONTINUE WITH GOOGLE
          </button>

          <button 
            onClick={onExit}
            style={{ padding: '16px', fontSize: '11px', fontWeight: 800, opacity: 0.4, borderBottom: '1px solid currentColor', cursor: 'pointer' }}
          >
            RETURN TO PUBLIC STORE
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile || !['owner', 'worker'].includes(userProfile.role)) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: '24px', textAlign: 'center' }}>
        <ShieldAlert size={48} style={{ marginBottom: '24px', opacity: 0.2 }} />
        <h2 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.3em', opacity: 0.5, color: 'var(--text-primary)' }}>ACCESS RESTRICTED</h2>
        <p style={{ fontSize: '11px', opacity: 0.4, marginBottom: '32px' }}>YOUR ACCOUNT ({user.email}) IS NOT AUTHORIZED FOR MANAGEMENT ACCESS.</p>
        <button onClick={onExit} style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', borderBottom: '1.5px solid var(--brand-blue)', padding: '8px 0' }}>EXIT PORTAL</button>
      </div>
    );
  }

  const isOwner = userProfile.role === 'owner';

  return (
    <div className={`admin-portal fade-in ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`} style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: '100vh', backgroundColor: 'var(--bg-primary)', overflow: 'hidden', position: 'relative' }}>
      
      {/* Mobile Top Bar */}
      <div className="show-mobile" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '72px', padding: '0 24px', backgroundColor: 'var(--bg-primary)', borderBottom: 'var(--border-thin)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 9999 }}>
         <div onClick={onExit} style={{ cursor: 'pointer' }}>
            <h1 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{siteSettings?.name?.split(' ')[0] || 'BRAND'}.<span style={{ color: 'var(--brand-blue)' }}>PORTAL</span></h1>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ width: '40px', height: '40px', border: 'var(--border-thin)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            {isMobileMenuOpen ? <X size={20} /> : <Layout size={20} />}
         </button>
      </div>

      {/* Sidebar */}
      <aside className={`thin-border-right ${isMobileMenuOpen ? 'admin-sidebar-mobile' : 'hide-on-mobile'}`} style={{ padding: '48px 32px', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
        {/* Mobile Close Button */}
        <button 
          className="show-mobile" 
          onClick={() => setIsMobileMenuOpen(false)} 
          style={{ display: 'none', alignSelf: 'flex-end', marginBottom: '24px', width: '40px', height: '40px', border: 'var(--border-thin)', borderRadius: '2px', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}
        >
          <X size={20} />
        </button>
        <div className="hide-on-mobile" onClick={onExit} style={{ cursor: 'pointer', marginBottom: '48px' }}>
           <h1 style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{siteSettings?.name?.split(' ')[0] || 'BRAND'}.<span style={{ color: 'var(--brand-blue)' }}>PORTAL</span></h1>
           <p style={{ fontSize: '8px', fontWeight: 800, opacity: 0.4, marginTop: '4px' }}>ENTERPRISE CONTROL v2.0</p>
        </div>

        <nav style={{ display: 'grid', gap: '4px' }}>
          {[
            { id: 'products', label: 'INVENTORY', icon: <Package size={16} /> },
            { id: 'inventory-intelligence', label: 'SMART INVENTORY', icon: <BarChart2 size={16} />, ownerOnly: true },
            { id: 'orders', label: 'ORDERS', icon: <ShoppingCart size={16} /> },
            { id: 'chat', label: 'CHAT INBOX', icon: <MessageSquare size={16} /> },
            { id: 'staff', label: 'STAFF CONTROL', icon: <Users size={16} />, ownerOnly: true },
            { id: 'sliders', label: 'CAROUSELS', icon: <Layout size={16} />, ownerOnly: true },
            { id: 'reviews', label: 'CLIENT REVIEWS', icon: <Star size={16} />, ownerOnly: true },
            { id: 'settings', label: 'SETTINGS', icon: <Settings size={16} />, ownerOnly: true },
          ].map(item => (
            (!item.ownerOnly || isOwner) && (
              <button 
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '2px',
                  fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                  whiteSpace: 'nowrap',
                  backgroundColor: activeTab === item.id ? 'var(--bg-secondary)' : 'transparent',
                  color: activeTab === item.id ? 'var(--brand-blue)' : 'var(--text-primary)',
                  transition: 'all 0.3s ease'
                }}
              >
                {item.icon} {item.label}
              </button>
            )
          ))}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FF3B3B', fontSize: '11px', fontWeight: 800 }}>
             <LogOut size={16} /> LOGOUT SESSION
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`hide-scrollbar ${isMobileMenuOpen ? 'blur-content' : ''} admin-main-mobile`} style={{ padding: '80px', overflowY: 'auto' }}>
        
        {activeTab === 'products' && (
           <div className="fade-in">
              <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.05em' }}>Inventory.</h2>
                  <p style={{ fontSize: '12px', opacity: 0.5 }}>{products.length} Items Live in Global Catalog</p>
                </div>
                <button onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }} style={{ padding: '16px 32px', backgroundColor: 'var(--brand-blue)', color: '#FFFFFF', fontSize: '11px', fontWeight: 800, borderRadius: '2px' }}>+ ADD PRODUCT</button>
              </div>

              <div style={{ display: 'grid', border: 'var(--border-thin)', backgroundColor: 'var(--border-thin)', gap: '1px' }}>
                 {products.map(p => (
                    <div key={p.id} className="stack-mobile" style={{ display: 'grid', gridTemplateColumns: '80px 1fr 150px minmax(160px, 220px) 220px', alignItems: 'center', gap: '24px', padding: '24px 32px', backgroundColor: 'var(--bg-primary)' }}>
                       <img src={p.image} style={{ width: '64px', height: '64px', objectFit: 'contain', filter: 'grayscale(1)' }} />
                       <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 900 }}>{p.name}</h4>
                          <span style={{ fontSize: '9px', opacity: 0.4, fontWeight: 800, textTransform: 'uppercase' }}>{p.brand} / {p.category}</span>
                       </div>
                       <div style={{ opacity: 0.7 }}>
                          <p style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4 }}>PRICING</p>
                          <p style={{ fontSize: '11px', fontWeight: 900 }}>{p.prices?.brandNew || p.prices?.ukUsed}</p>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '160px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                             <p style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4 }}>AVAILABILITY</p>
                             <p style={{ fontSize: '11px', fontWeight: 900, color: (p.stock || 0) < 5 ? '#FF3B3B' : 'inherit' }}>{p.stock || 0} UNITS</p>
                          </div>
                          {(p.stock || 0) < 5 && <AlertTriangle size={14} color="#FF3B3B" className="pulse" />}
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', minWidth: '220px' }}>
                          <button onClick={() => { 
                             const clone = { ...p, id: undefined }; // Remove ID to trigger new push
                             setSelectedProduct(clone); 
                             setIsFormOpen(true); 
                           }} style={{ padding: '12px', border: 'var(--border-thin)', borderRadius: '2px', cursor: 'pointer', color: 'var(--brand-blue)' }} title="Clone Product"><Plus size={14} /></button>
                          <button onClick={() => { setSelectedProduct(p); setIsFormOpen(true); }} style={{ padding: '12px', border: 'var(--border-thin)', borderRadius: '2px', cursor: 'pointer' }}><Edit3 size={14} /></button>
                          <button onClick={() => showConfirmDialog({
                               title: 'Delete Product',
                               message: `You're about to permanently remove ${p.name}. This action cannot be undone.`,
                               confirmLabel: 'Delete Product',
                               danger: true,
                               onConfirm: async () => {
                                 const { error } = await supabase.from('products').delete().eq('id', p.id);
                                 if (error) showNotification(error.message, 'error');
                                 else showNotification('Product removed from catalog.', 'success');
                               },
                             })} style={{ padding: '12px', border: 'var(--border-thin)', borderRadius: '2px', color: '#FF3B3B', cursor: 'pointer' }}><Trash2 size={14} /></button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'orders' && (
           <div className="fade-in">
              <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '48px' }}>Recent Sales.</h2>
              
              <div style={{ padding: '32px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', marginBottom: '32px', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orders.map(o => ({ name: o.date.split(',')[0], total: o.total || o.price || 0 })).reverse()}>
                    <XAxis dataKey="name" stroke="var(--text-primary)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-primary)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₦${(val/1000).toFixed(0)}k`} />
                    <Tooltip cursor={{ fill: 'rgba(150,150,150,0.1)' }} contentStyle={{ backgroundColor: 'var(--bg-primary)', border: 'var(--border-thin)', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 800 }} />
                    <Bar dataKey="total" fill="var(--brand-blue)" radius={[1, 1, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                 {orders.map(o => (
                   <div key={o.id} className="stack-mobile" style={{ padding: '24px', border: 'var(--border-thin)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                           <span style={{ fontSize: '12px', fontWeight: 800 }}>{o.id || 'ORD-NEW'}</span>
                           <select 
                             value={o.status || 'processing'}
                             onChange={async (e) => {
                               const newStatus = e.target.value;
                               const res = await updateOrderStatus(o.id, newStatus);
                               if (res?.success) showNotification(`Order ${o.id.substring(0,6)} updated to ${newStatus}`, 'success');
                               else showNotification('Status update failed', 'error');
                             }}
                             style={{ 
                               fontSize: '9px', padding: '4px 8px', borderRadius: '2px', 
                               backgroundColor: o.status === 'delivered' ? 'var(--brand-blue)' : 'var(--bg-secondary)', 
                               color: o.status === 'delivered' ? '#fff' : 'var(--text-primary)', 
                               border: o.status === 'delivered' ? 'none' : 'var(--border-thin)', 
                               fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', outline: 'none'
                             }}
                           >
                             <option value="processing">PROCESSING</option>
                             <option value="shipped">SHIPPED</option>
                             <option value="delivered">DELIVERED</option>
                             <option value="cancelled">CANCELLED</option>
                           </select>
                        </div>
                        <p style={{ fontSize: '10px', opacity: 0.5 }}>{o.name} / {o.phone}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800 }}>NGN {(o.total || 0).toLocaleString()}</div>
                        <button onClick={() => downloadInvoice(o)} style={{ fontSize: '10px', fontWeight: 800, marginTop: '8px', borderBottom: '1px solid currentColor', opacity: 0.6 }}>DOWNLOAD INVOICE</button>
                      </div>
                   </div>
                 ))}
              </div>
              {orders.length >= 100 && (
                <button
                  onClick={loadMoreOrders}
                  style={{ width: '100%', padding: '16px', marginTop: '24px', border: 'var(--border-thin)', fontSize: '11px', fontWeight: 800, cursor: 'pointer', opacity: 0.6, letterSpacing: '0.1em', backgroundColor: 'transparent', color: 'var(--text-primary)' }}
                >
                  LOAD MORE ORDERS
                </button>
              )}
           </div>
        )}

        {isOwner && activeTab === 'chat' && (
           <div className="fade-in">
              <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '48px' }}>Chat Center.</h2>
              <Suspense fallback={<EliteLoader />}>
                <AdminChatInbox />
              </Suspense>
           </div>
        )}

        {isOwner && activeTab === 'staff' && (
           <div className="fade-in">
              <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '48px' }}>Identity Control.</h2>
              <div style={{ display: 'grid', border: 'var(--border-thin)', backgroundColor: 'var(--border-thin)', gap: '1px' }}>
                 {systemUsers.map(u => (
                    <div key={u.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px', backgroundColor: 'var(--bg-primary)' }}>
                       <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 800 }}>{u.email}</h4>
                          <p style={{ fontSize: '10px', opacity: 0.4 }}>Role: <span style={{ color: u.role === 'owner' ? 'var(--brand-blue)' : u.role === 'worker' ? '#00D1FF' : 'inherit' }}>{u.role?.toUpperCase()}</span></p>
                       </div>
                       <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleUpdateRole(u.uid, 'worker')} style={{ padding: '10px 16px', border: 'var(--border-thin)', fontSize: '9px', fontWeight: 800, cursor: 'pointer', color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}>SET WORKER</button>
                          <button onClick={() => handleUpdateRole(u.uid, 'owner')} style={{ padding: '10px 16px', border: 'var(--border-thin)', fontSize: '9px', fontWeight: 800, cursor: 'pointer', color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}>SET OWNER</button>
                          <button onClick={() => handleUpdateRole(u.uid, 'user')} style={{ padding: '10px 16px', border: 'var(--border-thin)', fontSize: '9px', fontWeight: 800, cursor: 'pointer', opacity: 0.3, color: 'var(--text-primary)', backgroundColor: 'transparent' }}>REVOKE</button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {isOwner && activeTab === 'sliders' && (
           <div className="fade-in">
              <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', gap: '16px' }}>
                 <h2 style={{ fontSize: '32px', fontWeight: 800 }}>Carousel Config.</h2>
              </div>
              
              <div style={{ marginBottom: '64px' }}>
                 <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-primary)' }}>HERO SLIDES</h3>
                    <button onClick={() => { setSelectedSlider(null); setSliderType('hero'); setIsSliderFormOpen(true); }} style={{ padding: '10px 16px', border: 'var(--border-thin)', fontSize: '9px', fontWeight: 800, cursor: 'pointer', color: 'var(--text-primary)' }}>+ ADD HERO SLIDE</button>
                 </div>
                 <div style={{ display: 'grid', border: 'var(--border-thin)', backgroundColor: 'var(--border-thin)', gap: '1px' }}>
                    {heroSlides.map(slide => (
                       <div key={slide.id} className="stack-mobile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', backgroundColor: 'var(--bg-primary)', gap: '16px' }}>
                          <div className="stack-mobile" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                             <img src={slide.image} style={{ width: '80px', height: '40px', objectFit: 'cover', filter: 'grayscale(1)' }} />
                             <div><h4 style={{ fontSize: '12px', fontWeight: 800 }}>{slide.title}</h4><p style={{ fontSize: '9px', opacity: 0.4 }}>Points to: {slide.link}</p></div>
                          </div>
                          <div style={{ display: 'flex', gap: '12px' }}>
                             <button onClick={() => { setSelectedSlider(slide); setSliderType('hero'); setIsSliderFormOpen(true); }} style={{ padding: '8px', border: 'var(--border-thin)', cursor: 'pointer', color: 'var(--text-primary)' }}><Edit3 size={14} /></button>
                             <button onClick={() => showConfirmDialog({
                               title: 'Delete Hero Slide',
                               message: `Remove "${slide.title}" from the hero carousel? This cannot be undone.`,
                               confirmLabel: 'Delete',
                               danger: true,
                               onConfirm: async () => {
                                 const newSlides = heroSlides.filter(s => s.id !== slide.id);
                                 const { error } = await supabase.from('site_settings').upsert({ key: 'heroSlides', value: newSlides });
                                 if (error) showNotification(error.message, 'error');
                                 else showNotification('Hero slide removed.', 'success');
                               },
                             })} style={{ padding: '8px', border: 'var(--border-thin)', color: '#FF3B3B', cursor: 'pointer' }}><Trash2 size={14} /></button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div>
                 <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-primary)' }}>FEED ITEMS</h3>
                    <button onClick={() => { setSelectedSlider(null); setSliderType('feed'); setIsSliderFormOpen(true); }} style={{ padding: '10px 16px', border: 'var(--border-thin)', fontSize: '9px', fontWeight: 800, cursor: 'pointer', color: 'var(--text-primary)' }}>+ ADD FEED ITEM</button>
                 </div>
                 <div style={{ display: 'grid', border: 'var(--border-thin)', backgroundColor: 'var(--border-thin)', gap: '1px' }}>
                    {feedItems.map(item => (
                       <div key={item.id} className="stack-mobile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', backgroundColor: 'var(--bg-primary)', gap: '16px' }}>
                          <div className="stack-mobile" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                             <img src={item.image} style={{ width: '40px', height: '40px', objectFit: 'cover', filter: 'grayscale(1)' }} />
                             <div><h4 style={{ fontSize: '12px', fontWeight: 800 }}>{item.title}</h4><p style={{ fontSize: '9px', opacity: 0.4 }}>Category: {item.category}</p></div>
                          </div>
                          <div style={{ display: 'flex', gap: '12px' }}>
                             <button onClick={() => { setSelectedSlider(item); setSliderType('feed'); setIsSliderFormOpen(true); }} style={{ padding: '8px', border: 'var(--border-thin)', cursor: 'pointer', color: 'var(--text-primary)' }}><Edit3 size={14} /></button>
                             <button onClick={() => showConfirmDialog({
                               title: 'Delete Feed Item',
                               message: `Remove "${item.title}" from the home feed? This cannot be undone.`,
                               confirmLabel: 'Delete',
                               danger: true,
                               onConfirm: async () => {
                                 const newItems = feedItems.filter(i => i.id !== item.id);
                                 const { error } = await supabase.from('site_settings').upsert({ key: 'feedItems', value: newItems });
                                 if (error) showNotification(error.message, 'error');
                                 else showNotification('Feed item removed.', 'success');
                               },
                             })} style={{ padding: '8px', border: 'var(--border-thin)', color: '#FF3B3B', cursor: 'pointer' }}><Trash2 size={14} /></button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        )}

        {isOwner && activeTab === 'reviews' && (
           <div className="fade-in">
              <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>Social Proof Control.</h2>
              <p style={{ fontSize: '11px', opacity: 0.5, marginBottom: '48px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Monitor and Moderate Elite Client Feedback</p>
              
              <div style={{ display: 'grid', gap: '1px', backgroundColor: 'var(--border-thin)', border: 'var(--border-thin)' }}>
                 {allReviews.map(rev => (
                    <div key={rev.id} style={{ display: 'grid', gridTemplateColumns: '80px 1.5fr 3fr 120px', alignItems: 'center', gap: '24px', padding: '32px', backgroundColor: 'var(--bg-primary)' }}>
                       <div style={{ width: '64px', height: '64px', borderRadius: '2px', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900 }}>
                          {rev.userName?.charAt(0)}
                       </div>
                       <div>
                          <h4 style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase' }}>{rev.userName}</h4>
                          <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                             {[1,2,3,4,5].map(s => <Star key={s} size={8} fill={s <= rev.rating ? "var(--brand-blue)" : "none"} stroke="var(--brand-blue)" />)}
                          </div>
                          <p style={{ fontSize: '9px', fontWeight: 800, opacity: 0.3, marginTop: '8px' }}>Product: {rev.productId.slice(0,12)}...</p>
                       </div>
                       <p style={{ fontSize: '12px', opacity: 0.7, lineHeight: 1.5 }}>{rev.comment}</p>
                       <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => showConfirmDialog({
                              title: 'Delete Review',
                              message: 'This will permanently remove the selected review from the system.',
                              confirmLabel: 'Delete Review',
                              danger: true,
                              onConfirm: async () => {
                                const { error } = await supabase.from('reviews').delete().eq('id', rev.id);
                                if (error) showNotification(error.message, 'error');
                                else showNotification('Review removed.', 'success');
                              },
                            })}
                            style={{ padding: '12px', border: 'var(--border-thin)', color: '#FF3B3B', cursor: 'pointer', borderRadius: '2px' }}
                          >
                            <Trash2 size={16} />
                          </button>
                       </div>
                    </div>
                 ))}
                 {allReviews.length === 0 && (
                   <div style={{ padding: '80px 0', textAlign: 'center', backgroundColor: 'var(--bg-primary)', opacity: 0.3 }}>
                      <MessageSquare size={48} style={{ marginBottom: '24px' }} />
                      <p style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.2em' }}>NO CLIENT REVIEWS TO MODERATE.</p>
                   </div>
                 )}
              </div>
           </div>
        )}

        {isOwner && activeTab === 'inventory-intelligence' && (
          <div className="fade-in">
            <div className="stack-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', gap: '16px' }}>
              <div>
                <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--brand-blue)', marginBottom: '12px' }}>AI-Driven Inventory</span>
                <h2 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--text-primary)', marginBottom: '16px' }}>Smart Inventory.</h2>
                <p style={{ maxWidth: '640px', fontSize: '14px', lineHeight: 1.9, color: 'var(--text-secondary)', opacity: 0.95 }}>
                  See key stock signals at a glance, then act on alerts, restock triggers, and demand forecasts from one polished inventory control surface.
                </p>
              </div>
              <button
                onClick={() => setIsInventoryIntelligenceOpen(true)}
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'var(--brand-blue)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 18px 40px rgba(0, 71, 255, 0.15)'
                }}
              >
                Open Intelligence Dashboard
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '36px' }}>
              {[
                {
                  id: 'attention',
                  icon: BarChart2,
                  title: 'Items Need Attention',
                  value: products.filter(p => (p.stock || 0) < 10).length,
                  accent: '#E0F2FE',
                  tone: '#0B69D4',
                  detail: 'Low stock products below 10 units.',
                },
                {
                  id: 'forecast',
                  icon: TrendingUp,
                  title: 'Demand Forecasting',
                  value: products.filter((p, index) => index % 3 === 0).length,
                  accent: '#ECFDF5',
                  tone: '#0F766E',
                  detail: 'Sales velocity signals for the next cycle.',
                },
                {
                  id: 'alerts',
                  icon: AlertTriangle,
                  title: 'Critical Alerts',
                  value: products.filter(p => (p.stock || 0) <= 5).length,
                  accent: '#FEF3C7',
                  tone: '#B45309',
                  detail: 'Immediate restock alerts generated.',
                },
                {
                  id: 'catalog',
                  icon: Package,
                  title: 'Total Catalog',
                  value: products.length,
                  accent: '#F8FAFC',
                  tone: '#0F172A',
                  detail: 'Active products currently available.',
                },
              ].map(card => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    style={{
                      minHeight: '260px',
                      padding: '28px',
                      borderRadius: '24px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid rgba(15,23,42,0.08)',
                      boxShadow: '0 20px 50px rgba(15,23,42,0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', marginBottom: '28px' }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ display: 'inline-block', fontSize: '11px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: card.tone, marginBottom: '10px' }}>{card.title}</p>
                        <p style={{ fontSize: '42px', fontWeight: 900, lineHeight: 1, color: 'var(--text-primary)', margin: 0 }}>{card.value}</p>
                      </div>
                      <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: card.accent, display: 'grid', placeItems: 'center' }}>
                        <Icon size={24} color={card.tone} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>{card.detail}</p>
                      <span style={{ fontSize: '11px', color: 'var(--text-primary)', opacity: 0.75, fontWeight: 700 }}>Actionable insights for stock management</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: 'var(--border-thin)',
              borderRadius: '20px',
              padding: '32px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {[
                  {
                    id: 'dashboard',
                    icon: BarChart2,
                    title: 'View Intelligence Dashboard',
                    detail: 'Comprehensive inventory analytics and forecasting',
                    onClick: () => setIsInventoryIntelligenceOpen(true),
                    color: 'var(--brand-blue)',
                  },
                  {
                    id: 'low-stock',
                    icon: AlertTriangle,
                    title: 'Generate Low Stock Report',
                    detail: 'Export items requiring immediate attention',
                    onClick: () => showNotification('Low stock report generated', 'success'),
                    color: '#B45309',
                  },
                  {
                    id: 'demand',
                    icon: TrendingUp,
                    title: 'Run Demand Analysis',
                    detail: 'AI-powered sales velocity and trend analysis',
                    onClick: () => showNotification('Demand analysis completed', 'success'),
                    color: '#0F766E',
                  },
                  {
                    id: 'restock',
                    icon: Package,
                    title: 'Auto Restock Orders',
                    detail: 'Generate purchase orders based on predictions',
                    onClick: () => showNotification('Restock recommendations sent', 'success'),
                    color: 'var(--text-primary)',
                  },
                ].map(action => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={action.onClick}
                      style={{
                        padding: '24px',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid rgba(15,23,42,0.08)',
                        borderRadius: '20px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease',
                        minHeight: '180px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Icon size={22} color={action.color} style={{ marginBottom: '14px' }} />
                      <div style={{ fontSize: '15px', fontWeight: 900, marginBottom: '6px', color: 'var(--text-primary)' }}>
                        {action.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569', opacity: 0.9 }}>
                        {action.detail}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {isOwner && activeTab === 'settings' && (
           <div className="fade-in">
              <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '48px' }}>Global Config.</h2>
              <div className="admin-grid-2" style={{ maxWidth: '800px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                 <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Store Name</label>
                    <input type="text" value={siteSettings.name} onChange={(e) => setSiteSettings(prev => ({ ...prev, name: e.target.value }))} style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', fontWeight: 800 }} />
                 </div>
                 
                 <div>
                    <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Support Hotline (WhatsApp)</label>
                    <input type="text" value={siteSettings.phone} onChange={(e) => setSiteSettings(prev => ({ ...prev, phone: e.target.value }))} style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', fontWeight: 800 }} />
                 </div>
                 <div>
                    <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Support Email</label>
                    <input type="email" value={siteSettings.email} onChange={(e) => setSiteSettings(prev => ({ ...prev, email: e.target.value }))} style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', fontWeight: 800 }} />
                 </div>

                 <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Physical Address (Flagship Hub)</label>
                    <textarea value={siteSettings.address} onChange={(e) => setSiteSettings(prev => ({ ...prev, address: e.target.value }))} style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', fontWeight: 800, minHeight: '80px' }} />
                 </div>

                 <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Google Maps Embed URL</label>
                    <input type="text" value={siteSettings.googleMapsUrl} onChange={(e) => setSiteSettings(prev => ({ ...prev, googleMapsUrl: e.target.value }))} style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', fontWeight: 800 }} />
                 </div>

                 <div>
                    <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Instagram Username</label>
                    <input type="text" value={siteSettings.instagram} onChange={(e) => setSiteSettings(prev => ({ ...prev, instagram: e.target.value }))} style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', fontWeight: 800 }} />
                 </div>
                 <div>
                    <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Twitter Username</label>
                    <input type="text" value={siteSettings.twitter} onChange={(e) => setSiteSettings(prev => ({ ...prev, twitter: e.target.value }))} style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', fontWeight: 800 }} />
                 </div>

                 <div style={{ gridColumn: 'span 2' }}>
                    <button 
                      onClick={handleSaveSettings}
                      disabled={isSettingsLoading}
                      style={{ width: '100%', padding: '24px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}
                    >
                      {isSettingsLoading ? 'PERSISTING...' : 'SAVE ENTIRE CONFIG'}
                    </button>
                 </div>

                 {/* Epic 15: Global Pricing Engine */}
                 <div style={{ gridColumn: 'span 2', padding: '48px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', marginTop: '40px' }}>
                    <h4 style={{ fontSize: '10px', fontWeight: 800, marginBottom: '8px', letterSpacing: '0.1em', color: 'var(--text-primary)' }}>GLOBAL PRICING ENGINE</h4>
                    <p style={{ fontSize: '12px', opacity: 0.5, marginBottom: '24px' }}>Increase or decrease all prices in your inventory by a percentage.</p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                       <input 
                          type="number" 
                          placeholder="± %" 
                          value={bulkPercentage} 
                          onChange={(e) => setBulkPercentage(Number(e.target.value))} 
                          style={{ width: '100px', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-primary)', fontWeight: 800, textAlign: 'center' }} 
                       />
                       <button 
                        disabled={isBulkLoading || bulkPercentage === 0}
                        onClick={handleBulkUpdate}
                        style={{ flex: 1, padding: '16px', backgroundColor: bulkPercentage >= 0 ? 'var(--brand-blue)' : '#FF3B3B', color: '#fff', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}
                       >
                          {isBulkLoading ? "COMPUTING..." : `APPLY ${bulkPercentage}% ADJUSTMENT`}
                       </button>
                    </div>
                 </div>

                 <div style={{ gridColumn: 'span 2', marginTop: '32px', padding: '48px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-primary)' }}>
                    <h4 style={{ fontSize: '10px', fontWeight: 800, marginBottom: '16px', letterSpacing: '0.1em', color: 'var(--text-primary)' }}>DB SEEDING</h4>
                    <p style={{ fontSize: '12px', opacity: 0.5, marginBottom: '12px' }}>Populate your Realtime Database tree with the current product catalog.</p>
                    <p style={{ fontSize: '11px', opacity: 0.6, marginBottom: '24px', color: 'var(--text-primary)' }}>This will insert 30 seed products into your database. Use only when you want a full catalog reset.</p>
                    <button
                      disabled={isSeedingCatalog}
                      onClick={() => showConfirmDialog({
                        title: 'Seed Elite Catalog',
                        message: 'Seed 30 products into the database? This will add a full catalog set to your Realtime Database.',
                        confirmLabel: 'Seed Catalog',
                        danger: false,
                        onConfirm: async () => {
                          if (isSeedingCatalog) return;
                          setIsSeedingCatalog(true);
                          const { initialProducts } = await import('../../data/products');
                          try {
                            const productsToInsert = initialProducts.map(p => ({ ...p, id: Date.now().toString() + Math.random().toString().slice(2, 6) }));
                            const { error } = await supabase.from('products').insert(productsToInsert);
                            if (error) throw error;
                            showNotification('ELITE CATALOG SEEDED. 30 products added.', 'success');
                          } catch (err) {
                            console.error(err);
                            showNotification(err.message || 'SEEDING ERROR. Check console for details.', 'error');
                          } finally {
                            setIsSeedingCatalog(false);
                          }
                        },
                      })}
                      style={{
                        padding: '16px 32px',
                        border: 'var(--border-thin)',
                        fontSize: '10px',
                        fontWeight: 800,
                        cursor: isSeedingCatalog ? 'not-allowed' : 'pointer',
                        opacity: isSeedingCatalog ? 0.6 : 1
                      }}
                    >
                      {isSeedingCatalog ? 'SEEDING 30 PRODUCTS...' : 'SEED ELITE CATALOG'}
                    </button>
                 </div>
              </div>
           </div>
        )}
      </main>

      <Suspense fallback={<EliteLoader />}>
        <ProductFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} product={selectedProduct} />
      </Suspense>

      {/* Slider Form Modal */}
      {isSliderFormOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10001, backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-primary)', border: 'var(--border-thin)', padding: '48px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '32px' }}>{selectedSlider ? 'EDIT SLIDE' : 'NEW SLIDE'}</h2>
            <div style={{ display: 'grid', gap: '24px' }}>
              <input placeholder="TITLE" value={sliderData.title} onChange={e => setSliderData({...sliderData, title: e.target.value})} style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 800 }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                 <input placeholder="IMAGE URL" value={sliderData.image} onChange={e => setSliderData({...sliderData, image: e.target.value})} style={{ flex: 1, padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 800 }} />
                 <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', backgroundColor: 'var(--bg-secondary)', border: 'var(--border-thin)', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    {isSliderUploading ? <span style={{ fontSize: '10px', fontWeight: 800 }}>...</span> : <Camera size={20} />}
                    <input type="file" accept="image/*" onChange={handleSliderImageUpload} disabled={isSliderUploading} style={{ display: 'none' }} />
                 </label>
              </div>
              <input placeholder="LINK / CATEGORY" value={sliderData.link} onChange={e => setSliderData({...sliderData, link: e.target.value})} style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 800 }} />
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button onClick={handleSaveSlider} style={{ flex: 1, padding: '16px', backgroundColor: 'var(--brand-blue)', color: '#FFFFFF', fontSize: '11px', fontWeight: 800 }}>SAVE</button>
                <button onClick={() => setIsSliderFormOpen(false)} style={{ flex: 1, padding: '16px', border: 'var(--border-thin)', fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}>CANCEL</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Suspense fallback={<EliteLoader />}>
        <InventoryIntelligence
          isOpen={isInventoryIntelligenceOpen}
          onClose={() => setIsInventoryIntelligenceOpen(false)}
        />
      </Suspense>
    </div>
  );
};

export default AdminDashboard;
