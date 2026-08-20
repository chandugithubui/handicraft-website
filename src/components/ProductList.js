// src/components/ProductList.js
import React, { useEffect, useState } from "react";
import { Badge } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { getProducts, deleteProduct } from "../services/productService";
import { useCart } from "../context/CartContext";
import ProductFilters from "./ProductFilters";
import "bootstrap/dist/css/bootstrap.min.css";
import "./productList.css";

const ProductList = () => {
  const { addToCart } = useCart();
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
    console.log('URL params - category:', categoryFromUrl, 'search:', searchFromUrl);
    
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

        console.log('Fetching products with URL:', url);
        console.log('Current filters:', filters);
        const productData = await getProducts(url);
        console.log('Products received:', productData.length, 'items');
        setProducts(productData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, filters]);

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      setProducts(products.filter((product) => product._id !== productId));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

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
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Our Products</h2>
        {filters.category && (
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary">Category: {filters.category}</span>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => handleFilterChange('clear')}
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      <div className="row">
        {/* Filters Sidebar */}
        <div className="col-md-3">
          <ProductFilters 
            onFilterChange={handleFilterChange}
            activeFilters={filters}
          />
        </div>

        {/* Products Grid */}
        <div className="col-md-9">
          {/* Search Bar */}
          <div className="row mb-4">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control shadow-sm"
                placeholder="Search products by name..."
                value={search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <span className="text-muted">
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>

          <div className="row">
            {products.length === 0 ? (
              <div className="col-12 text-center py-5">
                <div className="alert alert-info">
                  <h4>No products found</h4>
                  {filters.category && (
                    <p className="mb-0">
                      No products found in category "{filters.category}". 
                      Try clearing the filter or browsing other categories.
                    </p>
                  )}
                  {!filters.category && (
                    <p className="mb-0">
                      Try adjusting your search or filters to find what you're looking for.
                    </p>
                  )}
                  <button 
                    className="btn btn-primary mt-3"
                    onClick={() => handleFilterChange('clear')}
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            ) : (
              products.map((product) => (
            <div
              key={product._id}
              className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
            >
              <div className="card h-100 shadow-sm border-0 rounded-4 product-card">
                {/* Image */}
                <div className="overflow-hidden">
                  <img
                     src={product.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"}
                     className="card-img-top"
                     alt={product.name}
                     style={{ height: "220px", objectFit: "cover" }}
                     onError={(e) => {
                       e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Available";
                     }}
                    />
                </div>

                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold">{product.name}</h5>
                  <p className="card-text text-muted flex-grow-1">
                    {product.description?.substring(0, 80)}...
                  </p>
                  <h6 className="text-success fw-bold">₹ {product.price}</h6>
                  
                  {/* Stock Indicator */}
                  <div className="mb-2">
                    {product.stock === 0 ? (
                      <Badge bg="danger">Out of Stock</Badge>
                    ) : product.stock < 5 ? (
                      <Badge bg="warning">Low Stock ({product.stock})</Badge>
                    ) : (
                      <Badge bg="success">In Stock ({product.stock})</Badge>
                    )}
                  </div>

                  <div className="d-flex justify-content-between mt-3">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;