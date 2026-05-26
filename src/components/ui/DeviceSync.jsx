import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Smartphone, Monitor, Tablet, Cloud, Sync, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';

const BASE_LAST_ACTIVE = new Date('2025-01-01T12:00:00Z');
const getDeviceLastActive = (hoursAgo) => new Date(BASE_LAST_ACTIVE.getTime() - hoursAgo * 60 * 60 * 1000);

const DeviceSync = ({ isOpen, onClose }) => {
  const { user, cart, wishlist, activeFilters, categoryFilter } = useAppContext();
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSync, setLastSync] = useState(null);
  const [syncOptions, setSyncOptions] = useState({
    cart: true,
    wishlist: true,
    filters: true,
    preferences: true,
    history: false
  });

  const devices = useMemo(() => {
    if (!user || !isOpen) return [];

    return [
      {
        id: 'current',
        name: 'This Device',
        type: 'desktop',
        lastActive: BASE_LAST_ACTIVE,
        isCurrent: true,
        synced: true
      },
      {
        id: 'phone-001',
        name: 'iPhone 15 Pro',
        type: 'mobile',
        lastActive: getDeviceLastActive(2),
        isCurrent: false,
        synced: true
      },
      {
        id: 'tablet-001',
        name: 'iPad Pro',
        type: 'tablet',
        lastActive: getDeviceLastActive(24),
        isCurrent: false,
        synced: false
      }
    ];
  }, [user, isOpen]);

  const handleSync = async () => {
    setSyncStatus('syncing');

    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In real app, this would sync data to Firebase
      const syncData = {
        cart: syncOptions.cart ? cart : [],
        wishlist: syncOptions.wishlist ? wishlist : [],
        filters: syncOptions.filters ? { activeFilters, categoryFilter } : null,
        preferences: syncOptions.preferences ? {
          theme: localStorage.getItem('ifeco-theme'),
          currency: localStorage.getItem('ifeco-currency')
        } : null,
        timestamp: new Date().toISOString()
      };

      console.log('Syncing data:', syncData);
      setLastSync(new Date());
      setSyncStatus('success');
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'desktop':
      default:
        return Monitor;
    }
  };


  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
          margin: '0 24px',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '32px',
          borderBottom: 'var(--border-thin)',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Cloud size={24} color="var(--brand-blue)" />
            <h1 style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 0
            }}>
              DEVICE SYNC
            </h1>
          </div>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            Keep your data synchronized across all your devices
          </p>
        </div>

        <div style={{ padding: '32px' }}>
          {/* Sync Status */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '32px',
            border: 'var(--border-thin)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              {syncStatus === 'idle' && <Wifi size={20} color="var(--text-secondary)" />}
              {syncStatus === 'syncing' && <Sync size={20} color="var(--brand-blue)" className="spinning" />}
              {syncStatus === 'success' && <CheckCircle size={20} color="var(--brand-blue)" />}
              {syncStatus === 'error' && <AlertCircle size={20} color="#ff4444" />}

              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: 0,
                  marginBottom: '4px'
                }}>
                  {syncStatus === 'idle' && 'Ready to Sync'}
                  {syncStatus === 'syncing' && 'Syncing...'}
                  {syncStatus === 'success' && 'Sync Complete'}
                  {syncStatus === 'error' && 'Sync Failed'}
                </h3>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  margin: 0
                }}>
                  {lastSync ? `Last synced ${lastSync.toLocaleString()}` : 'Never synced'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSync}
              disabled={syncStatus === 'syncing'}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: syncStatus === 'syncing' ? 'var(--text-secondary)' : 'var(--brand-blue)',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: syncStatus === 'syncing' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Sync size={16} />
              {syncStatus === 'syncing' ? 'SYNCING...' : 'SYNC NOW'}
            </button>
          </div>

          {/* Sync Options */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '16px'
            }}>
              What to Sync
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                { key: 'cart', label: 'Shopping Cart', description: 'Sync items in your cart' },
                { key: 'wishlist', label: 'Wishlist', description: 'Sync saved products' },
                { key: 'filters', label: 'Search Filters', description: 'Sync filter preferences' },
                { key: 'preferences', label: 'App Preferences', description: 'Sync theme and settings' },
                { key: 'history', label: 'Browsing History', description: 'Sync recently viewed products' }
              ].map(option => (
                <label
                  key={option.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: 'var(--border-thin)',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={syncOptions[option.key]}
                    onChange={(e) => setSyncOptions(prev => ({
                      ...prev,
                      [option.key]: e.target.checked
                    }))}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '2px'
                    }}>
                      {option.label}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)'
                    }}>
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Connected Devices */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '16px'
            }}>
              Connected Devices
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {devices.map(device => {
                const DeviceIcon = getDeviceIcon(device.type);

                return (
                  <div
                    key={device.id}
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: `2px solid ${device.isCurrent ? 'var(--brand-blue)' : 'var(--border-thin)'}`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: device.isCurrent ? 'var(--brand-blue)' : 'var(--bg-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid var(--border-thin)'
                    }}>
                      <DeviceIcon size={20} color={device.isCurrent ? '#fff' : 'var(--text-primary)'} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                          margin: 0
                        }}>
                          {device.name}
                        </h3>
                        {device.isCurrent && (
                          <span style={{
                            fontSize: '10px',
                            backgroundColor: 'var(--brand-blue)',
                            color: '#fff',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontWeight: 800
                          }}>
                            CURRENT
                          </span>
                        )}
                      </div>

                      <p style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        margin: 0,
                        marginBottom: '8px'
                      }}>
                        Last active: {device.lastActive.toLocaleString()}
                      </p>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {device.synced ? (
                          <>
                            <CheckCircle size={14} color="var(--brand-blue)" />
                            <span style={{ fontSize: '11px', color: 'var(--brand-blue)', fontWeight: 600 }}>
                              Synced
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={14} color="#ff4444" />
                            <span style={{ fontSize: '11px', color: '#ff4444', fontWeight: 600 }}>
                              Needs Sync
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sync Benefits */}
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '16px'
            }}>
              Sync Benefits
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                {
                  icon: '🛒',
                  title: 'Seamless Shopping',
                  description: 'Continue shopping from where you left off on any device'
                },
                {
                  icon: '❤️',
                  title: 'Unified Wishlist',
                  description: 'Access your saved products everywhere'
                },
                {
                  icon: '⚙️',
                  title: 'Consistent Experience',
                  description: 'Your preferences and settings follow you'
                },
                {
                  icon: '🔒',
                  title: 'Secure & Private',
                  description: 'End-to-end encrypted data synchronization'
                }
              ].map((benefit, index) => (
                <div
                  key={index}
                  style={{
                    padding: '20px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: 'var(--border-thin)',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{
                    fontSize: '32px',
                    marginBottom: '12px'
                  }}>
                    {benefit.icon}
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    margin: 0,
                    marginBottom: '8px'
                  }}>
                    {benefit.title}
                  </h3>
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '8px',
            backgroundColor: 'var(--bg-secondary)',
            border: 'var(--border-thin)',
            borderRadius: '50%',
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default DeviceSync;