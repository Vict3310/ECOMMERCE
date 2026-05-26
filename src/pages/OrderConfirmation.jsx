import React, { useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const STORAGE_KEY = 'ifeco-order-confirmation';

function readStoredOrder() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formatPrice, downloadInvoice } = useAppContext();

  const order = useMemo(() => {
    if (location.state?.order) return location.state.order;
    return readStoredOrder();
  }, [location.state]);

  useEffect(() => {
    if (location.state?.order) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(location.state.order));
      } catch {
        /* ignore */
      }
    }
  }, [location.state]);

  if (!order) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>NO CONFIRMATION FOUND.</h2>
          <p style={{ opacity: 0.6, marginTop: '16px' }}>Please return to the shop to place an order first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in container" style={{ padding: '80px 24px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
        <CheckCircle size={72} color="var(--brand-blue)" />
        <h1 style={{ fontSize: '40px', fontWeight: 800, margin: '24px 0 16px' }}>ORDER CONFIRMED</h1>
        <p style={{ fontSize: '14px', opacity: 0.6, marginBottom: '32px' }}>Your request has been logged and is now under review by the Ifeco team.</p>

        <div style={{ padding: '32px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: 'var(--border-thin)', textAlign: 'left', marginBottom: '32px' }}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase' }}>Order Reference</span>
              <p style={{ fontSize: '18px', fontWeight: 800, margin: '8px 0 0' }}>{order.reference || order.id}</p>
            </div>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase' }}>Total Paid</span>
              <p style={{ fontSize: '18px', fontWeight: 800, margin: '8px 0 0' }}>{formatPrice(order.total)}</p>
            </div>
            {order.location && (
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase' }}>Delivery</span>
                <p style={{ fontSize: '18px', fontWeight: 800, margin: '8px 0 0' }}>{order.location.toUpperCase()}</p>
              </div>
            )}
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase' }}>Contact Email</span>
              <p style={{ fontSize: '18px', fontWeight: 800, margin: '8px 0 0' }}>{order.email}</p>
            </div>
            {order.items && (
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase' }}>Items</span>
                <ul style={{ margin: '8px 0 0', paddingLeft: '16px', listStyleType: 'disc', fontSize: '13px', lineHeight: 1.8 }}>
                  {order.items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          <button
            type="button"
            onClick={() => downloadInvoice(order)}
            style={{
              padding: '18px 24px',
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              fontWeight: 800,
              textTransform: 'uppercase',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <FileText size={16} /> Download Invoice
          </button>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            style={{
              padding: '18px 24px',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontWeight: 800,
              textTransform: 'uppercase',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Package size={16} /> View Order Status
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              padding: '18px 24px',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-thin)',
              fontWeight: 800,
              textTransform: 'uppercase',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            Continue Shopping <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
