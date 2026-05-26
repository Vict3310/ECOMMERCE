import React from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const FilterChips = () => {
  const { activeFilters, updateFilter, clearAllFilters, formatPrice } = useAppContext();

  const hasActiveFilters = () => {
    return activeFilters.brands.length > 0 ||
           activeFilters.conditions.length > 0 ||
           activeFilters.storage.length > 0 ||
           activeFilters.colors.length > 0 ||
           activeFilters.inStock ||
           activeFilters.priceRange[0] > 0 ||
           activeFilters.priceRange[1] < 5000000 ||
           activeFilters.sortBy !== 'featured';
  };

  const removeFilter = (type, value) => {
    if (type === 'brands') {
      updateFilter('brands', activeFilters.brands.filter(b => b !== value));
    } else if (type === 'conditions') {
      updateFilter('conditions', activeFilters.conditions.filter(c => c !== value));
    } else if (type === 'storage') {
      updateFilter('storage', activeFilters.storage.filter(s => s !== value));
    } else if (type === 'colors') {
      updateFilter('colors', activeFilters.colors.filter(c => c !== value));
    } else if (type === 'inStock') {
      updateFilter('inStock', false);
    } else if (type === 'priceRange') {
      updateFilter('priceRange', [0, 5000000]);
    } else if (type === 'sortBy') {
      updateFilter('sortBy', 'featured');
    }
  };

  const getConditionLabel = (condition) => {
    return condition === 'brandNew' ? 'BRAND NEW' : 'UK USED';
  };

  if (!hasActiveFilters()) return null;

  return (
    <div style={{
      padding: '16px 0',
      borderBottom: 'var(--border-thin)',
      marginBottom: '32px'
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        {/* Price Range Chip */}
        {(activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < 5000000) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: 'var(--bg-secondary)',
            border: 'var(--border-thin)',
            borderRadius: '2px',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {formatPrice(activeFilters.priceRange[0])} - {formatPrice(activeFilters.priceRange[1])}
            <button
              onClick={() => removeFilter('priceRange')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                opacity: 0.6
              }}
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Sort By Chip */}
        {activeFilters.sortBy !== 'featured' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: 'var(--bg-secondary)',
            border: 'var(--border-thin)',
            borderRadius: '2px',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {activeFilters.sortBy === 'price-low' && 'PRICE: LOW TO HIGH'}
            {activeFilters.sortBy === 'price-high' && 'PRICE: HIGH TO LOW'}
            {activeFilters.sortBy === 'newest' && 'NEWEST'}
            {activeFilters.sortBy === 'rating' && 'HIGHEST RATED'}
            <button
              onClick={() => removeFilter('sortBy')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                opacity: 0.6
              }}
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Brand Chips */}
        {activeFilters.brands.map(brand => (
          <div key={brand} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: 'var(--bg-secondary)',
            border: 'var(--border-thin)',
            borderRadius: '2px',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {brand}
            <button
              onClick={() => removeFilter('brands', brand)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                opacity: 0.6
              }}
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Condition Chips */}
        {activeFilters.conditions.map(condition => (
          <div key={condition} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: 'var(--bg-secondary)',
            border: 'var(--border-thin)',
            borderRadius: '2px',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {getConditionLabel(condition)}
            <button
              onClick={() => removeFilter('conditions', condition)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                opacity: 0.6
              }}
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Storage Chips */}
        {activeFilters.storage.map(storage => (
          <div key={storage} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: 'var(--bg-secondary)',
            border: 'var(--border-thin)',
            borderRadius: '2px',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {storage}
            <button
              onClick={() => removeFilter('storage', storage)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                opacity: 0.6
              }}
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Color Chips */}
        {activeFilters.colors.map(color => (
          <div key={color} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: 'var(--bg-secondary)',
            border: 'var(--border-thin)',
            borderRadius: '2px',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {color}
            <button
              onClick={() => removeFilter('colors', color)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                opacity: 0.6
              }}
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* In Stock Chip */}
        {activeFilters.inStock && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: 'var(--bg-secondary)',
            border: 'var(--border-thin)',
            borderRadius: '2px',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            IN STOCK ONLY
            <button
              onClick={() => removeFilter('inStock')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                opacity: 0.6
              }}
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Clear All Button */}
        <button
          onClick={clearAllFilters}
          style={{
            marginLeft: 'auto',
            padding: '8px 16px',
            backgroundColor: 'var(--brand-blue)',
            color: '#fff',
            border: 'none',
            borderRadius: '2px',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer'
          }}
        >
          CLEAR ALL
        </button>
      </div>
    </div>
  );
};

export default FilterChips;