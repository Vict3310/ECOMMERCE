import React, { useState, useRef } from 'react';
import { useAppContext } from "../../context/AppContext";
import { Search, X, TrendingUp, Clock, Filter } from 'lucide-react';

const AdvancedSearch = ({ isOpen, onClose, onSearch }) => {
  const { products, searchHistory, addToSearchHistory } = useAppContext();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const suggestions = React.useMemo(() => {
    if (query.length < 2) return [];

    const queryLower = query.toLowerCase();
    const exactMatches = products.filter(p =>
      p.name.toLowerCase() === queryLower ||
      p.brand.toLowerCase() === queryLower
    );

    const partialMatches = products.filter(p =>
      (p.name.toLowerCase().includes(queryLower) ||
       p.brand.toLowerCase().includes(queryLower) ||
       p.category.toLowerCase().includes(queryLower)) &&
      !exactMatches.some(em => em.id === p.id)
    );

    const historyMatches = searchHistory.filter(h =>
      h.toLowerCase().includes(queryLower)
    ).slice(0, 3);

    const trendingSearches = ['iPhone', 'MacBook', 'Samsung', 'AirPods', 'iPad']
      .filter(t => t.toLowerCase().includes(queryLower))
      .slice(0, 2);

    const generated = [];

    if (exactMatches.length > 0) {
      generated.push({
        type: 'products',
        items: exactMatches.slice(0, 3).map(p => ({ text: p.name, product: p }))
      });
    }

    if (partialMatches.length > 0) {
      generated.push({
        type: 'products',
        items: partialMatches.slice(0, 3).map(p => ({ text: p.name, product: p }))
      });
    }

    if (historyMatches.length > 0) {
      generated.push({
        type: 'history',
        items: historyMatches.map(h => ({ text: h }))
      });
    }

    if (trendingSearches.length > 0) {
      generated.push({
        type: 'trending',
        items: trendingSearches.map(t => ({ text: t }))
      });
    }

    return generated;
  }, [query, products, searchHistory]);

  const showSuggestions = suggestions.length > 0;

  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery.trim());
      onSearch(searchQuery.trim());
      setSelectedIndex(-1);
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, getTotalSuggestions() - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        const suggestion = getSuggestionAtIndex(selectedIndex);
        if (suggestion) {
          handleSearch(suggestion.text);
        }
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setSelectedIndex(-1);
    }
  };

  const getTotalSuggestions = () => {
    return suggestions.reduce((total, group) => total + group.items.length, 0);
  };

  const getSuggestionAtIndex = (index) => {
    let currentIndex = 0;
    for (const group of suggestions) {
      if (index < currentIndex + group.items.length) {
        return group.items[index - currentIndex];
      }
      currentIndex += group.items.length;
    }
    return null;
  };

  const handleSuggestionClick = (suggestion) => {
    handleSearch(suggestion.text);
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
        paddingTop: '120px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '8px',
          padding: '32px',
          width: '100%',
          maxWidth: '600px',
          margin: '0 24px',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <Search
            size={20}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)',
              opacity: 0.6
            }}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products, brands, categories..."
            style={{
              width: '100%',
              padding: '16px 16px 16px 48px',
              backgroundColor: 'var(--bg-secondary)',
              border: 'var(--border-thin)',
              color: 'var(--text-primary)',
              fontSize: '16px',
              outline: 'none'
            }}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: 'var(--border-thin)',
              borderRadius: '4px',
              maxHeight: '400px',
              overflowY: 'auto'
            }}
          >
            {suggestions.map((group, groupIndex) => (
              <div key={group.type}>
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-primary)',
                  borderBottom: 'var(--border-thin)',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  opacity: 0.6
                }}>
                  {group.type === 'products' && 'Products'}
                  {group.type === 'history' && 'Recent Searches'}
                  {group.type === 'trending' && 'Trending'}
                </div>
                {group.items.map((item, itemIndex) => {
                  const globalIndex = suggestions.slice(0, groupIndex).reduce((total, g) => total + g.items.length, 0) + itemIndex;
                  const isSelected = globalIndex === selectedIndex;

                  return (
                    <button
                      key={`${group.type}-${itemIndex}`}
                      onClick={() => handleSuggestionClick(item)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: isSelected ? 'var(--brand-blue)' : 'transparent',
                        color: isSelected ? '#fff' : 'var(--text-primary)',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      {group.type === 'history' && <Clock size={14} opacity={0.6} />}
                      {group.type === 'trending' && <TrendingUp size={14} opacity={0.6} />}
                      {group.type === 'products' && <Filter size={14} opacity={0.6} />}
                      <span style={{ fontSize: '14px' }}>{item.text}</span>
                      {item.product && (
                        <span style={{
                          fontSize: '12px',
                          opacity: 0.6,
                          marginLeft: 'auto'
                        }}>
                          {item.product.category}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Search Actions */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '24px'
        }}>
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim()}
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
              cursor: query.trim() ? 'pointer' : 'not-allowed',
              opacity: query.trim() ? 1 : 0.5
            }}
          >
            Search
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'var(--border-thin)',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;