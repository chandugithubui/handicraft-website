import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist(product);
  };

  const [imageError, setImageError] = React.useState(false);
  const isWishlisted = isInWishlist(product._id);

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageSrc = () => {
    if (imageError) {
      return '/images/HandcraftedWoodenBowl.webp';
    }
    // If image path doesn't start with /, add it
    if (product.image && !product.image.startsWith('/')) {
      return `/${product.image}`;
    }
    return product.image || '/images/HandcraftedWoodenBowl.webp';
  };

  const discount = product.originalPrice 
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
          />
          
          {/* Badge */}
          {discount > 0 && (
            <span className="product-badge">
              {discount}% OFF
            </span>
          )}

          {/* Wishlist Button */}
          <button 
            className={`product-wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
            onClick={handleWishlist}
            aria-label="Add to wishlist"
          >
            <FiHeart />
          </button>
        </div>

        {/* Content Section */}
        <div className="product-content">
          {/* Product Name */}
          <h3 className="product-name">{product.name}</h3>

          {/* Rating */}
          {product.rating && (
            <div className="product-rating">
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <FiStar 
                    key={i} 
                    className={`star ${i < Math.floor(product.rating) ? 'filled' : ''}`}
                  />
                ))}
              </div>
              {product.reviewCount && (
                <span className="review-count">({product.reviewCount})</span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="product-price">
            <span className="current-price">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button 
            className="product-add-btn"
            onClick={handleAddToCart}
          >
            <FiShoppingBag />
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
