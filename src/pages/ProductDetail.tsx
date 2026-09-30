import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiHeart,
  FiShoppingBag,
  FiShare2,
  FiPlus,
  FiMinus,
  FiZap,
  FiArrowRight,
  FiCheck,
} from 'react-icons/fi';
import { FaHeart, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useProductDetail, useProductReviews, useProducts } from '../hooks/api';
import ReviewSection from '../components/ReviewSection';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, updateQuantity, cartItems } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const { data: product, isLoading: loading } = useProductDetail(id);
  const { data: reviewsData } = useProductReviews(id);
  const { data: allProducts = [] } = useProducts();

  const averageRating = Number(reviewsData?.averageRating ?? product?.rating ?? 5.0);
  const totalReviews = Number(reviewsData?.totalReviews ?? product?.numReviews ?? (reviewsData?.reviews?.length || 1));
  const [selectedImage, setSelectedImage] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const productId = id || (product?._id ? String(product._id) : '');
  const isWishlisted = isInWishlist(productId);
  const cartItem = cartItems.find((item) => String(item._id) === String(productId));
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const stock = product?.stock !== undefined ? product.stock : 99;
  const remainingStock = Math.max(0, stock - quantityInCart);

  // Find suggested products: same category first, excluding current product
  const suggestedProducts = allProducts
    .filter((p: any) => String(p._id) !== String(productId))
    .filter((p: any) =>
      product?.category
        ? String(p.category || '').toLowerCase() === String(product.category || '').toLowerCase()
        : true
    )
    .slice(0, 4);

  const displaySuggested =
    suggestedProducts.length >= 4
      ? suggestedProducts
      : [
          ...suggestedProducts,
          ...allProducts
            .filter(
              (p: any) =>
                String(p._id) !== String(productId) &&
                !suggestedProducts.some((s: any) => String(s._id) === String(p._id))
            )
            .slice(0, 4 - suggestedProducts.length),
        ];

  // Add product to cart with stock validation
  const handleAddToCart = (qtyToAdd: number = 1) => {
    if (!product) return;
    if (stock <= 0) {
      setNotice('This product is out of stock.');
      setTimeout(() => setNotice(null), 3000);
      return;
    }
    if (quantityInCart + qtyToAdd > stock) {
      setNotice(`Cannot add more. Only ${remainingStock} items left in stock.`);
      setTimeout(() => setNotice(null), 3000);
      return;
    }
    const res = addToCart(product, qtyToAdd);
    if (!res.success && res.message) {
      setNotice(res.message);
      setTimeout(() => setNotice(null), 3000);
    } else {
      setNotice(`Added to your cart!`);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  // Buy Now: Validate stock, add item to cart, and navigate directly to checkout
  const handleBuyNow = () => {
    if (!product) return;

    if (stock <= 0) {
      setNotice('This product is out of stock.');
      setTimeout(() => setNotice(null), 3000);
      return;
    }

    if (quantityInCart === 0) {
      addToCart(product, 1);
    }

    // Redirect to login if not authenticated, and come back to checkout
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    navigate('/checkout');
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
                <div className="rating-stars" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    if (averageRating >= star) {
                      return <FaStar key={star} style={{ color: '#F59E0B', fontSize: '18px' }} />;
                    } else if (averageRating >= star - 0.5) {
                      return <FaStarHalfAlt key={star} style={{ color: '#F59E0B', fontSize: '18px' }} />;
                    } else {
                      return <FaRegStar key={star} style={{ color: '#D1D5DB', fontSize: '18px' }} />;
                    }
                  })}
                </div>

                <span className="rating-value" style={{ fontWeight: 600, color: '#1F2937', marginLeft: '4px' }}>
                  {averageRating > 0 ? averageRating.toFixed(1) : '5.0'}
                </span>

                <span className="review-count" style={{ color: '#6B7280', fontSize: '14px' }}>
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

            {/* Stock / Cart Notice */}
            {notice && (
              <div className="product-notice">
                {notice}
              </div>
            )}

            {/* In-Cart Quantity Controls (Only shown once item is added to cart) */}
            {quantityInCart > 0 && (
              <div className="cart-quantity-banner">
                <div className="cart-quantity-info">
                  <span className="cart-quantity-label">Quantity in Cart:</span>
                  <span className="cart-added-pill">
                    <FiCheck size={13} style={{ marginRight: 4 }} /> {quantityInCart} added
                  </span>
                </div>
                <div className="quantity-controls">
                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={() => updateQuantity(product._id, quantityInCart - 1)}
                    title="Decrease quantity"
                  >
                    <FiMinus />
                  </button>
                  <span className="quantity-value">{quantityInCart}</span>
                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={() => handleAddToCart(1)}
                    disabled={quantityInCart >= stock}
                    title="Increase quantity"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            )}

            {/* ── Action Buttons (placed prominently right below price & stock) ── */}
            <div className="product-actions">
              {quantityInCart === 0 ? (
                /* Initial State: Add to Cart & Buy Now */
                <>
                  <button
                    type="button"
                    className="btn add-to-cart-btn"
                    onClick={() => handleAddToCart(1)}
                    disabled={product.stock === 0}
                  >
                    <FiShoppingBag className="btn-icon" />
                    <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn buy-now-btn"
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                  >
                    <FiZap className="btn-icon" />
                    <span>Buy Now</span>
                  </button>
                </>
              ) : (
                /* Once Added to Cart: Go to Cart & Buy Now */
                <>
                  <Link to="/cart" className="btn go-to-cart-btn">
                    <FiShoppingBag className="btn-icon" />
                    <span>Go to Cart</span>
                    <FiArrowRight className="ms-1" />
                  </Link>

                  <button
                    type="button"
                    className="btn buy-now-btn"
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                  >
                    <FiZap className="btn-icon" />
                    <span>Buy Now</span>
                  </button>
                </>
              )}

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
                className="btn btn-ghost share-btn"
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

            {/* Description */}
            <p className="product-description">
              {product.description}
            </p>

            {/* Product Meta / Specifications (SKU removed as requested) */}
            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-label">Category:</span>
                <span className="meta-value">{product.category || 'Handicrafts'}</span>
              </div>

              <div className="meta-item">
                <span className="meta-label">Material:</span>
                <span className="meta-value">{product.material || 'Traditional Natural Fiber'}</span>
              </div>

              {(product.artisan?.name || product.artisanName) && (
                <div className="meta-item">
                  <span className="meta-label">Artisan:</span>
                  <span className="meta-value">{product.artisan?.name || product.artisanName}</span>
                </div>
              )}

              {product.dimensions && (
                <div className="meta-item">
                  <span className="meta-label">Dimensions:</span>
                  <span className="meta-value">{product.dimensions}</span>
                </div>
              )}

              <div className="meta-item">
                <span className="meta-label">Availability:</span>
                <span className="meta-value" style={{ color: stock > 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                  {stock > 0 ? `In Stock (${stock} available)` : 'Out of Stock'}
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

        {/* Suggested Products Section */}
        {displaySuggested.length > 0 && (
          <section className="suggested-products-section">
            <div className="suggested-header">
              <h2 className="suggested-title">You May Also Like</h2>
              <p className="suggested-subtitle">Handcrafted treasures curated especially for you</p>
            </div>
            <div className="suggested-grid">
              {displaySuggested.map((item: any) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <div className="product-reviews-section">
          <ReviewSection productId={id} />
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;