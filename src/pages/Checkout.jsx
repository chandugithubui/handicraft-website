import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiCreditCard, FiTruck, FiLock } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import RazorpayPaymentForm from '../components/RazorpayPaymentForm';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="auth-required">
            <div className="auth-icon">
              <FiLock />
            </div>
            <h2 className="auth-title">Authentication Required</h2>
            <p className="auth-description">Please login to proceed with checkout</p>
            <div className="auth-actions">
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/cart" className="btn btn-outline">Back to Cart</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city ||
        !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.phone) {
      setError('Please fill in all shipping fields');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shippingAddress,
        paymentMethod,
        totalAmount: getCartTotal()
      };

      await createOrder(orderData, token);
      clearCart();
      navigate('/order-success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async (paymentResponse) => {
    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shippingAddress,
        paymentMethod: 'Razorpay',
        totalAmount: getCartTotal(),
        paymentId: paymentResponse.razorpay_payment_id
      };

      await createOrder(orderData, token);
      clearCart();
      navigate('/order-success');
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-cart">
            <h2 className="empty-title">Your cart is empty</h2>
            <Link to="/products" className="btn btn-primary">Browse Products</Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <Link to="/cart" className="back-link">
            <FiArrowLeft className="back-icon" />
            Back to Cart
          </Link>
          <h1 className="checkout-title">Checkout</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="checkout-layout">
          {/* Checkout Form */}
          <div className="checkout-form">
            {/* Shipping Information */}
            <div className="form-section">
              <div className="section-header">
                <FiMapPin className="section-icon" />
                <h2 className="section-title">Shipping Information</h2>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleChange}
                      className="form-input"
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleChange}
                      className="form-input"
                      required
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleChange}
                    className="form-input"
                    required
                    placeholder="Street address, apartment, etc."
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleChange}
                      className="form-input"
                      required
                      placeholder="Enter your city"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleChange}
                      className="form-input"
                      required
                      placeholder="Enter your state"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Postal Code *</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleChange}
                      className="form-input"
                      required
                      placeholder="Enter postal code"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleChange}
                      className="form-input"
                      disabled
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="form-section payment-section">
                  <div className="section-header">
                    <FiCreditCard className="section-icon" />
                    <h2 className="section-title">Payment Method</h2>
                  </div>
                  
                  <div className="payment-options">
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-content">
                        <span className="payment-label">Cash on Delivery (COD)</span>
                        <span className="payment-desc">Pay when you receive your order</span>
                      </div>
                    </label>
                    
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Razorpay"
                        checked={paymentMethod === 'Razorpay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-content">
                        <span className="payment-label">Razorpay</span>
                        <span className="payment-desc">Cards, UPI, Net Banking</span>
                      </div>
                    </label>
                  </div>

                  {paymentMethod === 'Razorpay' && (
                    <div className="razorpay-section">
                      <RazorpayPaymentForm
                        amount={total}
                        onSuccess={handleRazorpayPayment}
                        onError={(err) => setError(err)}
                      />
                    </div>
                  )}

                  {paymentMethod === 'COD' && (
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg place-order-btn"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Place Order'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary">
            <div className="summary-card">
              <h3 className="summary-title">Order Summary</h3>
              
              <div className="summary-items">
                {cartItems.map((item) => (
                  <div key={item._id} className="summary-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">x {item.quantity}</span>
                    </div>
                    <span className="item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">₹{subtotal.toLocaleString()}</span>
              </div>
              
              <div className="summary-row">
                <span className="summary-label">Shipping</span>
                <span className="summary-value">
                  {shipping === 0 ? (
                    <span className="free-shipping">
                      <FiTruck className="free-icon" />
                      Free
                    </span>
                  ) : (
                    `₹${shipping}`
                  )}
                </span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row summary-total">
                <span className="summary-label total-label">Total</span>
                <span className="summary-value total-value">₹{total.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="trust-badge">
                <span className="badge-icon">🔒</span>
                <span className="badge-text">Secure Payment</span>
              </div>
              <div className="trust-badge">
                <span className="badge-icon">✓</span>
                <span className="badge-text">Authentic Products</span>
              </div>
              <div className="trust-badge">
                <span className="badge-icon">🚚</span>
                <span className="badge-text">Safe Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
