import React, { useLayoutEffect, useState } from 'react';
import { ChevronLeft, HelpCircle, ArrowRight, ShieldCheck, Zap, Battery, Cpu, HardDrive, Share2, Save, X, CheckCircle, Star } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ComparisonView = ({ onBack }) => {
  const { comparisonList, formatPrice, toggleComparison, showNotification } = useAppContext();
  const [savedComparisons, setSavedComparisons] = useState(() => {
    const saved = localStorage.getItem('ifeco-saved-comparisons');
    return saved ? JSON.parse(saved) : [];
  });
  const [comparisonName, setComparisonName] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    localStorage.setItem('ifeco-saved-comparisons', JSON.stringify(savedComparisons));
  }, [savedComparisons]);

  const saveComparison = () => {
    if (!comparisonName.trim()) return;
    const newComparison = {
      id: Date.now().toString(),
      name: comparisonName.trim(),
      products: comparisonList.map(p => p.id),
      createdAt: new Date().toISOString()
    };
    setSavedComparisons([...savedComparisons, newComparison]);
    setComparisonName('');
    setIsSaveModalOpen(false);
    showNotification('Comparison saved successfully!', 'success');
  };

  const shareComparison = () => {
    const productIds = comparisonList.map(p => p.id).join(',');
    const shareUrl = `${window.location.origin}/compare?products=${productIds}`;
    navigator.clipboard.writeText(shareUrl);
    showNotification('Comparison link copied to clipboard!', 'success');
  };

  const removeFromComparison = (productId) => {
    toggleComparison(comparisonList.find(p => p.id === productId));
  };

  if (comparisonList.length === 0) return (
    <div style={{ height: '80vh', display: 'flex', flexFlow: 'column', alignItems: 'center', justifyContent: 'center' }}>
       <HelpCircle size={48} style={{ opacity: 0.1, marginBottom: '24px' }} />
       <p style={{ fontSize: '11px', fontWeight: 800, opacity: 0.3 }}>SELECT PRODUCTS TO COMPARE.</p>
       <button onClick={onBack} style={{ marginTop: '24px', fontSize: '10px', fontWeight: 800, border: 'var(--border-thin)', padding: '12px 24px' }}>BACK TO SHOP</button>
    </div>
  );

  const allSpecs = Array.from(new Set(comparisonList.flatMap(p => Object.keys(p.specs || {}))));
  const maxProducts = 3;

  return (
    <div className="fade-in">
       {/* Header */}
       <div className="thin-border-bottom" style={{ height: '64px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'space-between', width: '100%' }}>
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.6, color: 'var(--text-primary)' }}>
              <ChevronLeft size={16} /> Back to Shop
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setIsSaveModalOpen(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: 'var(--border-thin)',
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer'
                }}
              >
                <Save size={14} style={{ marginRight: '6px' }} />
                SAVE
              </button>
              <button
                onClick={shareComparison}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--brand-blue)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer'
                }}
              >
                <Share2 size={14} style={{ marginRight: '6px' }} />
                SHARE
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '80px 24px' }}>
        <div style={{ marginBottom: '60px' }}>
          <h1 style={{ fontSize: '72px', letterSpacing: '-0.05em', marginBottom: '16px', color: 'var(--text-primary)' }}>COMPARISON.</h1>
          <p style={{ fontSize: '13px', opacity: 0.6, marginBottom: '32px' }}>
            Comparing {comparisonList.length} of {maxProducts} products
          </p>

          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '2px',
            backgroundColor: 'var(--border-thin)',
            marginBottom: '40px'
          }}>
            <div style={{
              width: `${(comparisonList.length / maxProducts) * 100}%`,
              height: '100%',
              backgroundColor: 'var(--brand-blue)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Comparison Table */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `250px repeat(${comparisonList.length}, 1fr)`,
          gap: '1px',
          backgroundColor: 'var(--border-thin)',
          border: 'var(--border-thin)',
          marginBottom: '80px'
        }}>
          {/* Header Row: Images & Basics */}
          <div style={{ padding: '40px', backgroundColor: 'var(--bg-secondary)', borderRight: 'var(--border-thin)' }}>
             <p style={{ fontSize: '10px', fontWeight: 800, opacity: 0.4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>TECH MATRIX</p>
          </div>
          {comparisonList.map(p => (
            <div key={p.id} style={{ padding: '40px', backgroundColor: 'var(--bg-primary)', textAlign: 'center', position: 'relative' }}>
               <button
                 onClick={() => removeFromComparison(p.id)}
                 style={{
                   position: 'absolute',
                   top: '16px',
                   right: '16px',
                   background: 'none',
                   border: 'none',
                   cursor: 'pointer',
                   padding: '4px',
                   opacity: 0.5
                 }}
               >
                 <X size={16} />
               </button>
               <img src={p.image} style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '32px', filter: 'grayscale(1)' }} />
               <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>{p.name}</h3>
               <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>{formatPrice(p.prices.brandNew || p.prices.ukUsed)}</p>

               {/* Rating */}
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '16px' }}>
                 {Array.from({ length: 5 }, (_, i) => (
                   <Star
                     key={i}
                     size={12}
                     fill={i < (p.rating || 4) ? "#FFD700" : "none"}
                     color="#FFD700"
                   />
                 ))}
                 <span style={{ fontSize: '11px', opacity: 0.6, marginLeft: '4px' }}>{p.rating || 4.2}</span>
               </div>

               {/* Stock Status */}
               <div style={{
                 padding: '4px 8px',
                 backgroundColor: (p.stock || 0) > 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                 color: (p.stock || 0) > 0 ? '#4CAF50' : '#F44336',
                 fontSize: '9px',
                 fontWeight: 800,
                 textTransform: 'uppercase',
                 letterSpacing: '0.05em',
                 borderRadius: '2px'
               }}>
                 {(p.stock || 0) > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
               </div>
            </div>
          ))}

          {/* Price Comparison */}
          <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRight: 'var(--border-thin)', borderTop: 'var(--border-thin)' }}>
             <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>PRICE</p>
          </div>
          {comparisonList.map(p => (
            <div key={`price-${p.id}`} style={{ padding: '24px', backgroundColor: 'var(--bg-primary)', borderTop: 'var(--border-thin)', textAlign: 'center' }}>
               <div style={{ marginBottom: '12px' }}>
                 <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                   {formatPrice(p.prices.brandNew)}
                 </p>
                 <p style={{ fontSize: '10px', opacity: 0.6 }}>BRAND NEW</p>
               </div>
               {p.prices.ukUsed && (
                 <div>
                   <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                     {formatPrice(p.prices.ukUsed)}
                   </p>
                   <p style={{ fontSize: '10px', opacity: 0.6 }}>UK USED</p>
                 </div>
               )}
            </div>
          ))}

          {/* Specs Rows */}
          {allSpecs.map(specKey => (
            <React.Fragment key={specKey}>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRight: 'var(--border-thin)', borderTop: 'var(--border-thin)' }}>
                 <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{specKey}</p>
              </div>
              {comparisonList.map(p => (
                <div key={`${specKey}-${p.id}`} style={{ padding: '20px', backgroundColor: 'var(--bg-primary)', borderTop: 'var(--border-thin)', textAlign: 'center' }}>
                   <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                     {p.specs?.[specKey] || '—'}
                   </p>
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Warranty */}
          <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRight: 'var(--border-thin)', borderTop: 'var(--border-thin)' }}>
             <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>WARRANTY</p>
          </div>
          {comparisonList.map(p => (
            <div key={`warranty-${p.id}`} style={{ padding: '24px', backgroundColor: 'var(--bg-primary)', borderTop: 'var(--border-thin)', textAlign: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                 <ShieldCheck size={16} color="var(--brand-blue)" />
                 <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>12 Months</p>
               </div>
            </div>
          ))}
        </div>

        {/* Recommendation */}
        {comparisonList.length < maxProducts && (
          <div style={{
            padding: '40px',
            backgroundColor: 'var(--bg-secondary)',
            border: 'var(--border-thin)',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 800,
              marginBottom: '16px',
              color: 'var(--text-primary)'
            }}>
              Add More Products to Compare
            </h3>
            <p style={{
              fontSize: '13px',
              opacity: 0.7,
              marginBottom: '24px'
            }}>
              Compare up to {maxProducts} products side-by-side to make the best decision.
            </p>
            <button
              onClick={onBack}
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
              BROWSE MORE PRODUCTS
            </button>
          </div>
        )}
      </div>

      {/* Save Comparison Modal */}
      {isSaveModalOpen && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(20px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          onClick={() => setIsSaveModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              backgroundColor: 'var(--bg-primary)',
              border: 'var(--border-thin)',
              borderRadius: '8px',
              padding: '32px',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontSize: '16px',
              fontWeight: 800,
              marginBottom: '24px',
              color: 'var(--text-primary)'
            }}>
              SAVE COMPARISON
            </h3>

            <input
              type="text"
              placeholder="Comparison name..."
              value={comparisonName}
              onChange={(e) => setComparisonName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: 'var(--border-thin)',
                backgroundColor: 'var(--bg-secondary)',
                fontSize: '13px',
                fontWeight: 800,
                marginBottom: '24px'
              }}
              autoFocus
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={saveComparison}
                disabled={!comparisonName.trim()}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'var(--brand-blue)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  opacity: comparisonName.trim() ? 1 : 0.5
                }}
              >
                SAVE
              </button>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  border: 'var(--border-thin)',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer'
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonView;
