import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { initialProducts } from '../data/products';
import emailjs from '@emailjs/browser';
import { supabase } from '../supabase';
import { sanitizeString, validateEmail, sanitizeObject } from '../utils/SecurityUtils';
import { createOrderDate, createOrderId, createErrorOrderId } from '../utils/OrderUtils';
import ConfirmModal from '../components/admin/DeleteConfirmModal';
import { templateConfig as defaultSettings } from '../config/template';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('ifeco-cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('ifeco-user-profile');
    return saved ? JSON.parse(saved) : null;
  }); // Role, name, etc.
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ifeco-theme');
    return saved ? JSON.parse(saved) : false; // Default to Light Mode (false)
  });
  const [currency, setCurrency] = useState('NGN');
  const [exchangeRate, setExchangeRate] = useState(1600);
  const [categoryFilter, setCategoryFilter] = useState(() => localStorage.getItem('ifeco-category') || 'all');
  const [comparisonList, setComparisonList] = useState([]);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('ifeco-wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('ifeco-search-history');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeFilters, setActiveFilters] = useState(() => {
    const saved = localStorage.getItem('ifeco-filters');
    return saved ? JSON.parse(saved) : {
      priceRange: [0, 5000000], 
      brands: [],
      conditions: [],
      storage: [],
      colors: [],
      inStock: false,
      sortBy: 'featured' 
    };
  });

  const [notification, setNotification] = useState(null);
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    window.clearTimeout(window.__ifecoNotificationTimeout);
    window.__ifecoNotificationTimeout = window.setTimeout(() => setNotification(null), 4000);
  };

  const [dialog, setDialog] = useState(null);
  const dialogRef = useRef(null);
  useEffect(() => {
    dialogRef.current = dialog;
  }, [dialog]);

  const closeDialog = useCallback(() => setDialog(null), []);

  const showConfirmDialog = useCallback(({ title, message, confirmLabel = 'Confirm', onConfirm, danger = false }) => {
    setDialog({ type: 'confirm', title, message, confirmLabel, danger, onConfirm });
  }, []);

  const showAlertDialog = useCallback(({ title, message, okLabel = 'OK' }) => {
    setDialog({ type: 'alert', title, message, okLabel });
  }, []);

  const submitConfirmDialog = useCallback(async () => {
    const d = dialogRef.current;
    if (d?.type === 'confirm' && typeof d.onConfirm === 'function') {
      await d.onConfirm();
    }
    setDialog(null);
  }, []);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates && data.rates.NGN) {
          setExchangeRate(data.rates.NGN);
        }
      })
      .catch(err => console.error("Exchange API mapping failed. Falling back to static cache.", err));
  }, []);

  const [siteSettings, setSiteSettings] = useState(defaultSettings);
  const [heroSlides, setHeroSlides] = useState([
    { id: '1', title: "iPhones.", subtitle: "UK USED & BRAND NEW AT THE BEST PRICES.", image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba30a8?auto=format&fit=crop&q=80&w=2000", link: "Phones" },
    { id: '2', title: "Laptops.", subtitle: "PRO PERFORMANCE FOR THE ELITE MIND.", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=2000", link: "Laptops" },
    { id: '3', title: "Eco.System", subtitle: "THE ULTIMATE TECH COMPANIONS.", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=2000", link: "Accessories" }
  ]);
  const [feedItems, setFeedItems] = useState([
    { id: '1', title: "iPhone 16 Pro", image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba30a8?auto=format&fit=crop&q=80&w=1000", category: "Phones" },
    { id: '2', title: "Galaxy S24 Ultra", image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=1000", category: "Phones" },
    { id: '3', title: "Elite Sound.", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000", category: "Accessories" },
    { id: '4', title: "MacBook Pro", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000", category: "Laptops" }
  ]);

  // 1. Auth Pipeline
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    const handleSession = async (session) => {
      const currentUser = session?.user;
      setUser(currentUser);
      
      if (currentUser) {
        const { data: profile } = await supabase.from('users').select('*').eq('id', currentUser.id).single();
        if (profile) {
           setUserProfile(profile);
           localStorage.setItem('ifeco-user-profile', JSON.stringify(profile));
           setLoading(false);
        } else {
           const newProfile = {
             id: currentUser.id,
             email: currentUser.email,
             role: 'user',
             display_name: sanitizeString(currentUser.user_metadata?.full_name || 'Client'),
           };
           const { error: insertError } = await supabase.from('users').insert(newProfile);
           if (insertError) {
             // If it's a duplicate key conflict, the profile likely exists — fetch it
             if (insertError.code === '23505') {
               const { data: existingProfile } = await supabase.from('users').select('*').eq('id', currentUser.id).single();
               if (existingProfile) {
                 setUserProfile(existingProfile);
                 localStorage.setItem('ifeco-user-profile', JSON.stringify(existingProfile));
                 setLoading(false);
                 return;
               }
             }
             console.error('Failed to create user profile:', insertError);
             showNotification(`Failed to create user profile: ${insertError.message}`, 'error');
           } else {
             setUserProfile(newProfile);
             localStorage.setItem('ifeco-user-profile', JSON.stringify(newProfile));
           }
           setLoading(false);
        }
      } else {
        setUserProfile(null);
        localStorage.removeItem('ifeco-user-profile');
        setLoading(false);
      }
    };

    return () => subscription.unsubscribe();
  }, []);

  // 1.1 Session Inactivity Timeout
  useEffect(() => {
    const checkTimeout = () => {
      const lastActive = localStorage.getItem('ifeco-last-activity');
      if (lastActive) {
        const diff = Date.now() - parseInt(lastActive);
        if (diff > 10 * 60 * 1000) { // 10 Minutes
          localStorage.removeItem('ifeco-last-activity');
          window.location.href = '/'; 
        }
      }
      localStorage.setItem('ifeco-last-activity', Date.now().toString());
    };

    window.addEventListener('mousedown', checkTimeout);
    window.addEventListener('keydown', checkTimeout);
    return () => {
      window.removeEventListener('mousedown', checkTimeout);
      window.removeEventListener('keydown', checkTimeout);
    };
  }, []);

  // 2. Real-time Listeners (Supabase RT)
  useEffect(() => {
    const fetchAllData = async () => {
      const { data: prods } = await supabase.from('products').select('*');
      if (prods && prods.length > 0) setProducts(prods);

      const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100);
      if (ords) setOrders(ords);

      const { data: settings } = await supabase.from('site_settings').select('*');
      if (settings && settings.length > 0) {
        const general = settings.find(s => s.key === 'general');
        if (general && general.value) {
          // DB is the single source of truth — replace state entirely with what's in Supabase
          setSiteSettings(general.value);
        }

        const hero = settings.find(s => s.key === 'heroSlides');
        if (hero && hero.value) setHeroSlides(hero.value);

        const feed = settings.find(s => s.key === 'feedItems');
        if (feed && feed.value) setFeedItems(feed.value);
      }
    };

    fetchAllData();

    const channel = supabase.channel('public-db')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, fetchAllData)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // 3. Theme
  useEffect(() => {
    localStorage.setItem('ifeco-theme', JSON.stringify(darkMode));
    if (darkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
  }, [darkMode]);

  // 4. Persistence
  useEffect(() => {
    localStorage.setItem('ifeco-cart', JSON.stringify(cart));
    localStorage.setItem('ifeco-category', categoryFilter);
    localStorage.setItem('ifeco-wishlist', JSON.stringify(wishlist));
    localStorage.setItem('ifeco-filters', JSON.stringify(activeFilters));
  }, [cart, categoryFilter, wishlist, activeFilters]);

  // --- ACTIONS ---

  const login = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
      console.error('Google login failed:', error);
      showNotification('Login failed. Please try again.', 'error');
    }
  };
  const logout = () => supabase.auth.signOut();

  const addToCart = (product, condition, color = 'Standard') => {
    const cartId = `${product.id}-${condition}-${color}`;
    const existingItem = cart.find(item => item.cartId === cartId);
    if (existingItem) {
      setCart(cart.map(item => item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, cartId, selectedCondition: condition, selectedColor: color, quantity: 1 }]);
    }
  };

  const removeFromCart = (cartId) => setCart(cart.filter(item => item.cartId !== cartId));
  const updateQuantity = (cartId, delta) => {
    setCart(cart.map(item => {
      if (item.cartId === cartId) return { ...item, quantity: Math.max(1, item.quantity + delta) };
      return item;
    }));
  };

  const loadMoreOrders = async () => {
    if (orders.length === 0) return;
    const lastOrder = orders[orders.length - 1];
    const { data: moreOrds } = await supabase.from('orders').select('*')
      .lt('created_at', lastOrder.created_at)
      .order('created_at', { ascending: false })
      .limit(100);
    if (moreOrds && moreOrds.length > 0) {
      setOrders(prev => [...prev, ...moreOrds]);
    }
  };

  const clearCart = () => setCart([]);

  const placeOrder = async (orderDetails) => {
    const total = orderDetails.total;
    const sanitizedEmail = sanitizeString(orderDetails.email);

    if (!validateEmail(sanitizedEmail)) {
      throw new Error("Industrial Validation Failed: Invalid Email Format.");
    }

    const orderId = createOrderId();
    const newOrder = {
      id: orderId,
      date: createOrderDate(),
      status: 'processing',
      email: sanitizedEmail,
      total: total,
      items: orderDetails.items,
      location: orderDetails.location,
      shipping_fee: orderDetails.shippingFee,
      reference: orderDetails.reference,
      platform: orderDetails.platform
    };

    const emailParams = {
      to_email: sanitizedEmail,
      order_id: orderId,
      items: orderDetails.items.join(', '),
      total_amount: formatPrice(total),
      customer_name: sanitizeString(userProfile?.display_name || 'Elite Customer')
    }; 

    try {
      const { data, error } = await supabase.from('orders').insert(newOrder).select().single();
      if (error) throw error;
      
      const createdOrder = data;

      const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY && SERVICE_ID !== "your_service_id_here") {
        emailjs.send(SERVICE_ID, TEMPLATE_ID, emailParams, PUBLIC_KEY)
          .then(() => console.log("Elite Invoice Dispatched."))
          .catch((err) => console.error("EmailJS Failed.", err));
      } else {
        console.warn("EmailJS Not Configured.");
      }

      return createdOrder;
    } catch (err) {
      console.error('Order placement failed:', err);
      const fallbackOrder = { id: createErrorOrderId(), ...newOrder };
      setOrders([fallbackOrder, ...orders]);
      return fallbackOrder;
    }
  };

  const formatPrice = (price) => {
    if (currency === 'USD') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price / exchangeRate);
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price);
  };

  const downloadInvoice = (order) => {
    const content = `INVOICE\nID: ${order.id}\nDate: ${order.date}\nTotal: ${formatPrice(order.total || order.price)}\nRef: ${order.reference}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${order.id}.txt`;
    a.click();
  };

  const toggleComparison = (product) => {
    if (comparisonList.find(p => p.id === product.id)) setComparisonList(comparisonList.filter(p => p.id !== product.id));
    else if (comparisonList.length < 3) setComparisonList([...comparisonList, product]);
    else showNotification("Maximum 3 products for comparison.", 'error');
  };

  const toggleWishlist = (product) => {
    if (wishlist.find(p => p.id === product.id)) {
      setWishlist(wishlist.filter(p => p.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const addToSearchHistory = (query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== trimmedQuery.toLowerCase());
      const newHistory = [trimmedQuery, ...filtered].slice(0, 10);
      localStorage.setItem('ifeco-search-history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('ifeco-search-history');
  };

  const bulkUpdatePrices = async (percentage) => {
    if (percentage <= -100) return { success: false, error: 'Percentage reduction must be greater than -100.' };

    const updates = products.map(p => {
      let newBrandNew = p.prices?.brandNew;
      let newUkUsed = p.prices?.ukUsed;
      
      if (typeof newBrandNew === 'number') newBrandNew = Math.max(1, Math.round(newBrandNew * (1 + percentage / 100)));
      if (typeof newUkUsed === 'number') newUkUsed = Math.max(1, Math.round(newUkUsed * (1 + percentage / 100)));
      
      return { id: p.id, prices: { ...p.prices, brandNew: newBrandNew, ukUsed: newUkUsed } };
    });

    try {
      // Supabase allows upsert for bulk updates
      const { error } = await supabase.from('products').upsert(updates);
      if (error) throw error;
      return { success: true };
    } catch (e) {
      console.error("Bulk Update Failed", e);
      return { success: false, error: e };
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      return { success: true };
    } catch (e) {
      console.error("Status Update Failed", e);
      return { success: false, error: e };
    }
  };

  const updateSiteSettings = async (newSettings) => {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'general', value: newSettings }, { onConflict: 'key' });

    if (error) {
      console.error("Settings Update Failed:", error);
      return { success: false, error: error.message };
    }
    // Also update local state immediately so UI reflects the change without waiting for a refetch
    setSiteSettings(prev => ({ ...prev, ...newSettings }));
    return { success: true };
  };

  const updateFilter = (filterType, value) => {
    setActiveFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      priceRange: [0, 5000000],
      brands: [],
      conditions: [],
      storage: [],
      colors: [],
      inStock: false,
      sortBy: 'featured'
    });
  };

  const getFilteredProducts = (productList = products) => {
    let filtered = [...productList];
    if (categoryFilter !== 'all') filtered = filtered.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase());
    filtered = filtered.filter(p => {
      const price = p.prices?.brandNew || p.prices?.ukUsed || 0;
      return price >= activeFilters.priceRange[0] && price <= activeFilters.priceRange[1];
    });
    if (activeFilters.brands.length > 0) filtered = filtered.filter(p => activeFilters.brands.includes(p.brand));
    if (activeFilters.conditions.length > 0) {
      filtered = filtered.filter(p => activeFilters.conditions.some(cond => p.prices && p.prices[cond]));
    }
    if (activeFilters.storage.length > 0) {
      filtered = filtered.filter(p => {
        const specs = p.specs || {};
        return activeFilters.storage.some(storage => specs.Storage?.includes(storage));
      });
    }
    if (activeFilters.colors.length > 0) {
      filtered = filtered.filter(p => p.colors && p.colors.some(color => activeFilters.colors.includes(color)));
    }
    if (activeFilters.inStock) filtered = filtered.filter(p => (p.stock || 0) > 0);

    switch (activeFilters.sortBy) {
      case 'price-low': filtered.sort((a, b) => (a.prices?.brandNew || 0) - (b.prices?.brandNew || 0)); break;
      case 'price-high': filtered.sort((a, b) => (b.prices?.brandNew || 0) - (a.prices?.brandNew || 0)); break;
      case 'newest': filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)); break;
      case 'rating': filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: break;
    }
    return filtered;
  };

  return (
    <AppContext.Provider value={{
      products, setProducts,
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      orders, loadMoreOrders, placeOrder,
      user, userProfile, login, loginWithGoogle, logout, loading,
      siteSettings, setSiteSettings,
      darkMode, setDarkMode,
      currency, setCurrency, formatPrice,
      categoryFilter, setCategoryFilter,
      comparisonList, toggleComparison,
      downloadInvoice, bulkUpdatePrices, updateOrderStatus,
      updateSiteSettings,
      heroSlides, feedItems,
      wishlist, toggleWishlist,
      searchHistory, addToSearchHistory, clearSearchHistory,
      activeFilters, updateFilter, clearAllFilters, getFilteredProducts,
      notification, showNotification,
      showConfirmDialog, showAlertDialog, closeDialog
    }}>
      {children}
      {dialog && (
        <ConfirmModal
          isOpen
          variant={dialog.type === 'alert' ? 'alert' : 'confirm'}
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.type === 'alert' ? (dialog.okLabel || 'OK') : dialog.confirmLabel}
          danger={dialog.type === 'confirm' && !!dialog.danger}
          onConfirm={dialog.type === 'alert' ? closeDialog : submitConfirmDialog}
          onCancel={closeDialog}
        />
      )}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
