import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Package, TrendingUp, AlertTriangle, CheckCircle, Clock, BarChart3, Zap, ShoppingCart } from 'lucide-react';

const STATIC_FORECAST_BASE = Date.parse('2025-01-01T00:00:00Z');
const getDeterministicDemandScore = (stockLevel, productId) => {
  const seed = (productId || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const ratio = ((seed % 40) + 30) / 100;
  return Math.min(100, Math.max(0, Math.round((stockLevel > 0 ? 100 - stockLevel : 100) * ratio) + 10));
};
const getForecastRestockDate = (stockLevel) => new Date(STATIC_FORECAST_BASE + (stockLevel <= 5 ? 3 : 14) * 24 * 60 * 60 * 1000);
const calculateSalesVelocity = (stockLevel, demandScore) => Math.max(1, Math.round((100 - demandScore) / 8));

const InventoryIntelligence = ({ isOpen, onClose }) => {
  const { products } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const inventoryData = useMemo(() => {
    if (!isOpen) return [];

    return products.map(product => {
      const stockLevel = Number(product.stock || 0);
      const demandScore = getDeterministicDemandScore(stockLevel, product.id || product.name || 'product');
      const stockStatus = stockLevel === 0 ? 'critical' : stockLevel <= 5 ? 'low' : 'good';
      const demandTrend = demandScore > 60 ? 'up' : 'down';

      return {
        ...product,
        stockLevel,
        demandTrend,
        demandScore,
        restockDate: getForecastRestockDate(stockLevel),
        salesVelocity: calculateSalesVelocity(stockLevel, demandScore),
        stockStatus
      };
    });
  }, [isOpen, products]);

  const alerts = useMemo(() => {
    return inventoryData.reduce((list, product) => {
      if (product.stockLevel <= 5) {
        list.push({
          type: 'critical',
          product: product.name,
          message: `Only ${product.stockLevel} units remaining`,
          action: 'Restock immediately'
        });
      } else if (product.stockLevel <= 10) {
        list.push({
          type: 'warning',
          product: product.name,
          message: `Low stock: ${product.stockLevel} units`,
          action: 'Consider restocking'
        });
      }
      return list;
    }, []);
  }, [inventoryData]);

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return '#ff4444';
      case 'low':
        return '#ffaa00';
      case 'good':
      default:
        return 'var(--brand-blue)';
    }
  };

  const getStockStatusIcon = (status) => {
    switch (status) {
      case 'critical':
        return AlertTriangle;
      case 'low':
        return Clock;
      case 'good':
      default:
        return CheckCircle;
    }
  };

  const filteredInventory = selectedCategory === 'all'
    ? inventoryData
    : inventoryData.filter(item => item.category === selectedCategory);

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const stats = {
    totalProducts: inventoryData.length,
    lowStock: inventoryData.filter(p => p.stockLevel <= 10).length,
    outOfStock: inventoryData.filter(p => p.stockLevel === 0).length,
    highDemand: inventoryData.filter(p => p.demandScore > 80).length
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
          maxWidth: '1000px',
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
            <BarChart3 size={24} color="var(--brand-blue)" />
            <h1 style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 0
            }}>
              INVENTORY INTELLIGENCE
            </h1>
          </div>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            Real-time stock monitoring and demand forecasting
          </p>
        </div>

        <div style={{ padding: '32px' }}>
          {/* Stats Overview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {[
              { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'var(--brand-blue)' },
              { label: 'Low Stock Items', value: stats.lowStock, icon: AlertTriangle, color: '#ffaa00' },
              { label: 'High Demand', value: stats.highDemand, icon: TrendingUp, color: '#44ff44' },
              { label: 'Out of Stock', value: stats.outOfStock, icon: ShoppingCart, color: '#ff4444' }
            ].map((stat, index) => (
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
                <stat.icon size={24} color={stat.color} style={{ marginBottom: '12px' }} />
                <div style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '4px'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  fontWeight: 600
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={20} color="#ff4444" />
                Inventory Alerts
              </h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '16px',
                      backgroundColor: alert.type === 'critical' ? '#ff444420' : '#ffaa0020',
                      border: `2px solid ${alert.type === 'critical' ? '#ff4444' : '#ffaa00'}`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <AlertTriangle
                      size={20}
                      color={alert.type === 'critical' ? '#ff4444' : '#ffaa00'}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        margin: 0,
                        marginBottom: '4px'
                      }}>
                        {alert.product}
                      </h4>
                      <p style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        margin: 0
                      }}>
                        {alert.message}
                      </p>
                    </div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--brand-blue)',
                      cursor: 'pointer'
                    }}>
                      {alert.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: selectedCategory === category ? 'var(--brand-blue)' : 'var(--bg-secondary)',
                    color: selectedCategory === category ? '#fff' : 'var(--text-primary)',
                    border: 'var(--border-thin)',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Table */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: 'var(--border-thin)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 24px',
              backgroundColor: 'var(--bg-primary)',
              borderBottom: 'var(--border-thin)',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
              gap: '16px'
            }}>
              <span>Product</span>
              <span>Stock</span>
              <span>Status</span>
              <span>Demand</span>
              <span>Velocity</span>
              <span>Restock</span>
            </div>

            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              {filteredInventory.map(product => {
                const StatusIcon = getStockStatusIcon(product.stockStatus);

                return (
                  <div
                    key={product.id}
                    style={{
                      padding: '16px 24px',
                      borderBottom: 'var(--border-thin)',
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                      gap: '16px',
                      alignItems: 'center',
                      backgroundColor: product.stockStatus === 'critical' ? '#ff444410' : 'transparent'
                    }}
                  >
                    <div>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        margin: 0,
                        marginBottom: '4px'
                      }}>
                        {product.name}
                      </h4>
                      <p style={{
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        margin: 0
                      }}>
                        {product.category}
                      </p>
                    </div>

                    <div style={{
                      fontSize: '16px',
                      fontWeight: 800,
                      color: getStockStatusColor(product.stockStatus)
                    }}>
                      {product.stockLevel}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <StatusIcon size={16} color={getStockStatusColor(product.stockStatus)} />
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: getStockStatusColor(product.stockStatus),
                        textTransform: 'capitalize'
                      }}>
                        {product.stockStatus}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TrendingUp
                        size={14}
                        color={product.demandTrend === 'up' ? '#44ff44' : '#ff4444'}
                      />
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: product.demandTrend === 'up' ? '#44ff44' : '#ff4444'
                      }}>
                        {product.demandScore}%
                      </span>
                    </div>

                    <div style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}>
                      {product.salesVelocity}/day
                    </div>

                    <div style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)'
                    }}>
                      {product.restockDate.toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights */}
          <div style={{ marginTop: '32px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '16px'
            }}>
              Smart Insights
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {[
                {
                  icon: '📈',
                  title: 'Demand Forecasting',
                  insight: 'iPhone 15 Pro expected to sell out in 3 days based on current velocity',
                  action: 'Increase stock allocation'
                },
                {
                  icon: '⚡',
                  title: 'Fast Movers',
                  insight: 'AirPods Pro selling 15x faster than average this week',
                  action: 'Prioritize restocking'
                },
                {
                  icon: '🎯',
                  title: 'Stock Optimization',
                  insight: 'Consider reducing MacBook stock by 20% - demand trending down',
                  action: 'Review pricing strategy'
                },
                {
                  icon: '🔮',
                  title: 'Predictive Analytics',
                  insight: 'Expected 40% increase in laptop demand next month',
                  action: 'Prepare inventory'
                }
              ].map((insight, index) => (
                <div
                  key={index}
                  style={{
                    padding: '20px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: 'var(--border-thin)',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{
                    fontSize: '24px',
                    marginBottom: '12px'
                  }}>
                    {insight.icon}
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    margin: 0,
                    marginBottom: '8px'
                  }}>
                    {insight.title}
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    marginBottom: '12px',
                    lineHeight: 1.4
                  }}>
                    {insight.insight}
                  </p>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--brand-blue)',
                    cursor: 'pointer'
                  }}>
                    {insight.action} →
                  </div>
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

export default InventoryIntelligence;