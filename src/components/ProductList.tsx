import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePaginatedProducts } from "../hooks/api";
import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";
import "bootstrap/dist/css/bootstrap.min.css";
import "./productList.css";

const ProductList = () => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    category: '',
    material: '',
    minPrice: '',
    maxPrice: ''
  });

  // Accordion open/close state lifted here so it survives loading re-renders.
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    material: false,
    price: false
  });

  // Ref to the products content area — used for pagination scroll only.
  const productsMainRef = useRef<HTMLDivElement>(null);

  // Track whether the last page change came from a pagination button click
  // (as opposed to a filter/sort/search resetting page to 1).
  // We use a ref so it doesn't trigger renders.
  

  // Read category and search from URL on component mount only.
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const searchFromUrl = searchParams.get('search');
    if (categoryFromUrl) {
      setFilters(prev => ({ ...prev, category: categoryFromUrl }));
    }
    if (searchFromUrl) {
      setSearch(searchFromUrl);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to the top of the products content area when the page changes
  // AND the change came from a pagination button (not a filter reset).
  // Using requestAnimationFrame ensures we scroll after the new skeleton/content
  // has been painted so the layout height is correct when we scroll.


  const queryParams = new URLSearchParams();
  queryParams.append('page', String(currentPage));
  queryParams.append('limit', '12');
  queryParams.append('sort', sort);
  if (search) queryParams.append('search', search);
  if (filters.category) queryParams.append('category', filters.category);
  if (filters.material) queryParams.append('material', filters.material);
  if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
  if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);

  const url = queryParams.toString() ? `?${queryParams.toString()}` : '';

  const { data, isLoading: loading } = usePaginatedProducts(url);
  const products = data?.products || [];
  const pagination = data?.pagination || {
    currentPage,
    totalPages: 1,
    totalProducts: 0,
    limit: 12
  };

  const handleFilterChange = (filterType: string, value: any = '') => {
    // Filter/sort/search resets to page 1 — NOT a pagination click, don't scroll.
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

  /** Change page from a pagination button — marks the ref so scroll fires. */
  const handlePageChange = (page: number) => {
    if (page === currentPage || loading) return;

    const el = productsMainRef.current;

    if (el) {
      const top =
        el.getBoundingClientRect().top + window.scrollY - 100;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: "instant",
      });
    }

    setCurrentPage(page);
  };
  // Do NOT early-return with <LoadingSpinner> here.
  // An early return unmounts <ProductFilters> and resets its accordion state.
  // Instead, pass `loading` to <ProductGrid> which handles its own skeleton/spinner.

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
          {/* Filters Sidebar — always mounted so accordion state is preserved */}
          <div className="products-sidebar">
            <ProductFilters
              onFilterChange={handleFilterChange}
              activeFilters={filters}
              expandedSections={expandedSections}
              onToggleSection={(section: string) =>
                setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
              }
            />
          </div>

          {/* Products Grid */}
          <div className="products-main" ref={productsMainRef}>
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
                  setCurrentPage(1); // sort reset — not a pagination click, no scroll
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
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>

                {[...Array(pagination.totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  className="pagination-btn"
                  disabled={currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
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