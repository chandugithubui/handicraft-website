import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <div className="empty-wishlist">
            <FiHeart className="empty-icon" />
            <h2>Your wishlist is empty</h2>
            <p>Save your favorite handicrafts for later</p>
            <Link to="/products" className="btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="wishlist-header">
          <h1>My Wishlist</h1>
          <p>{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}</p>
          {wishlistItems.length > 0 && (
            <button className="clear-wishlist-btn" onClick={clearWishlist}>
              Clear All
            </button>
          )}
        </div>

        <div className="wishlist-grid">
          {wishlistItems.map((product) => (
            <div key={product._id} className="wishlist-item">
              <div className="wishlist-item-image">
                <img 
                  src={product.image.startsWith('/') ? product.image : `/${product.image}`} 
                  alt={product.name} 
                />
              </div>
              <div className="wishlist-item-details">
                <h3>{product.name}</h3>
                <p className="wishlist-item-description">{product.description}</p>
                <p className="wishlist-item-price">₹{product.price.toLocaleString()}</p>
                <div className="wishlist-item-actions">
                  <button 
                    className="btn-add-to-cart"
                    onClick={() => handleAddToCart(product)}
                  >
                    <FiShoppingBag />
                    Add to Cart
                  </button>
                  <button 
                    className="btn-remove"
                    onClick={() => handleRemoveFromWishlist(product._id)}
                  >
                    <FiTrash2 />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
