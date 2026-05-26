import React, { useLayoutEffect, useRef, useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { gsap } from 'gsap';
import { sanitizeString, validateEmail } from '../../utils/SecurityUtils';

const createRandomOrderRef = () => `ORD-${Math.floor(Math.random() * 1000000000 + 1)}`;
const createWhatsAppOrderId = () => `ORD-${Date.now().toString().slice(-6)}`;

const CartDrawer = ({ isOpen, onClose, onOrderComplete }) => {
  const { cart, removeFromCart, updateQuantity, siteSettings, placeOrder, clearCart, formatPrice, products, addToCart, user, userProfile, currency, exchangeRate, showNotification } = useAppContext();
  const [guestEmail, setGuestEmail] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('ikeja');
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  const locations = [
    { id: 'ikeja', label: 'Ikeja (Pickup)', fee: 0 },
    { id: 'lekki', label: 'Lekki / Ajah', fee: 5000 },
    { id: 'surulere', label: 'Surulere / Yaba', fee: 3000 },
    { id: 'abuja', label: 'Abuja / PH', fee: 10000 },
    { id: 'nationwide', label: 'Nationwide Delivery', fee: 7000 },
  ];

  const shippingFee = (locations.find(l => l.id === selectedLocation)?.fee || 0) * (currency === 'USD' ? (1/exchangeRate) : 1);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (isOpen) {
        gsap.to(overlayRef.current, { opacity: 1, visibility: 'visible', duration: 0.4 });
        gsap.to(drawerRef.current, { x: 0, duration: 0.6, ease: "expo.out" });
      } else {
        gsap.to(overlayRef.current, { opacity: 0, visibility: 'hidden', duration: 0.4 });
        gsap.to(drawerRef.current, { x: '100%', duration: 0.6, ease: "expo.in" });
      }
    });
    return () => ctx.revert();
  }, [isOpen]);

  const subtotal = cart.reduce((acc, item) => acc + (item.prices[item.selectedCondition] * item.quantity), 0);
  const [checkoutPhase, setCheckoutPhase] = useState('details');
  const [paymentMethod, setPaymentMethod] = useState('whatsapp');

  // Epic 7: Smart Contextual Cart Recommendations
  const cartIds = cart.map(c => c.id);
  const recommendations = products.filter(p => !cartIds.includes(p.id) && p.prices?.brandNew).slice(0, 2);

  const checkoutEmail = user ? user.email : guestEmail;
  const canReviewOrder = cart.length > 0 && validateEmail(sanitizeString(checkoutEmail));
  const total = subtotal + shippingFee;

  const handleCheckout = async (method = paymentMethod) => {
    const total = subtotal + shippingFee;
    const checkoutEmail = user ? user.email : guestEmail;
    const sanitizedEmail = sanitizeString(checkoutEmail);

    if (!validateEmail(sanitizedEmail)) {
      showNotification("PLEASE ENTER A VALID BUSINESS EMAIL FOR THE INVOICE.", 'error');
      return;
    }

    if (method === 'paystack') {
      if (!window.PaystackPop) {
        showNotification("Paystack is loading...", 'info');
        return;
      }
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_y_our_public_key', 
        email: sanitizedEmail,
        amount: Math.round(total * 100),
        currency: 'NGN',
        ref: createRandomOrderRef(),
        callback: async (response) => {
          const placedOrder = await placeOrder({
            email: sanitizedEmail,
            items: cart.map(item => `${item.name} (${item.selectedCondition}) x${item.quantity}`),
            total: total,
            location: selectedLocation,
            shippingFee: shippingFee,
            reference: response.reference,
            platform: 'paystack'
          });
          if (onOrderComplete) onOrderComplete(placedOrder);
          clearCart();
          onClose();
          showNotification('Order placed successfully!', 'success');
        }
      });
      handler.openIframe();
    } else {
      // WhatsApp Professional Checkout (Elite v15)
      const orderId = createWhatsAppOrderId();
      
      const itemDetails = cart.map(item => 
        `• *${item.name}*%0A` +
        `  _Condition:_ ${item.selectedCondition.toUpperCase()}%0A` +
        `  _Color:_ ${item.selectedColor.toUpperCase()}%0A` +
        `  _Qty:_ ${item.quantity} x ${formatPrice(item.prices[item.selectedCondition])}%0A` +
        `  _Sub:_ ${formatPrice(item.prices[item.selectedCondition] * item.quantity)}`
      ).join('%0A%0A');
      
      const message = `📦 *NEW ORDER - ${siteSettings?.name?.toUpperCase() || 'BRAND'}*%0A%0A` +
                      `🆔 *Order ID:* #${orderId}%0A` +
                      `👤 *Customer:* ${userProfile?.displayName || 'Elite Client'}%0A` +
                      `📧 *Email:* ${sanitizedEmail}%0A` +
                      `📍 *Logistics:* ${selectedLocation.toUpperCase()}%0A%0A` +
                      `🛒 *INVENTORY SELECTION:*%0A${itemDetails}%0A%0A` +
                      `----------------------------%0A` +
                      `💰 *SUBTOTAL:* ${formatPrice(subtotal)}%0A` +
                      `🚚 *SHIPPING:* ${formatPrice(shippingFee)}%0A` +
                      `💎 *TOTAL PAYABLE:* ${formatPrice(total)}%0A` +
                      `----------------------------%0A%0A` +
                      `_Is this unit available for immediate dispatch?_`;

      const whatsappUrl = `https://wa.me/${siteSettings.phone.replace(/[^0-9]/g, '')}?text=${message}`;
      
      const placedOrder = await placeOrder({
        email: sanitizedEmail,
        items: cart.map(item => `${item.name} (${item.selectedCondition}, ${item.selectedColor}) x${item.quantity}`),
        total: total,
        location: selectedLocation,
        shippingFee: shippingFee,
        reference: `WA-${orderId}`,
        platform: 'whatsapp'
      });

      if (onOrderComplete) onOrderComplete(placedOrder);
      window.open(whatsappUrl, '_blank');
      clearCart();
      onClose();
    }
  };

  return (
    <>
      <div 
        ref={overlayRef}
        onClick={onClose}
        style={{ 
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', 
          backdropFilter: 'blur(4px)', zIndex: 9999, visibility: 'hidden', opacity: 0 
        }} 
      />

      <div 
        ref={drawerRef}
        style={{ 
          position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '450px',
          backgroundColor: 'var(--bg-primary)', zIndex: 10000, transform: 'translateX(100%)',
          display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.05)',
          color: 'var(--text-primary)'
        }}
      >
        <div className="thin-border-bottom" style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShoppingBag size={20} strokeWidth={2.5} />
            <h2 style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.1em' }}>YOUR CART ({cart.length})</h2>
          </div>
          <button onClick={onClose} style={{ padding: '8px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }} className="hover-scale">
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {cart.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
               <ShoppingBag size={48} strokeWidth={1} style={{ marginBottom: '24px' }} />
               <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em' }}>EMPTY CART.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {cart.map((item) => (
                <div key={item.cartId} style={{ display: 'flex', gap: '20px' }}>
                  <img src={item.image} style={{ width: '80px', height: '80px', objectFit: 'contain', filter: 'grayscale(1)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 800 }}>{item.name}</h4>
                      <button onClick={() => removeFromCart(item.cartId)} style={{ opacity: 0.5, background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.5 }}>{item.selectedCondition}</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: 'var(--border-thin)', borderRadius: '2px' }}>
                        <button onClick={() => updateQuantity(item.cartId, -1)} style={{ padding: '4px 8px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><Minus size={12} /></button>
                        <span style={{ fontSize: '11px', fontWeight: 800, minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartId, 1)} style={{ padding: '4px 8px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><Plus size={12} /></button>
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: 800 }}>{formatPrice(item.prices[item.selectedCondition] * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {cart.length > 0 && recommendations.length > 0 && (
             <div className="thin-border-top" style={{ padding: '24px 32px', backgroundColor: 'var(--bg-secondary)', marginTop: '32px' }}>
                <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px', opacity: 0.5 }}>FREQUENTLY BOUGHT TOGETHER</p>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {recommendations.map(rec => (
                     <div key={rec.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--bg-primary)', border: 'var(--border-thin)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                           <img src={rec.image} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                           <div>
                              <p style={{ fontSize: '11px', fontWeight: 800 }}>{rec.name}</p>
                              <p style={{ fontSize: '9px', opacity: 0.5 }}>{formatPrice(rec.prices.brandNew)}</p>
                           </div>
                        </div>
                        <button onClick={() => addToCart(rec, 'brandNew')} style={{ padding: '8px 16px', backgroundColor: 'var(--brand-blue)', color: 'var(--bg-primary)', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', borderRadius: '2px' }}>ADD</button>
                     </div>
                  ))}
                </div>
             </div>
          )}
        </div>

        <div className="thin-border-top" style={{ padding: '24px 32px', backgroundColor: 'var(--bg-secondary)' }}>
          {cart.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                {['details', 'review'].map((phase) => (
                  <button
                    key={phase}
                    onClick={() => setCheckoutPhase(phase)}
                    style={{
                      flex: 1,
                      padding: '12px 10px',
                      fontSize: '9px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      borderRadius: '2px',
                      border: 'var(--border-thin)',
                      backgroundColor: checkoutPhase === phase ? 'var(--text-primary)' : 'var(--bg-primary)',
                      color: checkoutPhase === phase ? 'var(--bg-primary)' : 'var(--text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    {phase === 'details' ? 'Order Details' : 'Review Order'}
                  </button>
                ))}
              </div>

              {checkoutPhase === 'details' ? (
                <>
                  <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Delivery Coordinates</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
                    {locations.map(loc => (
                      <button 
                        key={loc.id} 
                        onClick={() => setSelectedLocation(loc.id)}
                        style={{ 
                          padding: '8px 4px', fontSize: '8px', fontWeight: 800, border: 'var(--border-thin)',
                          backgroundColor: selectedLocation === loc.id ? 'var(--text-primary)' : 'var(--bg-primary)',
                          color: selectedLocation === loc.id ? 'var(--bg-primary)' : 'var(--text-primary)',
                          transition: 'all 0.3s',
                          borderRadius: '2px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {loc.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  {!user && (
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Contact Email For Invoice</label>
                      <input 
                        type="email" 
                        placeholder="PRO-USER@EXAMPLE.COM" 
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        style={{ width: '100%', padding: '16px', backgroundColor: 'var(--bg-primary)', border: 'var(--border-thin)', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 800, outline: 'none' }}
                      />
                    </div>
                  )}

                  <button
                    disabled={!canReviewOrder}
                    onClick={() => setCheckoutPhase('review')}
                    style={{
                      width: '100%', padding: '18px', backgroundColor: canReviewOrder ? 'var(--brand-blue)' : 'var(--bg-secondary)',
                      color: canReviewOrder ? '#fff' : 'var(--text-primary)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
                      letterSpacing: '0.15em', borderRadius: '2px', cursor: canReviewOrder ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Review Your Order
                  </button>
                </>
              ) : (
                <>
                  <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.4 }}>CONTACT EMAIL</span>
                      <span style={{ fontSize: '11px', fontWeight: 800 }}>{sanitizeString(checkoutEmail)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.4 }}>LOGISTICS</span>
                      <span style={{ fontSize: '11px', fontWeight: 800 }}>{selectedLocation.toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.4 }}>ITEMS</span>
                      <span style={{ fontSize: '11px', fontWeight: 800 }}>{cart.length}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {['whatsapp', 'paystack'].map(method => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        style={{
                          flex: 1,
                          padding: '12px 10px',
                          fontSize: '9px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          borderRadius: '2px',
                          border: 'var(--border-thin)',
                          backgroundColor: paymentMethod === method ? 'var(--text-primary)' : 'var(--bg-primary)',
                          color: paymentMethod === method ? 'var(--bg-primary)' : 'var(--text-primary)',
                          cursor: 'pointer'
                        }}
                      >
                        {method === 'whatsapp' ? 'WhatsApp' : 'Paystack'}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gap: '4px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.4 }}>SUBTOTAL</span>
                      <span style={{ fontSize: '14px', fontWeight: 800 }}>{formatPrice(subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.4 }}>SHIPPING</span>
                      <span style={{ fontSize: '14px', fontWeight: 800 }}>{shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800 }}>TOTAL</span>
                      <span style={{ fontSize: '24px', fontWeight: 800 }}>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <button
                    disabled={!canReviewOrder}
                    onClick={() => handleCheckout(paymentMethod)}
                    style={{
                      width: '100%', padding: '24px', backgroundColor: 'var(--brand-blue)', color: '#FFFFFF',
                      fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                      opacity: canReviewOrder ? 1 : 0.3,
                      borderRadius: '2px', marginBottom: '8px', cursor: canReviewOrder ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {paymentMethod === 'whatsapp' ? 'Confirm via WhatsApp' : 'Pay with Paystack'} <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => setCheckoutPhase('details')}
                    style={{
                      width: '100%', padding: '18px', backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-thin)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', borderRadius: '2px', cursor: 'pointer'
                    }}
                  >
                    Edit Details
                  </button>
                </>
              )}
            </div>
          )}

          <p style={{ textAlign: 'center', fontSize: '9px', opacity: 0.4, marginTop: '16px', fontWeight: 700 }}>SECURE MONOCHROMATIC TRANSACTIONS.</p>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
