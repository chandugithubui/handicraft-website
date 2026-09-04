import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiStar, FiShare2, FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { getProductById } from '../services/productService';
import ReviewSection from '../components/ReviewSection';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const productData = await getProductById(id);
      setProduct(productData);
      if (productData.images && productData.images.length > 0) {
        setSelectedImage(0);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // Wishlist functionality to be implemented
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="container">
          <div className="skeleton-wrapper">
            <div className="skeleton-images"></div>
            <div className="skeleton-info"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-error">
        <div className="container">
          <p>Product not found</p>
          <Link to="/products" className="btn btn-primary">Back to Products</Link>
        </div>
      </div>
    );
  }

  const images = product.images || [product.image || product.imageUrl];
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="product-breadcrumb">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/products" className="breadcrumb-link">Products</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </div>

        <div className="product-detail-content">
          {/* Left - Images */}
          <div className="product-gallery">
            <div className="main-image-wrapper">
              <img 
                src={images[selectedImage]} 
                alt={product.name} 
                className="main-image"
              />
              {discount > 0 && (
                <span className="discount-badge">{discount}% OFF</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="thumbnail-grid">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail-btn ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Product Info */}
          <div className="product-info">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              <div className="product-rating">
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <FiStar 
                      key={i} 
                      className={`star ${i < Math.floor(product.rating || 4) ? 'filled' : ''}`}
                    />
                  ))}
                </div>
                <span className="rating-value">{product.rating || 4.5}</span>
                <span className="review-count">({product.reviewCount || 12} reviews)</span>
              </div>
            </div>

            <div className="product-price-section">
              <div className="current-price">₹{product.price.toLocaleString()}</div>
              {product.originalPrice && (
                <div className="original-price">₹{product.originalPrice.toLocaleString()}</div>
              )}
              {discount > 0 && (
                <div className="discount-text">Save ₹{(product.originalPrice - product.price).toLocaleString()}</div>
              )}
            </div>

            <p className="product-description">{product.description}</p>

            {/* Stock Status */}
            <div className="stock-status">
              {product.stock === 0 ? (
                <span className="stock-out">Out of Stock</span>
              ) : product.stock < 5 ? (
                <span className="stock-low">Only {product.stock} left in stock</span>
              ) : (
                <span className="stock-in">In Stock</span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="quantity-selector">
              <span className="quantity-label">Quantity:</span>
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <FiMinus />
                </button>
                <span className="quantity-value">{quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (product?.stock || 10)}
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="product-actions">
              <button 
                className="btn btn-primary btn-lg add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <FiShoppingBag />
                Add to Cart
              </button>
              <button 
                className={`btn btn-outline btn-lg wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlist}
              >
                <FiHeart />
                {isWishlisted ? 'Wishlisted' : 'Wishlist'}
              </button>
              <button className="btn btn-ghost btn-lg share-btn">
                <FiShare2 />
                Share
              </button>
            </div>

            {/* Product Meta */}
            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-label">Category:</span>
                <span className="meta-value">{product.category || 'Handicrafts'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Material:</span>
                <span className="meta-value">{product.material || 'Mixed'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">SKU:</span>
                <span className="meta-value">{product.sku || 'HC-' + id}</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="trust-badge">
                <span className="badge-icon">✓</span>
                <span className="badge-text">100% Authentic</span>
              </div>
              <div className="trust-badge">
                <span className="badge-icon">✓</span>
                <span className="badge-text">Handcrafted with Care</span>
              </div>
              <div className="trust-badge">
                <span className="badge-icon">✓</span>
                <span className="badge-text">Secure Packaging</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="product-reviews-section">
          <ReviewSection productId={id} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
