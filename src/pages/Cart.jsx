import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  const getApiUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    if (window.location.hostname === 'handicraft-website-fyao.vercel.app' ||
        window.location.hostname.includes('vercel.app')) {
      return 'https://handicraft-website.onrender.com/api';
    }
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  };

  const getImageUrl = (image) => {
    if (!image) return '/images/placeholder.jpg';
    if (image.startsWith('http')) return image;
    return `${getApiUrl()}/uploads/${image}`;
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-empty">
            <div className="empty-icon">
              <FiShoppingBag />
            </div>
            <h2 className="empty-title">Your cart is empty</h2>
            <p className="empty-description">Add some beautiful handicrafts to your cart!</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              <FiArrowLeft className="btn-icon" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1 className="cart-title">Shopping Cart</h1>
          <p className="cart-subtitle">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
        </div>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="cart-item-image">
                  <img 
                    src={getImageUrl(item.image)} 
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
                
                <div className="cart-item-details">
                  <div className="cart-item-header">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <button 
                      className="cart-item-remove"
                      onClick={() => removeFromCart(item._id)}
                      aria-label="Remove item"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  
                  <p className="cart-item-category">{item.category || 'Handicraft'}</p>
                  
                  <div className="cart-item-price">₹{item.price.toLocaleString()}</div>
                  
                  <div className="cart-item-quantity">
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <FiMinus />
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      disabled={item.stock && item.quantity >= item.stock}
                    >
                      <FiPlus />
                    </button>
                  </div>
                  
                  <div className="cart-item-total">
                    Total: ₹{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="cart-summary">
            <div className="summary-card">
              <h3 className="summary-title">Order Summary</h3>
              
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">₹{subtotal.toLocaleString()}</span>
              </div>
              
              <div className="summary-row">
                <span className="summary-label">Shipping</span>
                <span className="summary-value">
                  {shipping === 0 ? (
                    <span className="free-shipping">
                      <FiCheck className="free-icon" />
                      Free
                    </span>
                  ) : (
                    `₹${shipping}`
                  )}
                </span>
              </div>
              
              {shipping > 0 && (
                <div className="shipping-note">
                  Add ₹{(999 - subtotal).toLocaleString()} more for free shipping!
                </div>
              )}
              
              <div className="summary-divider"></div>
              
              <div className="summary-row summary-total">
                <span className="summary-label total-label">Total</span>
                <span className="summary-value total-value">₹{total.toLocaleString()}</span>
              </div>
              
              <Link to="/checkout" className="btn btn-primary btn-lg checkout-btn">
                Proceed to Checkout
              </Link>
              
              <button 
                className="btn btn-outline btn-lg clear-cart-btn"
                onClick={clearCart}
              >
                Clear Cart
              </button>
              
              <div className="continue-shopping">
                <Link to="/products">
                  <FiArrowLeft className="continue-icon" />
                  Continue Shopping
                </Link>
              </div>
            </div>
            
            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="trust-badge">
                <span className="badge-icon">✓</span>
                <span className="badge-text">Secure Checkout</span>
              </div>
              <div className="trust-badge">
                <span className="badge-icon">✓</span>
                <span className="badge-text">Free Returns</span>
              </div>
              <div className="trust-badge">
                <span className="badge-icon">✓</span>
                <span className="badge-text">Authentic Products</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
