import React, { useState, useEffect } from 'react';
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './ProductFilters.css';

// Local categories matching product categories
const localCategories = [
  { _id: 'pattachitra', name: 'Pattachitra', slug: 'pattachitra' },
  { _id: 'palm-leaf', name: 'Palm Leaf', slug: 'palm-leaf' },
  { _id: 'sarees', name: 'Sarees', slug: 'sarees' },
  { _id: 'wooden', name: 'Wooden Crafts', slug: 'wooden' },
  { _id: 'sculptures', name: 'Sculptures', slug: 'sculptures' },
  { _id: 'decor', name: 'Home Decor', slug: 'decor' },
  { _id: 'gifts', name: 'Gifts', slug: 'gifts' }
];

const ProductFilters = ({ onFilterChange, activeFilters }) => {
  const [categories, setCategories] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    material: false,
    price: false
  });
  
  const materials = ['Wood', 'Metal', 'Clay', 'Fabric', 'Stone', 'Bamboo'];

  useEffect(() => {
    // Use local categories instead of fetching from backend
    setCategories(localCategories);
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  const clearFilters = () => {
    onFilterChange('clear', null);
  };

  const hasActiveFilters = Object.keys(activeFilters).some(
    key => activeFilters[key] && activeFilters[key] !== ''
  );

  return (
    <div className="product-filters">
      <div className="filters-header">
        <h3 className="filters-title">
          <FiFilter className="filters-icon" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            <FiX className="clear-icon" />
            Clear All
          </button>
        )}
      </div>

      <div className="filters-content">
        {/* Category Filter */}
        <div className="filter-section">
          <button 
            className="filter-section-header"
            onClick={() => toggleSection('category')}
          >
            <span>Category</span>
            {expandedSections.category ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {expandedSections.category && (
            <div className="filter-section-content">
              <label className="filter-option">
                <input
                  type="radio"
                  name="category"
                  checked={!activeFilters.category}
                  onChange={() => handleFilterChange('category', '')}
                />
                <span>All Categories</span>
              </label>
              {categories.map((category) => (
                <label key={category._id} className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    checked={activeFilters.category === category.slug}
                    onChange={() => handleFilterChange('category', category.slug)}
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Material Filter */}
        <div className="filter-section">
          <button 
            className="filter-section-header"
            onClick={() => toggleSection('material')}
          >
            <span>Material</span>
            {expandedSections.material ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {expandedSections.material && (
            <div className="filter-section-content">
              <label className="filter-option">
                <input
                  type="radio"
                  name="material"
                  checked={!activeFilters.material}
                  onChange={() => handleFilterChange('material', '')}
                />
                <span>All Materials</span>
              </label>
              {materials.map((material) => (
                <label key={material} className="filter-option">
                  <input
                    type="radio"
                    name="material"
                    checked={activeFilters.material === material}
                    onChange={() => handleFilterChange('material', material)}
                  />
                  <span>{material}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="filter-section">
          <button 
            className="filter-section-header"
            onClick={() => toggleSection('price')}
          >
            <span>Price Range</span>
            {expandedSections.price ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {expandedSections.price && (
            <div className="filter-section-content">
              <div className="price-inputs">
                <div className="price-input-group">
                  <label>Min Price</label>
                  <input
                    type="number"
                    placeholder="₹0"
                    value={activeFilters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="price-input"
                  />
                </div>
                <div className="price-input-group">
                  <label>Max Price</label>
                  <input
                    type="number"
                    placeholder="₹10000"
                    value={activeFilters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="price-input"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
