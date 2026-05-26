import React, { useState, useEffect } from 'react';
import { Star, Camera, Send, MessageCircle, ShieldCheck, ThumbsUp, ThumbsDown, Reply, Filter, TrendingUp, Award, Users, Image } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../supabase';
import { sanitizeString } from '../../utils/SecurityUtils';

const ReviewSection = ({ productId }) => {
  const { user, userProfile, showNotification } = useAppContext();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase.from('reviews').select('*').eq('product_id', productId);
      if (data) {
        const reviewList = data.map(r => ({
          id: r.id,
          productId: r.product_id,
          uid: r.uid,
          userName: r.user_name,
          rating: r.rating,
          comment: r.comment,
          photoUrl: r.photo_url,
          createdAt: new Date(r.created_at).getTime(),
          verified: r.verified !== false,
          helpful: r.helpful || 0,
          unhelpful: r.unhelpful || 0,
          replies: Array.isArray(r.replies) ? r.replies : [],
          votedBy: r.voted_by || {}
        }));
        setReviews(sortReviews(reviewList, sortBy));
      } else {
        setReviews([]);
      }
    };
    fetchReviews();
    const channel = supabase.channel('reviews_product')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews', filter: `product_id=eq.${productId}` }, fetchReviews)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [productId, sortBy]);

  const sortReviews = (reviews, sortType) => {
    const sorted = [...reviews];
    switch (sortType) {
      case 'newest':
        return sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      case 'oldest':
        return sorted.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating);
      case 'helpful':
        return sorted.sort((a, b) => (b.helpful - b.unhelpful) - (a.helpful - a.unhelpful));
      default:
        return sorted;
    }
  };

  const handleVote = async (reviewId, voteType) => {
    if (!user) {
      showNotification("Please log in to vote on reviews.", 'error');
      return;
    }

    try {
      const currentReview = reviews.find(r => r.id === reviewId);
      if (!currentReview) return;

      const hasVoted = currentReview.votedBy?.[user.uid];
      if (hasVoted) {
        showNotification("You have already voted on this review.", 'info');
        return;
      }

      const updates = {
        [voteType]: (currentReview[voteType] || 0) + 1,
        voted_by: { ...(currentReview.votedBy || {}), [user.uid]: voteType }
      };

      await supabase.from('reviews').update(updates).eq('id', reviewId);
    } catch (error) {
      console.error("Vote failed:", error);
    }
  };

  const handleReply = async (reviewId) => {
    if (!user || !replyText.trim()) return;

    try {
      const currentReview = reviews.find(r => r.id === reviewId);
      if (!currentReview) return;
      const newReplies = Array.isArray(currentReview.replies) ? [...currentReview.replies] : [];
      newReplies.push({
        uid: user.uid,
        userName: userProfile?.displayName || user.displayName || 'Elite Client',
        text: sanitizeString(replyText),
        createdAt: new Date().toISOString()
      });
      await supabase.from('reviews').update({ replies: newReplies }).eq('id', reviewId);
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error("Reply failed:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showNotification("SECURE ACCESS REQUIRED. PLEASE LOG IN TO POST REVIEWS.", 'error');
      return;
    }
    if (!comment.trim()) {
      showNotification("PLEASE SHARE YOUR ELITE GADGET EXPERIENCE.", 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      await supabase.from('reviews').insert({
        product_id: productId,
        uid: user.uid,
        user_name: userProfile?.displayName || user.displayName || 'Elite Client',
        rating,
        comment: sanitizeString(comment),
        photo_url: sanitizeString(photoUrl),
        verified: true,
        helpful: 0,
        unhelpful: 0,
        replies: [],
        voted_by: {}
      });
      setComment('');
      setPhotoUrl('');
      setRating(5);
    } catch (err) {
      console.error("Review Push Failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  const totalHelpful = reviews.reduce((acc, r) => acc + (r.helpful || 0), 0);
  const reviewPhotos = reviews.filter(r => r.photoUrl).map(r => r.photoUrl);

  return (
    <div style={{ marginTop: '80px', paddingTop: '80px', borderTop: 'var(--border-thin)' }}>
      <div className="container">
        <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '80px' }}>

          {/* Enhanced Summary Sidebar */}
          <div>
            <h2 style={{ fontSize: '32px', letterSpacing: '-0.05em', marginBottom: '16px' }}>COMMUNITY FEEDBACK.</h2>

            {/* Overall Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
               <div style={{ fontSize: '48px', fontWeight: 800 }}>{averageRating}</div>
               <div>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={16} fill={s <= Math.round(averageRating) ? "var(--brand-blue)" : "none"} stroke={s <= Math.round(averageRating) ? "var(--brand-blue)" : "currentColor"} style={{ opacity: s <= Math.round(averageRating) ? 1 : 0.2 }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '11px', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{reviews.length} COMMUNITY REVIEWS</p>
               </div>
            </div>

            {/* Rating Distribution */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>Rating Breakdown</h3>
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '20px' }}>{rating}★</span>
                  <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--bg-secondary)', borderRadius: '2px' }}>
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: 'var(--brand-blue)',
                        borderRadius: '2px',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '11px', opacity: 0.6, minWidth: '24px' }}>{count}</span>
                </div>
              ))}
            </div>

            {/* Community Stats */}
            <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: 'var(--bg-secondary)', border: 'var(--border-thin)', borderRadius: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Users size={16} color="var(--brand-blue)" />
                <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Community Stats</span>
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', opacity: 0.7 }}>Helpful Votes</span>
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>{totalHelpful}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', opacity: 0.7 }}>Photos Shared</span>
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>{reviewPhotos.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', opacity: 0.7 }}>Verified Buyers</span>
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>{reviews.filter(r => r.verified).length}</span>
                </div>
              </div>
            </div>

            {/* Photo Gallery Toggle */}
            {reviewPhotos.length > 0 && (
              <button
                onClick={() => setShowPhotoGallery(!showPhotoGallery)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: showPhotoGallery ? 'var(--brand-blue)' : 'var(--bg-secondary)',
                  border: 'var(--border-thin)',
                  color: showPhotoGallery ? '#fff' : 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  marginBottom: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Image size={14} />
                {showPhotoGallery ? 'Hide' : 'View'} Community Photos ({reviewPhotos.length})
              </button>
            )}

            {/* Photo Gallery */}
            {showPhotoGallery && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {reviewPhotos.slice(0, 6).map((photo, index) => (
                    <div key={index} style={{ aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', border: 'var(--border-thin)' }}>
                      <img src={photo} alt={`Review photo ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
                {reviewPhotos.length > 6 && (
                  <p style={{ fontSize: '10px', opacity: 0.6, textAlign: 'center', marginTop: '8px' }}>
                    +{reviewPhotos.length - 6} more photos
                  </p>
                )}
              </div>
            )}

            {user ? (
               <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '32px', backgroundColor: 'var(--bg-secondary)', border: 'var(--border-thin)', borderRadius: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Award size={16} color="var(--brand-blue)" />
                    <p style={{ fontSize: '11px', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase' }}>SHARE YOUR ELITE EXPERIENCE</p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <button type="button" key={s} onClick={() => setRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <Star size={24} fill={s <= rating ? "var(--brand-blue)" : "none"} stroke={s <= rating ? "var(--brand-blue)" : "currentColor"} style={{ opacity: s <= rating ? 1 : 0.2 }} />
                      </button>
                    ))}
                    <span style={{ fontSize: '12px', opacity: 0.6, marginLeft: '8px', alignSelf: 'center' }}>
                      {rating} star{rating !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <textarea
                    placeholder="WHAT MAKES THIS GADGET ELITE? SHARE YOUR DETAILED EXPERIENCE..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ width: '100%', minHeight: '120px', backgroundColor: 'var(--bg-primary)', border: 'var(--border-thin)', padding: '16px', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 700, outline: 'none', borderRadius: '2px', resize: 'vertical' }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'var(--bg-primary)', border: 'var(--border-thin)', borderRadius: '2px' }}>
                     <Camera size={16} opacity={0.5} />
                     <input
                       type="text"
                       placeholder="PHOTO URL (OPTIONAL) - SHARE YOUR GADGET IN ACTION"
                       value={photoUrl}
                       onChange={(e) => setPhotoUrl(e.target.value)}
                       style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700, width: '100%', outline: 'none' }}
                     />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '16px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)',
                      fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      opacity: isSubmitting ? 0.5 : 1, borderRadius: '2px', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      border: 'none'
                    }}
                  >
                    {isSubmitting ? 'SHARING...' : 'POST REVIEW'} <Send size={14} />
                  </button>
               </form>
            ) : (
               <div style={{ padding: '32px', backgroundColor: 'var(--bg-secondary)', border: 'var(--border-thin)', borderRadius: '2px', textAlign: 'center' }}>
                  <ShieldCheck size={32} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <p style={{ fontSize: '11px', fontWeight: 800, opacity: 0.5, letterSpacing: '0.1em' }}>LOG IN TO JOIN THE ELITE COMMUNITY.</p>
                  <p style={{ fontSize: '10px', opacity: 0.6, marginTop: '8px' }}>Share your experience and help other tech enthusiasts.</p>
               </div>
            )}
          </div>

          {/* Enhanced Review List */}
          <div>
            {/* Sort and Filter Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>COMMUNITY REVIEWS</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: 'var(--border-thin)',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div style={{ padding: '80px 0', textAlign: 'center', opacity: 0.3 }}>
                <MessageCircle size={48} style={{ marginBottom: '24px' }} />
                <p style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.2em' }}>BE THE FIRST TO REVIEW THIS GADGET.</p>
                <p style={{ fontSize: '11px', opacity: 0.6, marginTop: '8px' }}>Share your experience and help the community.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '32px' }}>
                {reviews.map(rev => (
                  <div key={rev.id} style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', border: 'var(--border-thin)', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 800,
                        color: 'var(--brand-blue)',
                        border: '2px solid var(--border-thin)'
                      }}>
                        {rev.userName.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <h4 style={{
                              fontSize: '14px',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              margin: 0,
                              marginBottom: '4px'
                            }}>
                              {rev.userName}
                              {rev.verified && (
                                <span style={{
                                  color: 'var(--brand-blue)',
                                  fontSize: '9px',
                                  marginLeft: '8px',
                                  backgroundColor: 'var(--bg-primary)',
                                  padding: '2px 6px',
                                  borderRadius: '2px',
                                  border: 'var(--border-thin)'
                                }}>
                                  ✓ VERIFIED BUYER
                                </span>
                              )}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                  <Star key={s} size={12} fill={s <= rev.rating ? "var(--brand-blue)" : "none"} stroke={s <= rev.rating ? "var(--brand-blue)" : "currentColor"} style={{ opacity: s <= rev.rating ? 1 : 0.2 }} />
                                ))}
                              </div>
                              <span style={{ fontSize: '10px', opacity: 0.6 }}>
                                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p style={{
                          fontSize: '14px',
                          lineHeight: 1.6,
                          opacity: 0.9,
                          marginBottom: '16px'
                        }}>
                          {rev.comment}
                        </p>

                        {rev.photoUrl && (
                          <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            backgroundColor: 'var(--bg-primary)',
                            border: 'var(--border-thin)',
                            marginBottom: '16px'
                          }}>
                             <img src={rev.photoUrl} alt="Review" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}

                        {/* Review Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                          <button
                            onClick={() => handleVote(rev.id, 'helpful')}
                            disabled={!user || rev.votedBy?.[user?.uid]}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 12px',
                              backgroundColor: 'var(--bg-primary)',
                              border: 'var(--border-thin)',
                              color: 'var(--text-primary)',
                              fontSize: '10px',
                              fontWeight: 600,
                              cursor: user && !rev.votedBy?.[user?.uid] ? 'pointer' : 'not-allowed',
                              opacity: user && !rev.votedBy?.[user?.uid] ? 1 : 0.5
                            }}
                          >
                            <ThumbsUp size={12} />
                            Helpful ({rev.helpful || 0})
                          </button>

                          <button
                            onClick={() => handleVote(rev.id, 'unhelpful')}
                            disabled={!user || rev.votedBy?.[user?.uid]}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 12px',
                              backgroundColor: 'var(--bg-primary)',
                              border: 'var(--border-thin)',
                              color: 'var(--text-primary)',
                              fontSize: '10px',
                              fontWeight: 600,
                              cursor: user && !rev.votedBy?.[user?.uid] ? 'pointer' : 'not-allowed',
                              opacity: user && !rev.votedBy?.[user?.uid] ? 1 : 0.5
                            }}
                          >
                            <ThumbsDown size={12} />
                            Not Helpful ({rev.unhelpful || 0})
                          </button>

                          {user && (
                            <button
                              onClick={() => setReplyingTo(replyingTo === rev.id ? null : rev.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                backgroundColor: replyingTo === rev.id ? 'var(--brand-blue)' : 'var(--bg-primary)',
                                border: 'var(--border-thin)',
                                color: replyingTo === rev.id ? '#fff' : 'var(--text-primary)',
                                fontSize: '10px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              <Reply size={12} />
                              Reply
                            </button>
                          )}
                        </div>

                        {/* Reply Form */}
                        {replyingTo === rev.id && (
                          <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'var(--bg-primary)', border: 'var(--border-thin)', borderRadius: '4px' }}>
                            <textarea
                              placeholder="Write your reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              style={{
                                width: '100%',
                                minHeight: '60px',
                                backgroundColor: 'var(--bg-secondary)',
                                border: 'var(--border-thin)',
                                padding: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '12px',
                                outline: 'none',
                                borderRadius: '2px',
                                resize: 'vertical'
                              }}
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                              <button
                                onClick={() => handleReply(rev.id)}
                                disabled={!replyText.trim()}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: 'var(--brand-blue)',
                                  color: '#fff',
                                  border: 'none',
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                                  opacity: replyText.trim() ? 1 : 0.5
                                }}
                              >
                                Post Reply
                              </button>
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText('');
                                }}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: 'transparent',
                                  border: 'var(--border-thin)',
                                  color: 'var(--text-primary)',
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Replies */}
                        {rev.replies && rev.replies.length > 0 && (
                          <div style={{ marginTop: '16px', paddingLeft: '16px', borderLeft: '2px solid var(--border-thin)' }}>
                            {rev.replies.map((reply, idx) => (
                              <div key={idx} style={{ marginBottom: '12px', padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: 600 }}>{reply.userName}</span>
                                  <span style={{ fontSize: '9px', opacity: 0.6 }}>
                                    {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString() : 'Recent'}
                                  </span>
                                </div>
                                <p style={{ fontSize: '12px', opacity: 0.8, margin: 0 }}>{reply.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
