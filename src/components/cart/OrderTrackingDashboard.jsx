import React, { useMemo } from 'react';
import { useAppContext } from "../../context/AppContext";
import { Truck, MapPin, Clock, CheckCircle, Package, AlertCircle } from 'lucide-react';

const OrderTrackingDashboard = ({ orderId, onClose }) => {
  const { orders, formatPrice } = useAppContext();

  const generateTrackingUpdates = (order) => {
    const updates = [];
    const now = new Date();
    const orderDate = new Date(order.date);

    // Order placed
    updates.push({
      status: 'Order Placed',
      timestamp: orderDate,
      description: 'Your order has been received and is being processed.',
      completed: true,
      icon: Package
    });

    // Processing
    const processingDate = new Date(orderDate.getTime() + 2 * 60 * 60 * 1000);
    updates.push({
      status: 'Processing',
      timestamp: processingDate,
      description: 'Your order is being prepared for shipment.',
      completed: now > processingDate,
      icon: CheckCircle
    });

    // Shipped
    const shippedDate = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000);
    updates.push({
      status: 'Shipped',
      timestamp: shippedDate,
      description: `Your order has been shipped via ${order.shippingMethod || 'Standard Delivery'}.`,
      completed: now > shippedDate,
      icon: Truck
    });

    // Out for delivery
    const deliveryDate = new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    updates.push({
      status: 'Out for Delivery',
      timestamp: deliveryDate,
      description: 'Your order is out for delivery and will arrive today.',
      completed: now > deliveryDate,
      icon: MapPin
    });

    // Delivered
    const deliveredDate = new Date(orderDate.getTime() + 3.5 * 24 * 60 * 60 * 1000);
    updates.push({
      status: 'Delivered',
      timestamp: deliveredDate,
      description: 'Your order has been successfully delivered.',
      completed: now > deliveredDate,
      icon: CheckCircle
    });

    return updates;
  };

  const currentOrder = useMemo(() => orders.find(o => o.id === orderId), [orderId, orders]);
  const trackingUpdates = useMemo(
    () => (currentOrder ? generateTrackingUpdates(currentOrder) : []),
    [currentOrder]
  );

  const getCurrentStatus = () => {
    const completedUpdates = trackingUpdates.filter(update => update.completed);
    return completedUpdates.length > 0 ? completedUpdates[completedUpdates.length - 1] : null;
  };

  const getEstimatedDelivery = () => {
    if (!currentOrder) return null;
    const orderDate = new Date(currentOrder.date);
    return new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
  };

  if (!currentOrder) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-primary)',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <AlertCircle size={48} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Order Not Found
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Unable to find tracking information for this order.
          </p>
        </div>
      </div>
    );
  }

  const currentStatus = getCurrentStatus();
  const estimatedDelivery = getEstimatedDelivery();

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      minHeight: '100vh',
      padding: '80px 0'
    }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <Truck size={24} color="var(--brand-blue)" />
            <h1 style={{
              fontSize: '32px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 0
            }}>
              ORDER TRACKING
            </h1>
          </div>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            Order #{currentOrder.id} • {formatPrice(currentOrder.total)}
          </p>
        </div>

        {/* Current Status Card */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: 'var(--border-thin)',
          padding: '32px',
          marginBottom: '40px',
          borderRadius: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            {currentStatus && <currentStatus.icon size={24} color="var(--brand-blue)" />}
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: 0,
                marginBottom: '4px'
              }}>
                {currentStatus?.status || 'Processing Order'}
              </h2>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                margin: 0
              }}>
                {currentStatus?.description || 'Your order is being processed.'}
              </p>
            </div>
          </div>

          {estimatedDelivery && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '4px'
            }}>
              <Clock size={16} color="var(--text-secondary)" />
              <span style={{
                fontSize: '13px',
                color: 'var(--text-primary)',
                fontWeight: 600
              }}>
                Estimated Delivery: {estimatedDelivery.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>

        {/* Tracking Timeline */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: 'var(--border-thin)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {trackingUpdates.map((update, index) => {
            const IconComponent = update.icon;
            return (
              <div
                key={update.status}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '24px',
                  borderBottom: index < trackingUpdates.length - 1 ? 'var(--border-thin)' : 'none',
                  backgroundColor: update.completed ? 'var(--bg-primary)' : 'transparent',
                  opacity: update.completed ? 1 : 0.6
                }}
              >
                <div style={{
                  flexShrink: 0,
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: update.completed ? 'var(--brand-blue)' : 'var(--bg-primary)',
                  border: update.completed ? 'none' : 'var(--border-thin)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconComponent
                    size={20}
                    color={update.completed ? '#fff' : 'var(--text-secondary)'}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    margin: 0,
                    marginBottom: '4px'
                  }}>
                    {update.status}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    marginBottom: '8px'
                  }}>
                    {update.description}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    opacity: 0.8,
                    margin: 0
                  }}>
                    {update.timestamp.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Details */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: 'var(--border-thin)',
          padding: '32px',
          marginTop: '40px',
          borderRadius: '8px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: 0,
            marginBottom: '24px'
          }}>
            Order Details
          </h3>

          <div style={{ display: 'grid', gap: '16px' }}>
            {currentOrder.items.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '4px'
              }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: 0,
                    marginBottom: '4px'
                  }}>
                    {item.name}
                  </h4>
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    Quantity: {item.quantity} • {formatPrice(item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '40px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--brand-blue)',
              color: '#fff',
              border: 'none',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer'
            }}
          >
            Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingDashboard;