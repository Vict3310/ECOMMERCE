import React, { useMemo } from 'react';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import OrderTrackingDashboard from '../components/cart/OrderTrackingDashboard';

const Pipeline = ({ status }) => {
  const states = ['processing', 'shipped', 'delivered'];
  const currentIndex = states.indexOf(status) === -1 ? 0 : states.indexOf(status);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', marginTop: '24px' }}>
       <div style={{ position: 'absolute', top: '16px', left: '10%', right: '10%', height: '2px', backgroundColor: 'var(--border-thin)', zIndex: 0 }} />
       <div style={{ position: 'absolute', top: '16px', left: '10%', right: `${100 - (currentIndex * 50)}%`, height: '2px', backgroundColor: 'var(--brand-blue)', zIndex: 0, transition: 'right 0.5s ease' }} />
       
       {[
         { id: 'processing', icon: Clock, label: 'PROCESSING' },
         { id: 'shipped', icon: Truck, label: 'SHIPPED' },
         { id: 'delivered', icon: CheckCircle, label: 'DELIVERED' }
       ].map((step, idx) => {
         const isActive = idx <= currentIndex;
         const StepIcon = step.icon;
         return (
           <div key={step.id} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: isActive ? 'var(--brand-blue)' : 'var(--bg-secondary)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                border: `2px solid ${isActive ? 'var(--brand-blue)' : 'var(--border-thin)'}`,
                transition: 'all 0.3s ease'
              }}>
                 <StepIcon size={14} />
              </div>
              <span style={{ fontSize: '9px', fontWeight: 800, opacity: isActive ? 1 : 0.4 }}>{step.label}</span>
           </div>
         );
       })}
    </div>
  );
};

const Orders = () => {
  const { orders, formatPrice, downloadInvoice, user, showNotification } = useAppContext();
  const [searchId, setSearchId] = React.useState('');
  const [searchResult, setSearchResult] = React.useState(null);
  const [trackingOrderId, setTrackingOrderId] = React.useState(null);

  const myOrders = useMemo(() => {
     if (!user) return [];
     return orders.filter(o => 
       (user?.email && o.email === user.email) || 
       (user?.uid && o.userId === user.uid)
     );
  }, [orders, user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchId) return;
    const found = orders.find(o => o.id === searchId || o.reference === searchId || o.reference === `WA-${searchId}`);
    if (found) setSearchResult(found);
    else showNotification("ORDER ID NOT RECOGNIZED. PLEASE VERIFY YOUR WHATSAPP RECEIPT.", 'error');
  };



  if (myOrders.length === 0) {
    return (
      <div className="fade-in container" style={{ padding: '120px 24px', textAlign: 'center', height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Package size={64} style={{ opacity: 0.1, marginBottom: '24px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>NO ACTIVE ORDERS.</h2>
        <p style={{ opacity: 0.5, fontSize: '11px' }}>Your purchase pipeline is empty.</p>
      </div>
    );
  }

  // Show tracking dashboard if an order is selected for tracking
  if (trackingOrderId) {
    return (
      <OrderTrackingDashboard
        orderId={trackingOrderId}
        onClose={() => setTrackingOrderId(null)}
      />
    );
  }

  return (
    <div className="fade-in container mobile-p-24" style={{ padding: '80px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: '8px' }}>Tracking.</h1>
        <p style={{ opacity: 0.5, fontSize: '11px', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '48px' }}>MONITOR YOUR HARDWARE PIPELINE</p>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '80px', padding: '12px', backgroundColor: 'var(--bg-secondary)', border: 'var(--border-thin)', borderRadius: '2px' }}>
           <input 
             type="text" 
             placeholder="ENTER ORDER ID (E.G. ORD-723145)" 
             value={searchId}
             onChange={(e) => setSearchId(e.target.value.toUpperCase())}
             style={{ flex: 1, padding: '16px 24px', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 800, outline: 'none' }} 
           />
           <button style={{ padding: '16px 32px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', borderRadius: '2px', fontSize: '10px', fontWeight: 900 }}>TRACK SHIPMENT</button>
        </form>

        {searchResult && (
           <div style={{ marginBottom: '80px', padding: '48px', border: '2px solid var(--brand-blue)', backgroundColor: 'var(--bg-primary)', borderRadius: '2px', position: 'relative' }}>
              <button 
                onClick={() => setSearchResult(null)}
                style={{ position: 'absolute', top: '24px', right: '24px', fontSize: '10px', fontWeight: 800, opacity: 0.4 }}
              >
                CLOSE
              </button>
              <h3 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.2em', marginBottom: '32px' }}>QUICK SEARCH RESULT</h3>
              <OrderCard order={searchResult} formatPrice={formatPrice} downloadInvoice={downloadInvoice} />
           </div>
        )}

        <div style={{ display: 'grid', gap: '32px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.2em', opacity: 0.4 }}>MY RECENT ORDERS</h3>
          {myOrders.length === 0 ? (
             <div style={{ padding: '48px', textAlign: 'center', opacity: 0.3, border: 'var(--border-thin)', borderRadius: '2px' }}>
                <p style={{ fontSize: '11px', fontWeight: 800 }}>NO PERSISTED ORDERS FOUND FOR THIS ACCOUNT.</p>
             </div>
          ) : (
            myOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                formatPrice={formatPrice}
                downloadInvoice={downloadInvoice}
                onTrackOrder={setTrackingOrderId}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

function OrderCard({ order, formatPrice, downloadInvoice, onTrackOrder }) {
  return (
    <div style={{ border: 'var(--border-thin)', padding: '32px', backgroundColor: 'var(--bg-primary)', borderRadius: '2px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
      <div>
        <span style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4 }}>ORDER ID</span>
        <p style={{ fontSize: '14px', fontWeight: 800 }}>{order.id || order.reference}</p>
        <p style={{ fontSize: '11px', opacity: 0.6, marginTop: '8px' }}>Placed on {order.date || 'RECENT'}</p>
      </div>
      <div style={{ textAlign: 'right' }}>
         <p style={{ fontSize: '20px', fontWeight: 800 }}>{formatPrice(order.total || order.price)}</p>
         <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
           <button onClick={() => downloadInvoice(order)} style={{ fontSize: '9px', fontWeight: 800, opacity: 0.5, cursor: 'pointer', textDecoration: 'underline' }}>DOWNLOAD INVOICE</button>
           <button
             onClick={() => onTrackOrder(order.id)}
             style={{
               fontSize: '9px',
               fontWeight: 800,
               color: 'var(--brand-blue)',
               cursor: 'pointer',
               textDecoration: 'underline'
             }}
           >
             TRACK ORDER
           </button>
         </div>
      </div>
    </div>

    <div className="thin-border-top" style={{ paddingTop: '32px' }}>
       <h4 style={{ fontSize: '11px', fontWeight: 800, marginBottom: '16px' }}>LOGISTICS STATUS</h4>
       <Pipeline status={order.status || 'processing'} />
    </div>
  </div>
  );
}

export default Orders;
