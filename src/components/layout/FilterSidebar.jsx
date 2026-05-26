import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { gsap } from 'gsap';

const FilterSection = ({ title, sectionKey, expandedSections, toggleSection, children }) => (
  <div className="filter-section">
    <button
      onClick={() => toggleSection(sectionKey)}
      className="filter-section-header"
      style={{
        width: '100%',
        padding: '16px 0',
        background: 'none',
        border: 'none',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        fontWeight: 800,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text-primary)'
      }}
    >
      {title}
      {expandedSections[sectionKey] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
    {expandedSections[sectionKey] && (
      <div style={{ paddingBottom: '24px' }}>
        {children}
      </div>
    )}
  </div>
);

const CheckboxOption = ({ label, checked, onChange }) => (
  <label style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
    cursor: 'pointer',
    fontSize: '13px'
  }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{
        width: '16px',
        height: '16px',
        accentColor: 'var(--brand-blue)',
        cursor: 'pointer'
      }}
    />
    {label}
  </label>
);

const FilterSidebar = ({ isOpen, onClose }) => {
  const { activeFilters, updateFilter, clearAllFilters, products } = useAppContext();
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    brand: true,
    condition: true,
    storage: false,
    color: false,
    sort: true
  });

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo('.filter-sidebar-content',
        { x: -300, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [isOpen]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Get unique values for filters
  const brands = [...new Set(products.map(p => p.brand))].sort();
  const storageOptions = [...new Set(products.flatMap(p => {
    const specs = p.specs || {};
    return specs.Storage ? [specs.Storage] : [];
  }))].sort();
  const colorOptions = [...new Set(products.flatMap(p => p.colors || []))].sort();

  if (!isOpen) return null;

  return (
    <div
      className="filter-sidebar-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex'
      }}
      onClick={onClose}
    >
      <div
        className="filter-sidebar-content"
        style={{
          width: '320px',
          maxWidth: '90vw',
          backgroundColor: 'var(--bg-primary)',
          borderRight: 'var(--border-thin)',
          padding: '24px',
          overflowY: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          paddingBottom: '16px',
          borderBottom: 'var(--border-thin)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SlidersHorizontal size={20} />
            <h2 style={{
              fontSize: '14px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              DISCOVER
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: 'var(--text-primary)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Clear All */}
        <button
          onClick={clearAllFilters}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'var(--bg-secondary)',
            border: 'var(--border-thin)',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '24px',
            cursor: 'pointer'
          }}
        >
          CLEAR ALL FILTERS
        </button>

        {/* Price Range */}
        <FilterSection title="PRICE RANGE" sectionKey="price" expandedSections={expandedSections} toggleSection={toggleSection}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="Min"
              value={activeFilters.priceRange[0]}
              onChange={(e) => updateFilter('priceRange', [Number(e.target.value), activeFilters.priceRange[1]])}
              style={{
                flex: 1,
                padding: '12px',
                border: 'var(--border-thin)',
                backgroundColor: 'var(--bg-secondary)',
                fontSize: '13px',
                fontWeight: 800
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 800 }}>—</span>
            <input
              type="number"
              placeholder="Max"
              value={activeFilters.priceRange[1]}
              onChange={(e) => updateFilter('priceRange', [activeFilters.priceRange[0], Number(e.target.value)])}
              style={{
                flex: 1,
                padding: '12px',
                border: 'var(--border-thin)',
                backgroundColor: 'var(--bg-secondary)',
                fontSize: '13px',
                fontWeight: 800
              }}
            />
          </div>
        </FilterSection>

        {/* Sort By */}
        <FilterSection title="SORT BY" sectionKey="sort" expandedSections={expandedSections} toggleSection={toggleSection}>
          <select
            value={activeFilters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: 'var(--border-thin)',
              backgroundColor: 'var(--bg-secondary)',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <option value="featured">FEATURED</option>
            <option value="price-low">PRICE: LOW TO HIGH</option>
            <option value="price-high">PRICE: HIGH TO LOW</option>
            <option value="newest">NEWEST</option>
            <option value="rating">HIGHEST RATED</option>
          </select>
        </FilterSection>

        {/* Brands */}
        <FilterSection title="BRANDS" sectionKey="brand" expandedSections={expandedSections} toggleSection={toggleSection}>
          {brands.map(brand => (
            <CheckboxOption
              key={brand}
              label={brand}
              checked={activeFilters.brands.includes(brand)}
              onChange={(e) => {
                const newBrands = e.target.checked
                  ? [...activeFilters.brands, brand]
                  : activeFilters.brands.filter(b => b !== brand);
                updateFilter('brands', newBrands);
              }}
            />
          ))}
        </FilterSection>

        {/* Conditions */}
        <FilterSection title="CONDITIONS" sectionKey="condition" expandedSections={expandedSections} toggleSection={toggleSection}>
          <CheckboxOption
            label="BRAND NEW"
            checked={activeFilters.conditions.includes('brandNew')}
            onChange={(e) => {
              const newConditions = e.target.checked
                ? [...activeFilters.conditions, 'brandNew']
                : activeFilters.conditions.filter(c => c !== 'brandNew');
              updateFilter('conditions', newConditions);
            }}
          />
          <CheckboxOption
            label="UK USED"
            checked={activeFilters.conditions.includes('ukUsed')}
            onChange={(e) => {
              const newConditions = e.target.checked
                ? [...activeFilters.conditions, 'ukUsed']
                : activeFilters.conditions.filter(c => c !== 'ukUsed');
              updateFilter('conditions', newConditions);
            }}
          />
        </FilterSection>

        {/* Storage */}
        <FilterSection title="STORAGE" sectionKey="storage" expandedSections={expandedSections} toggleSection={toggleSection}>
          {storageOptions.map(storage => (
            <CheckboxOption
              key={storage}
              label={storage}
              checked={activeFilters.storage.includes(storage)}
              onChange={(e) => {
                const newStorage = e.target.checked
                  ? [...activeFilters.storage, storage]
                  : activeFilters.storage.filter(s => s !== storage);
                updateFilter('storage', newStorage);
              }}
            />
          ))}
        </FilterSection>

        {/* Colors */}
        <FilterSection title="COLORS" sectionKey="color" expandedSections={expandedSections} toggleSection={toggleSection}>
          {colorOptions.map(color => (
            <CheckboxOption
              key={color}
              label={color}
              checked={activeFilters.colors.includes(color)}
              onChange={(e) => {
                const newColors = e.target.checked
                  ? [...activeFilters.colors, color]
                  : activeFilters.colors.filter(c => c !== color);
                updateFilter('colors', newColors);
              }}
            />
          ))}
        </FilterSection>

        {/* In Stock Only */}
        <div style={{ padding: '16px 0', borderTop: 'var(--border-thin)', marginTop: '24px' }}>
          <CheckboxOption
            label="IN STOCK ONLY"
            checked={activeFilters.inStock}
            onChange={(e) => updateFilter('inStock', e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;