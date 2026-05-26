import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Crown, Star, Gift, Trophy, Zap, Target, Award, TrendingUp } from 'lucide-react';

const LoyaltyProgram = ({ isOpen, onClose }) => {
  const { user } = useAppContext();
  const [selectedReward, setSelectedReward] = useState(null);

  const loyaltyData = useMemo(() => {
    if (!user || !isOpen) return null;
    return {
      currentTier: 'Gold',
      points: 2450,
      pointsToNextTier: 550,
      totalSpent: 125000,
      joinDate: '2024-01-15',
      achievements: [
        { id: 'first_purchase', name: 'First Purchase', icon: '🎯', unlocked: true, points: 100 },
        { id: 'review_master', name: 'Review Master', icon: '⭐', unlocked: true, points: 250 },
        { id: 'loyal_customer', name: 'Loyal Customer', icon: '💎', unlocked: true, points: 500 },
        { id: 'early_adopter', name: 'Early Adopter', icon: '🚀', unlocked: false, points: 300 },
        { id: 'tech_expert', name: 'Tech Expert', icon: '🧠', unlocked: false, points: 400 }
      ],
      recentActivity: [
        { type: 'purchase', description: 'Purchased iPhone 15 Pro', points: 150, date: '2024-04-01' },
        { type: 'review', description: 'Left a product review', points: 50, date: '2024-03-28' },
        { type: 'referral', description: 'Referred a friend', points: 200, date: '2024-03-25' },
        { type: 'milestone', description: 'Reached Gold tier', points: 100, date: '2024-03-20' }
      ]
    };
  }, [user, isOpen]);

  const tiers = [
    { name: 'Bronze', minPoints: 0, color: '#CD7F32', benefits: ['5% discount', 'Basic support', 'Welcome gift'] },
    { name: 'Silver', minPoints: 1000, color: '#C0C0C0', benefits: ['10% discount', 'Priority support', 'Free shipping', 'Exclusive deals'] },
    { name: 'Gold', minPoints: 2500, color: '#FFD700', benefits: ['15% discount', 'VIP support', 'Free shipping', 'Exclusive deals', 'Early access'] },
    { name: 'Platinum', minPoints: 5000, color: '#E5E4E2', benefits: ['20% discount', 'Concierge support', 'Free shipping', 'Exclusive deals', 'Early access', 'Personal shopper'] },
    { name: 'Diamond', minPoints: 10000, color: '#B9F2FF', benefits: ['25% discount', 'White-glove service', 'Free shipping', 'Exclusive deals', 'Early access', 'Personal shopper', 'Custom builds'] }
  ];

  const rewards = [
    { id: 'discount_50', name: '₦5,000 Discount', cost: 500, description: 'Instant discount on your next purchase', icon: '💰' },
    { id: 'free_shipping', name: 'Free Shipping', cost: 300, description: 'Waived shipping on orders over ₦50,000', icon: '🚚' },
    { id: 'exclusive_access', name: 'Early Access', cost: 750, description: '24-hour early access to new product launches', icon: '⏰' },
    { id: 'personal_shopper', name: 'Personal Shopper', cost: 1000, description: '1-hour consultation with our tech experts', icon: '👨‍💼' },
    { id: 'custom_engraving', name: 'Custom Engraving', cost: 400, description: 'Free custom engraving on select products', icon: '✏️' }
  ];

  const currentTier = tiers.find(t => t.name === loyaltyData?.currentTier);
  const nextTier = tiers[tiers.findIndex(t => t.name === loyaltyData?.currentTier) + 1];

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
          maxWidth: '800px',
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
            <Crown size={24} color="var(--brand-blue)" />
            <h1 style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 0
            }}>
              ELITE LOYALTY PROGRAM
            </h1>
          </div>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            Earn points with every purchase and unlock exclusive rewards
          </p>
        </div>

        <div style={{ padding: '32px' }}>
          {/* Current Status */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '24px',
            borderRadius: '8px',
            marginBottom: '32px',
            border: 'var(--border-thin)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: 0,
                  marginBottom: '4px'
                }}>
                  {loyaltyData?.currentTier} Member
                </h2>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  margin: 0
                }}>
                  {loyaltyData?.points.toLocaleString()} points • Member since {new Date(loyaltyData?.joinDate).toLocaleDateString()}
                </p>
              </div>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: currentTier?.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Crown size={32} color="#fff" />
              </div>
            </div>

            {/* Progress to Next Tier */}
            {nextTier && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>Progress to {nextTier.name}</span>
                  <span style={{ fontSize: '12px', opacity: 0.7 }}>
                    {loyaltyData?.pointsToNextTier} points to go
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      width: `${((loyaltyData?.points - (tiers.findIndex(t => t.name === loyaltyData?.currentTier) * 1000)) / loyaltyData?.pointsToNextTier) * 100}%`,
                      height: '100%',
                      backgroundColor: 'var(--brand-blue)',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Current Benefits */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>Your Benefits</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {currentTier?.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'var(--bg-primary)',
                      border: 'var(--border-thin)',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tier Overview */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '16px'
            }}>
              Loyalty Tiers
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {tiers.map((tier, index) => {
                const isCurrentTier = tier.name === loyaltyData?.currentTier;
                const isCompleted = tiers.findIndex(t => t.name === loyaltyData?.currentTier) > index;

                return (
                  <div
                    key={tier.name}
                    style={{
                      padding: '16px',
                      backgroundColor: isCurrentTier ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                      border: `2px solid ${isCurrentTier ? 'var(--brand-blue)' : 'var(--border-thin)'}`,
                      borderRadius: '8px',
                      opacity: isCompleted ? 0.7 : 1
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: tier.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isCompleted ? <Trophy size={20} color="#fff" /> : <Star size={20} color="#fff" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                          margin: 0,
                          marginBottom: '4px'
                        }}>
                          {tier.name} Tier
                          {isCurrentTier && <span style={{ color: 'var(--brand-blue)', marginLeft: '8px' }}>★ CURRENT</span>}
                        </h3>
                        <p style={{
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          margin: 0,
                          marginBottom: '8px'
                        }}>
                          {tier.minPoints.toLocaleString()} points required
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {tier.benefits.slice(0, 3).map((benefit, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '10px',
                                opacity: 0.7,
                                backgroundColor: 'var(--bg-secondary)',
                                padding: '2px 6px',
                                borderRadius: '8px'
                              }}
                            >
                              {benefit}
                            </span>
                          ))}
                          {tier.benefits.length > 3 && (
                            <span style={{ fontSize: '10px', opacity: 0.7 }}>
                              +{tier.benefits.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievements */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '16px'
            }}>
              Achievements
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {loyaltyData?.achievements.map(achievement => (
                <div
                  key={achievement.id}
                  style={{
                    padding: '16px',
                    backgroundColor: achievement.unlocked ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                    border: `2px solid ${achievement.unlocked ? 'var(--brand-blue)' : 'var(--border-thin)'}`,
                    borderRadius: '8px',
                    textAlign: 'center',
                    opacity: achievement.unlocked ? 1 : 0.6
                  }}
                >
                  <div style={{
                    fontSize: '32px',
                    marginBottom: '8px',
                    filter: achievement.unlocked ? 'none' : 'grayscale(100%)'
                  }}>
                    {achievement.icon}
                  </div>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    margin: 0,
                    marginBottom: '4px'
                  }}>
                    {achievement.name}
                  </h4>
                  <p style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    {achievement.points} points
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Redeem Rewards */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '16px'
            }}>
              Redeem Rewards
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
              {rewards.map(reward => {
                const canAfford = (loyaltyData?.points || 0) >= reward.cost;

                return (
                  <div
                    key={reward.id}
                    style={{
                      padding: '20px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: 'var(--border-thin)',
                      borderRadius: '8px',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                      opacity: canAfford ? 1 : 0.6,
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => canAfford && setSelectedReward(reward)}
                  >
                    <div style={{
                      fontSize: '32px',
                      textAlign: 'center',
                      marginBottom: '12px'
                    }}>
                      {reward.icon}
                    </div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      margin: 0,
                      marginBottom: '8px',
                      textAlign: 'center'
                    }}>
                      {reward.name}
                    </h3>
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      margin: 0,
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}>
                      {reward.description}
                    </p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Zap size={14} color="var(--brand-blue)" />
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 800,
                        color: canAfford ? 'var(--brand-blue)' : 'var(--text-secondary)'
                      }}>
                        {reward.cost} points
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedReward && (
              <div style={{ marginTop: '24px', padding: '20px', backgroundColor: 'var(--bg-secondary)', border: 'var(--border-thin)', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>Selected Reward</h3>
                <p style={{ fontSize: '14px', margin: 0, color: 'var(--text-secondary)' }}>{selectedReward.name} — {selectedReward.description}</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '16px'
            }}>
              Recent Activity
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {loyaltyData?.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: 'var(--border-thin)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {activity.type === 'purchase' && <Gift size={16} color="var(--brand-blue)" />}
                    {activity.type === 'review' && <Star size={16} color="var(--brand-blue)" />}
                    {activity.type === 'referral' && <TrendingUp size={16} color="var(--brand-blue)" />}
                    {activity.type === 'milestone' && <Award size={16} color="var(--brand-blue)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                      margin: 0,
                      marginBottom: '2px'
                    }}>
                      {activity.description}
                    </p>
                    <p style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      margin: 0
                    }}>
                      {activity.date} • +{activity.points} points
                    </p>
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

export default LoyaltyProgram;