// src/components/ProductList.js
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../services/productService";
import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";
import "bootstrap/dist/css/bootstrap.min.css";
import "./productList.css";

const ProductList = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    category: '',
    material: '',
    minPrice: '',
    maxPrice: ''
  });

  // Read category and search from URL on component mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const searchFromUrl = searchParams.get('search');
    
    if (categoryFromUrl) {
      setFilters(prev => ({ ...prev, category: categoryFromUrl }));
    }
    if (searchFromUrl) {
      setSearch(searchFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.material) queryParams.append('material', filters.material);
        if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
        if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);

        const url = queryParams.toString()
          ? `?${queryParams.toString()}`
          : '';

        const productData = await getProducts(url);
        setProducts(productData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, filters]);


  const handleFilterChange = (filterType, value) => {
    if (filterType === 'clear') {
      setFilters({
        category: '',
        material: '',
        minPrice: '',
        maxPrice: ''
      });
      setSearch('');
    } else if (filterType === 'search') {
      setSearch(value);
    } else {
      setFilters({
        ...filters,
        [filterType]: value
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h2 className="products-title">Our Products</h2>
          {filters.category && (
            <div className="active-filter">
              <span className="filter-badge">Category: {filters.category}</span>
              <button 
                className="clear-filter-btn"
                onClick={() => handleFilterChange('clear')}
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>

        <div className="products-layout">
          {/* Filters Sidebar */}
          <div className="products-sidebar">
            <ProductFilters 
              onFilterChange={handleFilterChange}
              activeFilters={filters}
            />
          </div>

          {/* Products Grid */}
          <div className="products-main">
            {/* Search Bar */}
            <div className="products-search">
              <input
                type="text"
                className="search-input"
                placeholder="Search products by name..."
                value={search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <span className="products-count">
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {/* Product Grid */}
            <ProductGrid products={products} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;