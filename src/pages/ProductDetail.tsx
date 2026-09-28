import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiHeart,
  FiShoppingBag,
  FiStar,
  FiShare2,
  FiPlus,
  FiMinus,
  FiZap,
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useProductDetail, useProductReviews } from '../hooks/api';
import ReviewSection from '../components/ReviewSection';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const { data: product, isLoading: loading } = useProductDetail(id);
  const { data: reviewsData } = useProductReviews(id);

  const averageRating = Number(reviewsData?.averageRating) || 0;
  const totalReviews = reviewsData?.totalReviews || 0;
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const productId = id || (product?._id ? String(product._id) : '');
  const isWishlisted = isInWishlist(productId);
  const cartItem = cartItems.find((item) => String(item._id) === String(productId));
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const stock = product?.stock !== undefined ? product.stock : 99;
  const remainingStock = Math.max(0, stock - quantityInCart);

  // Add product to cart with stock validation
  const handleAddToCart = () => {
    if (!product) return;
    if (stock <= 0) {
      setNotice('This product is out of stock.');
      setTimeout(() => setNotice(null), 3000);
      return;
    }
    if (quantityInCart + quantity > stock) {
      setNotice(`Cannot add ${quantity} more. Only ${remainingStock} items left available in stock.`);
      setTimeout(() => setNotice(null), 3500);
      return;
    }
    const res = addToCart(product, quantity);
    if (!res.success && res.message) {
      setNotice(res.message);
      setTimeout(() => setNotice(null), 3000);
    } else {
      setNotice(`Added ${quantity} item(s) to your cart!`);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  // Buy Now: Validate stock, add item to cart, and navigate directly to checkout
  const handleBuyNow = () => {
    if (!product) return;

    // Redirect to login if not authenticated, and come back to checkout
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    if (stock <= 0) {
      setNotice('This product is out of stock.');
      setTimeout(() => setNotice(null), 3000);
      return;
    }

    const buyQty = Math.max(1, Math.min(quantity, stock));
    const res = addToCart(product, buyQty);
    if (!res.success && res.message && !cartItems.some(item => String(item._id) === String(productId))) {
      setNotice(res.message);
      setTimeout(() => setNotice(null), 3000);
      return;
    }

    navigate('/checkout');
  };

  // Change product quantity
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= Math.max(1, remainingStock)) {
      setQuantity(newQuantity);
    }
  };

  // Toggle wishlist
  const handleWishlist = () => {
    if (product) {
      addToWishlist(product);
    }
  };

  // Loading state
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

  // Product not found
  if (!product) {
    return (
      <div className="product-detail-error">
        <div className="container">
          <p>Product not found</p>

          <Link
            to="/products"
            className="btn btn-primary"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Product images
  const images =
    product.images ||
    [product.image || product.imageUrl];

  // Calculate discount
  const discount = product.originalPrice
    ? Math.round(
      ((product.originalPrice - product.price) /
        product.originalPrice) *
      100
    )
    : 0;

  return (
    <div className="product-detail-page">
      <div className="container">

        {/* Breadcrumb */}
        <div className="product-breadcrumb">
          <Link
            to="/"
            className="breadcrumb-link"
          >
            Home
          </Link>

          <span className="breadcrumb-separator">
            /
          </span>

          <Link
            to="/products"
            className="breadcrumb-link"
          >
            Products
          </Link>

          <span className="breadcrumb-separator">
            /
          </span>

          <span className="breadcrumb-current">
            {product.name}
          </span>
        </div>

        {/* Product Details */}
        <div className="product-detail-content">

          {/* Left - Product Images */}
          <div className="product-gallery">

            <div className="main-image-wrapper">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="main-image"
              />

              {discount > 0 && (
                <span className="discount-badge">
                  {discount}% OFF
                </span>
              )}
            </div>

            {/* Product Thumbnails */}
            {images.length > 1 && (
              <div className="thumbnail-grid">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail-btn ${selectedImage === index
                        ? 'active'
                        : ''
                      }`}
                    onClick={() =>
                      setSelectedImage(index)
                    }
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1
                        }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Product Information */}
          <div className="product-info">

            {/* Product Header */}
            <div className="product-header">

              <h1 className="product-title">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="product-rating">
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`star ${i < Math.floor(averageRating)
                          ? 'filled'
                          : ''
                        }`}
                    />
                  ))}
                </div>

                <span className="rating-value">
                  {averageRating.toFixed(1)}
                </span>

                <span className="review-count">
                  ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="product-price-section">

              <div className="current-price">
                ₹{product.price.toLocaleString()}
              </div>

              {product.originalPrice && (
                <div className="original-price">
                  ₹{product.originalPrice.toLocaleString()}
                </div>
              )}

              {discount > 0 && (
                <div className="discount-text">
                  Save ₹
                  {(
                    product.originalPrice -
                    product.price
                  ).toLocaleString()}
                </div>
              )}

            </div>

            {/* Description */}
            <p className="product-description">
              {product.description}
            </p>

            {/* Stock Status */}
            <div className="stock-status">

              {product.stock === 0 ? (
                <span className="stock-out">
                  Out of Stock
                </span>
              ) : product.stock < 5 ? (
                <span className="stock-low">
                  Only {product.stock} left in stock
                </span>
              ) : (
                <span className="stock-in">
                  In Stock
                </span>
              )}

            </div>

            {/* Quantity Selector */}
            <div className="quantity-selector">

              <span className="quantity-label">
                Quantity:
              </span>

              <div className="quantity-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                <button
                  type="button"
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  style={{
                    width: '36px',
                    height: '36px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    backgroundColor: '#FFF8ED',
                    border: '1.5px solid #C99A4A',
                    color: '#6E1717',
                    cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                    opacity: quantity <= 1 ? 0.4 : 1,
                  }}
                >
                  <FiMinus style={{ width: '16px', height: '16px', color: '#6E1717', strokeWidth: 3 }} />
                </button>

                <span
                  className="quantity-value"
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#6E1717',
                    minWidth: '36px',
                    textAlign: 'center',
                  }}
                >
                  {quantity}
                </span>

                <button
                  type="button"
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= Math.max(1, remainingStock)}
                  style={{
                    width: '36px',
                    height: '36px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    backgroundColor: '#FFF8ED',
                    border: '1.5px solid #C99A4A',
                    color: '#6E1717',
                    cursor: quantity >= Math.max(1, remainingStock) ? 'not-allowed' : 'pointer',
                    opacity: quantity >= Math.max(1, remainingStock) ? 0.4 : 1,
                  }}
                >
                  <FiPlus style={{ width: '16px', height: '16px', color: '#6E1717', strokeWidth: 3 }} />
                </button>

              </div>
            </div>

            {/* Stock / Cart Notice */}
            {notice && (
              <div className="product-notice">
                {notice}
              </div>
            )}

            {/* Action Buttons */}
            <div className="product-actions">

              {/* Add to Cart Button */}
              <button
                type="button"
                className="btn add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || remainingStock <= 0}
              >
                <FiShoppingBag className="btn-icon" />
                <span>
                  {product.stock === 0
                    ? 'Out of Stock'
                    : remainingStock <= 0
                    ? `Max in Cart (${quantityInCart})`
                    : quantityInCart > 0
                    ? `In Cart (${quantityInCart}) • Add More`
                    : 'Add to Cart'}
                </span>
              </button>

              {/* Buy Now Button */}
              <button
                type="button"
                className="btn buy-now-btn"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                <FiZap className="btn-icon" />
                <span>Buy Now</span>
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                className={`btn wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlist}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                aria-label={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
              >
                {isWishlisted ? (
                  <FaHeart style={{ width: '18px', height: '18px', color: '#E53E3E' }} />
                ) : (
                  <FiHeart style={{ width: '18px', height: '18px' }} />
                )}
                <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
              </button>

              {/* Share Button */}
              <button
                type="button"
                className="btn btn-ghost btn-lg share-btn"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      text: product.description,
                      url: window.location.href,
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    setNotice('Product link copied to clipboard!');
                    setTimeout(() => setNotice(null), 2500);
                  }
                }}
                title="Share product"
              >
                <FiShare2 />
                <span>Share</span>
              </button>

            </div>

            {/* Product Meta */}
            <div className="product-meta">

              <div className="meta-item">
                <span className="meta-label">
                  Category:
                </span>

                <span className="meta-value">
                  {product.category ||
                    'Handicrafts'}
                </span>
              </div>

              <div className="meta-item">
                <span className="meta-label">
                  Material:
                </span>

                <span className="meta-value">
                  {product.material || 'Mixed'}
                </span>
              </div>

              <div className="meta-item">
                <span className="meta-label">
                  SKU:
                </span>

                <span className="meta-value">
                  {product.sku || `HC-${id}`}
                </span>
              </div>

            </div>

            {/* Trust Badges */}
            <div className="trust-badges">

              <div className="trust-badge">
                <span className="badge-icon">
                  ✓
                </span>

                <span className="badge-text">
                  100% Authentic
                </span>
              </div>

              <div className="trust-badge">
                <span className="badge-icon">
                  ✓
                </span>

                <span className="badge-text">
                  Handcrafted with Care
                </span>
              </div>

              <div className="trust-badge">
                <span className="badge-icon">
                  ✓
                </span>

                <span className="badge-text">
                  Secure Packaging
                </span>
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