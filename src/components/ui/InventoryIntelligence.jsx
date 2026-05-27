import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Package, TrendingUp, AlertTriangle, CheckCircle, Clock, BarChart3, Zap, ShoppingCart, Target, Lightbulb, X } from 'lucide-react';

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
          message: `ONLY ${product.stockLevel} UNITS REMAINING`,
          action: 'RESTOCK IMMEDIATELY'
        });
      } else if (product.stockLevel <= 10) {
        list.push({
          type: 'warning',
          product: product.name,
          message: `LOW STOCK: ${product.stockLevel} UNITS`,
          action: 'CONSIDER RESTOCKING'
        });
      }
      return list;
    }, []);
  }, [inventoryData]);

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return '#FF3B3B';
      case 'low':
        return '#FFAA00';
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
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(20px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        className="fade-in hide-scrollbar"
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: 'var(--border-thin)',
          borderRadius: '2px',
          width: '100%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '32px 48px',
          borderBottom: 'var(--border-thin)',
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h2 style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.2em',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              margin: 0
            }}>
              INVENTORY INTELLIGENCE
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
               <span style={{ padding: '6px 12px', fontSize: '9px', fontWeight: 800, border: 'var(--border-thin)', borderRadius: '2px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>LIVE DATA</span>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-primary)' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '48px' }}>
          {/* Stats Overview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1px',
            backgroundColor: 'var(--border-thin)',
            border: 'var(--border-thin)',
            marginBottom: '48px'
          }}>
            {[
              { label: 'TOTAL PRODUCTS', value: stats.totalProducts, icon: Package, color: 'var(--text-primary)' },
              { label: 'LOW STOCK ITEMS', value: stats.lowStock, icon: AlertTriangle, color: '#FFAA00' },
              { label: 'HIGH DEMAND', value: stats.highDemand, icon: TrendingUp, color: 'var(--brand-blue)' },
              { label: 'OUT OF STOCK', value: stats.outOfStock, icon: ShoppingCart, color: '#FF3B3B' }
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  padding: '32px',
                  backgroundColor: 'var(--bg-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                   <div style={{
                     fontSize: '9px',
                     fontWeight: 800,
                     letterSpacing: '0.1em',
                     color: 'var(--text-primary)',
                     opacity: 0.5
                   }}>
                     {stat.label}
                   </div>
                   <stat.icon size={16} color={stat.color} />
                </div>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  lineHeight: 1
                }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <div className="admin-grid-2" style={{ gap: '48px', marginBottom: '48px' }}>
            {/* Category Filter & Table */}
            <div style={{ display: 'grid', gap: '24px', gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: selectedCategory === category ? 'var(--text-primary)' : 'var(--bg-secondary)',
                      color: selectedCategory === category ? 'var(--bg-primary)' : 'var(--text-primary)',
                      border: 'var(--border-thin)',
                      borderRadius: '2px',
                      fontSize: '9px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div style={{
                backgroundColor: 'var(--border-thin)',
                border: 'var(--border-thin)',
                display: 'grid',
                gap: '1px'
              }}>
                <div style={{
                  padding: '16px 24px',
                  backgroundColor: 'var(--bg-secondary)',
                  fontSize: '9px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--text-primary)',
                  opacity: 0.5,
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                  gap: '16px'
                }}>
                  <span>PRODUCT</span>
                  <span>STOCK</span>
                  <span>STATUS</span>
                  <span>DEMAND</span>
                  <span>VELOCITY</span>
                  <span>RESTOCK</span>
                </div>

                <div style={{ maxHeight: '400px', overflow: 'auto', backgroundColor: 'var(--border-thin)', display: 'grid', gap: '1px' }}>
                  {filteredInventory.map(product => {
                    const StatusIcon = getStockStatusIcon(product.stockStatus);

                    return (
                      <div
                        key={product.id}
                        style={{
                          padding: '16px 24px',
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                          gap: '16px',
                          alignItems: 'center',
                          backgroundColor: 'var(--bg-primary)'
                        }}
                      >
                        <div>
                          <h4 style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                            margin: 0,
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {product.name}
                          </h4>
                          <p style={{
                            fontSize: '9px',
                            color: 'var(--text-primary)',
                            opacity: 0.5,
                            margin: 0,
                            fontWeight: 800,
                            textTransform: 'uppercase'
                          }}>
                            {product.category}
                          </p>
                        </div>

                        <div style={{
                          fontSize: '12px',
                          fontWeight: 900,
                          color: getStockStatusColor(product.stockStatus)
                        }}>
                          {product.stockLevel}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <StatusIcon size={14} color={getStockStatusColor(product.stockStatus)} />
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            color: getStockStatusColor(product.stockStatus),
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                          }}>
                            {product.stockStatus}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <TrendingUp
                            size={14}
                            color={product.demandTrend === 'up' ? 'var(--brand-blue)' : '#FF3B3B'}
                          />
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 900,
                            color: product.demandTrend === 'up' ? 'var(--brand-blue)' : '#FF3B3B'
                          }}>
                            {product.demandScore}%
                          </span>
                        </div>

                        <div style={{
                          fontSize: '11px',
                          fontWeight: 900,
                          color: 'var(--text-primary)'
                        }}>
                          {product.salesVelocity}/DAY
                        </div>

                        <div style={{
                          fontSize: '9px',
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                          opacity: 0.5,
                          letterSpacing: '0.1em'
                        }}>
                          {product.restockDate.toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Row: Alerts and Insights */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', gridColumn: 'span 2' }}>
              {/* Alerts */}
              <div>
                 <h3 style={{
                   fontSize: '11px',
                   fontWeight: 800,
                   color: 'var(--text-primary)',
                   marginBottom: '24px',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '12px',
                   letterSpacing: '0.2em',
                   textTransform: 'uppercase'
                 }}>
                   <AlertTriangle size={16} color="#FF3B3B" />
                   CRITICAL ALERTS
                 </h3>
                 <div style={{ display: 'grid', gap: '8px' }}>
                   {alerts.length === 0 && (
                     <div style={{ padding: '24px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', fontSize: '9px', fontWeight: 800, opacity: 0.5, letterSpacing: '0.1em' }}>
                       NO CRITICAL ALERTS.
                     </div>
                   )}
                   {alerts.map((alert, index) => (
                     <div
                       key={index}
                       style={{
                         padding: '16px',
                         backgroundColor: 'var(--bg-primary)',
                         border: `1px solid ${alert.type === 'critical' ? '#FF3B3B' : '#FFAA00'}`,
                         display: 'flex',
                         alignItems: 'center',
                         gap: '16px',
                         borderRadius: '2px'
                       }}
                     >
                       <AlertTriangle
                         size={16}
                         color={alert.type === 'critical' ? '#FF3B3B' : '#FFAA00'}
                       />
                       <div style={{ flex: 1 }}>
                         <h4 style={{
                           fontSize: '11px',
                           fontWeight: 900,
                           color: 'var(--text-primary)',
                           margin: 0,
                           marginBottom: '4px',
                           textTransform: 'uppercase'
                         }}>
                           {alert.product}
                         </h4>
                         <p style={{
                           fontSize: '9px',
                           color: 'var(--text-primary)',
                           opacity: 0.7,
                           margin: 0,
                           fontWeight: 800,
                           textTransform: 'uppercase',
                           letterSpacing: '0.05em'
                         }}>
                           {alert.message}
                         </p>
                       </div>
                       <div style={{
                         fontSize: '9px',
                         fontWeight: 800,
                         color: 'var(--text-primary)',
                         borderBottom: '1px solid currentColor',
                         cursor: 'pointer',
                         textTransform: 'uppercase',
                         letterSpacing: '0.1em'
                       }}>
                         {alert.action}
                       </div>
                     </div>
                   ))}
                 </div>
              </div>

              {/* Insights */}
              <div>
                <h3 style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '24px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase'
                }}>
                  SMART INSIGHTS
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1px', backgroundColor: 'var(--border-thin)', border: 'var(--border-thin)' }}>
                  {[
                    {
                      icon: <TrendingUp size={16} color="var(--brand-blue)" />,
                      title: 'DEMAND FORECASTING',
                      insight: 'IPHONE 15 PRO EXPECTED TO SELL OUT IN 3 DAYS BASED ON CURRENT VELOCITY',
                      action: 'INCREASE STOCK ALLOCATION'
                    },
                    {
                      icon: <Zap size={16} color="#FFAA00" />,
                      title: 'FAST MOVERS',
                      insight: 'AIRPODS PRO SELLING 15X FASTER THAN AVERAGE THIS WEEK',
                      action: 'PRIORITIZE RESTOCKING'
                    },
                    {
                      icon: <Target size={16} color="#FF3B3B" />,
                      title: 'STOCK OPTIMIZATION',
                      insight: 'CONSIDER REDUCING MACBOOK STOCK BY 20% - DEMAND TRENDING DOWN',
                      action: 'REVIEW PRICING STRATEGY'
                    },
                    {
                      icon: <Lightbulb size={16} color="#A855F7" />,
                      title: 'PREDICTIVE ANALYTICS',
                      insight: 'EXPECTED 40% INCREASE IN LAPTOP DEMAND NEXT MONTH',
                      action: 'PREPARE INVENTORY'
                    }
                  ].map((insight, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '24px',
                        backgroundColor: 'var(--bg-primary)',
                        display: 'flex',
                        gap: '16px'
                      }}
                    >
                      <div style={{ marginTop: '2px' }}>
                        {insight.icon}
                      </div>
                      <div>
                        <h4 style={{
                          fontSize: '11px',
                          fontWeight: 900,
                          color: 'var(--text-primary)',
                          margin: 0,
                          marginBottom: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em'
                        }}>
                          {insight.title}
                        </h4>
                        <p style={{
                          fontSize: '9px',
                          color: 'var(--text-primary)',
                          opacity: 0.6,
                          margin: 0,
                          marginBottom: '16px',
                          lineHeight: 1.5,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {insight.insight}
                        </p>
                        <div style={{
                          fontSize: '9px',
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'inline-block',
                          borderBottom: '1px solid currentColor',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em'
                        }}>
                          {insight.action}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryIntelligence;