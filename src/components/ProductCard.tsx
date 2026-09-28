import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiStar, FiPlus, FiMinus, FiCheck } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './ProductCard.css';

interface ProductCardProps {
  product: any;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const [imageError, setImageError] = useState(false);
  const [stockNotice, setStockNotice] = useState<string | null>(null);

  const isWishlisted = isInWishlist(product._id);
  const cartItem = cartItems.find((item) => item._id === product._id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const stock = product.stock !== undefined ? product.stock : 99;
  const isOutOfStock = stock <= 0;
  const isMaxStockReached = quantityInCart >= stock;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      setStockNotice('Out of stock');
      setTimeout(() => setStockNotice(null), 2500);
      return;
    }

    if (isMaxStockReached) {
      setStockNotice(`Max stock (${stock}) reached`);
      setTimeout(() => setStockNotice(null), 2500);
      return;
    }

    const res = addToCart(product, 1);
    if (!res.success && res.message) {
      setStockNotice(res.message);
      setTimeout(() => setStockNotice(null), 2500);
    }
  };

  const handleDecreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantityInCart > 0) {
      updateQuantity(product._id, quantityInCart - 1);
    }
  };

  const handleIncreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMaxStockReached) {
      setStockNotice(`Stock limit (${stock}) reached`);
      setTimeout(() => setStockNotice(null), 2500);
      return;
    }
    updateQuantity(product._id, quantityInCart + 1);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist(product);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageSrc = () => {
    if (imageError) {
      return '/images/HandcraftedWoodenBowl.webp';
    }
    return product.image || product.imageUrl || '/images/HandcraftedWoodenBowl.webp';
  };

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product._id}`} className="product-card-link">
      <div className="product-card">
        {/* Image Section */}
        <div className="product-image-wrapper">
          <img
            src={getImageSrc()}
            alt={product.name}
            className="product-image"
            onError={handleImageError}
            loading="lazy"
          />

          {/* Badge */}
          {discount > 0 && (
            <span className="product-badge">
              {discount}% OFF
            </span>
          )}

          {/* Wishlist Button */}
          <button
            type="button"
            className={`product-wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
            onClick={handleWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
          >
            {isWishlisted ? (
              <FaHeart style={{ width: '18px', height: '18px', color: '#E53E3E' }} />
            ) : (
              <FiHeart style={{ width: '18px', height: '18px', color: '#6E1717' }} />
            )}
          </button>
        </div>

        {/* Content Section */}
        <div className="product-content">
          {/* Product Name */}
          <h3 className="product-name">{product.name}</h3>

          {/* Rating */}
          <div className="product-rating">
            <div className="rating-stars">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`star ${i < Math.floor(Number(product.rating) || 0) ? 'filled' : ''}`}
                />
              ))}
            </div>

            <span className="rating-value">
              {(Number(product.rating) || 0).toFixed(1)}
            </span>

            <span className="review-count">
              ({product.numReviews || 0})
            </span>
          </div>

          {/* Price */}
          <div className="product-price">
            <span className="current-price">₹{(product.price || 0).toLocaleString()}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>

          {/* Stock Notice Toast */}
          {stockNotice && (
            <div className="text-[10px] text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-center font-semibold animate-pulse">
              {stockNotice}
            </div>
          )}

          {/* Add to Cart / Quantity Stepper Button */}
          {quantityInCart > 0 ? (
            <div
              className="product-stepper-control"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#6E1717',
                borderRadius: '8px',
                padding: '4px 6px',
                marginTop: '8px',
                boxShadow: '0 2px 6px rgba(110, 23, 23, 0.25)',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <button
                type="button"
                className="stepper-btn stepper-btn-minus"
                onClick={handleDecreaseQuantity}
                title="Decrease quantity"
                style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  color: '#6E1717',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <FiMinus style={{ width: '15px', height: '15px', color: '#6E1717', strokeWidth: 3 }} />
              </button>

              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0 6px',
                }}
              >
                <FiCheck style={{ width: '14px', height: '14px', color: '#C99A4A', strokeWidth: 3 }} />
                {quantityInCart} in Cart
              </span>

              <button
                type="button"
                className="stepper-btn stepper-btn-plus"
                disabled={isMaxStockReached}
                onClick={handleIncreaseQuantity}
                title={isMaxStockReached ? `Stock limit (${stock}) reached` : 'Add one more'}
                style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  backgroundColor: isMaxStockReached ? '#e5e7eb' : '#FFFFFF',
                  color: isMaxStockReached ? '#9ca3af' : '#6E1717',
                  border: 'none',
                  cursor: isMaxStockReached ? 'not-allowed' : 'pointer',
                  padding: 0,
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <FiPlus
                  style={{
                    width: '15px',
                    height: '15px',
                    color: isMaxStockReached ? '#9ca3af' : '#6E1717',
                    strokeWidth: 3,
                  }}
                />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={`product-add-btn ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <FiShoppingBag />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
