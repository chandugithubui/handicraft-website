// src/components/ProductList.js
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPaginatedProducts } from "../services/productService";
import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";
import "bootstrap/dist/css/bootstrap.min.css";
import "./productList.css";

const ProductList = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState('newest');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 12
  });

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
        queryParams.append('page', currentPage);
        queryParams.append('limit', 12);
        queryParams.append('sort', sort);
        if (search) queryParams.append('search', search);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.material) queryParams.append('material', filters.material);
        if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
        if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);

        const url = queryParams.toString()
          ? `?${queryParams.toString()}`
          : '';

        const productData = await getPaginatedProducts(url);

        setProducts(productData.products);
        setPagination(productData.pagination);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, filters, currentPage, sort]);


  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
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
                {pagination.totalProducts} product{pagination.totalProducts !== 1 ? 's' : ''} found
              </span>
              <select
                className="sort-select"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="newest">Newest</option>
                <option value="price-low-high">
                  Price: Low to High
                </option>
                <option value="price-high-low">
                  Price: High to Low
                </option>
                <option value="name-a-z">
                  Name: A to Z
                </option>
              </select>
            </div>

            {/* Product Grid */}
            <ProductGrid products={products} loading={loading} />
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination-container">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>

                {[...Array(pagination.totalPages)].map((_, index) => {
                  const pageNumber = index + 1;

                  return (
                    <button
                      key={pageNumber}
                      className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''
                        }`}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  className="pagination-btn"
                  disabled={currentPage === pagination.totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;