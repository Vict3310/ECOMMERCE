import React, { useState, useEffect } from 'react';
import { useAppContext } from "../../context/AppContext";
import ProductCard from "../product/ProductCard";
import { Sparkles, TrendingUp, Heart, ShoppingBag } from 'lucide-react';

const ProductRecommendations = ({ currentProduct, onProductClick, limit = 4 }) => {
  const { products, wishlist, cart } = useAppContext();
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationType, setRecommendationType] = useState('similar');

  useEffect(() => {
    if (!currentProduct) return;

    const generateRecommendations = () => {
      let recs = [];

      // 1. Similar products by category and price range
      const similarByCategory = products
        .filter(p =>
          p.id !== currentProduct.id &&
          p.category === currentProduct.category &&
          Math.abs(p.price - currentProduct.price) / currentProduct.price <= 0.3
        )
        .slice(0, 2);

      // 2. Products from user's wishlist category preferences
      const wishlistCategories = [...new Set(wishlist.map(item => item.category))];
      const wishlistRecs = products
        .filter(p =>
          p.id !== currentProduct.id &&
          wishlistCategories.includes(p.category) &&
          !wishlist.some(w => w.id === p.id)
        )
        .slice(0, 2);

      // 3. Trending/popular products (high ratings or recent)
      const trending = products
        .filter(p => p.id !== currentProduct.id && (p.rating >= 4.5 || p.isNew))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 2);

      // 4. Complementary products (different category but related)
      const complementaryCategories = {
        'Phones': ['Accessories'],
        'Laptops': ['Accessories'],
        'Accessories': ['Phones', 'Laptops']
      };

      const complementary = products
        .filter(p =>
          p.id !== currentProduct.id &&
          complementaryCategories[currentProduct.category]?.includes(p.category)
        )
        .slice(0, 2);

      // Combine and deduplicate
      recs = [...similarByCategory, ...wishlistRecs, ...trending, ...complementary];
      const uniqueRecs = recs.filter((product, index, self) =>
        index === self.findIndex(p => p.id === product.id)
      );

      setRecommendations(uniqueRecs.slice(0, limit));
    };

    generateRecommendations();
  }, [currentProduct, products, wishlist, cart, limit]);

  if (recommendations.length === 0) return null;

  return (
    <div style={{ marginTop: '80px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '40px'
      }}>
        <Sparkles size={24} color="var(--brand-blue)" />
        <h2 style={{
          fontSize: '32px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          margin: 0
        }}>
          RECOMMENDED FOR YOU
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '32px'
      }}>
        {recommendations.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onProductClick(product)}
            showRecommendation={true}
          />
        ))}
      </div>

      {/* Recommendation Types */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginTop: '40px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setRecommendationType('similar')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: recommendationType === 'similar' ? 'var(--brand-blue)' : 'var(--bg-secondary)',
            color: recommendationType === 'similar' ? '#fff' : 'var(--text-primary)',
            border: 'var(--border-thin)',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            opacity: recommendationType === 'similar' ? 1 : 0.6
          }}
        >
          <ShoppingBag size={14} />
          Similar Products
        </button>

        <button
          onClick={() => setRecommendationType('trending')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: recommendationType === 'trending' ? 'var(--brand-blue)' : 'var(--bg-secondary)',
            color: recommendationType === 'trending' ? '#fff' : 'var(--text-primary)',
            border: 'var(--border-thin)',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            opacity: recommendationType === 'trending' ? 1 : 0.6
          }}
        >
          <TrendingUp size={14} />
          Trending
        </button>

        <button
          onClick={() => setRecommendationType('wishlist')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: recommendationType === 'wishlist' ? 'var(--brand-blue)' : 'var(--bg-secondary)',
            color: recommendationType === 'wishlist' ? '#fff' : 'var(--text-primary)',
            border: 'var(--border-thin)',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            opacity: recommendationType === 'wishlist' ? 1 : 0.6
          }}
        >
          <Heart size={14} />
          Based on Wishlist
        </button>
      </div>
    </div>
  );
};

export default ProductRecommendations;