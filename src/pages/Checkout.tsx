import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiCreditCard, FiTruck, FiLock } from 'react-icons/fi';
import { useQueryClient } from '@tanstack/react-query';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { validateCoupon } from '../services/couponService';
import { orderKeys } from '../hooks/api/useOrders';
import RazorpayPaymentForm from '../components/RazorpayPaymentForm';
import Autocomplete from '../components/Autocomplete';
import { getStateNames, searchCities } from '../data/indianLocations';
import './Checkout.css';

const Checkout = () => {
  const queryClient = useQueryClient();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { token, isAuthenticated, user } = useAuth();
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State and City autocomplete
  const [stateSuggestions] = useState<string[]>(getStateNames());
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);

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
              <Link to="/login" state={{ from: '/checkout' }} className="btn btn-primary">Login</Link>
              <Link to="/cart" className="btn btn-outline">Back to Cart</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress({
      ...shippingAddress,
      [name]: value
    });

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleStateChange = (value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      state: value,
      // Clear city if state changes and city is not valid for new state
      city: ''
    }));

    // Update city suggestions for the new state
    setCitySuggestions(searchCities(value, ''));

    // Clear state field error
    if (fieldErrors.state) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated.state;
        return updated;
      });
    }

    // Clear city field error too since we're resetting it
    if (fieldErrors.city) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated.city;
        return updated;
      });
    }
  };

  const handleCityChange = (value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      city: value
    }));

    // Clear city field error
    if (fieldErrors.city) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated.city;
        return updated;
      });
    }
  };

  const handleCityFocus = () => {
    if (!shippingAddress.state) {
      setFieldErrors(prev => ({
        ...prev,
        city: 'Please select a state first'
      }));
    }
  };
  const handleApplyCoupon = async () => {
    setCouponMessage('');
    setCouponError('');

    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      setCouponLoading(true);

      const subtotal = getCartTotal();

      const result = await validateCoupon(
        couponCode.trim(),
        subtotal,
        token
      );

      setAppliedCoupon(result.coupon);
      setDiscountAmount(result.discountAmount);
      setCouponCode(result.coupon.code);

      setCouponMessage(
        `${result.coupon.code} applied successfully`
      );
    } catch (err) {
      setAppliedCoupon(null);
      setDiscountAmount(0);

      setCouponError(
        err.response?.data?.message ||
        'Unable to apply coupon'
      );
    } finally {
      setCouponLoading(false);
    }
  };
  const validateShippingForm = () => {
    const errors: Record<string, string> = {};

    if (!shippingAddress.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!shippingAddress.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(shippingAddress.phone.trim())) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number';
    }

    if (!shippingAddress.address.trim()) {
      errors.address = 'Address is required';
    } else if (shippingAddress.address.trim().length < 10) {
      errors.address = 'Please enter a complete address';
    }

    if (!shippingAddress.city.trim()) {
      errors.city = 'City is required';
    }

    if (!shippingAddress.state.trim()) {
      errors.state = 'State is required';
    } else {
      // Validate state is from the Indian states/UTs list
      const validStates = getStateNames();
      const isValidState = validStates.some(
        state => state.toLowerCase() === shippingAddress.state.trim().toLowerCase()
      );
      if (!isValidState) {
        errors.state = 'Please select a valid Indian state or Union Territory';
      }
    }

    if (!shippingAddress.postalCode.trim()) {
      errors.postalCode = 'Postal code is required';
    } else if (!/^\d{6}$/.test(shippingAddress.postalCode.trim())) {
      errors.postalCode = 'Please enter a valid 6-digit PIN code';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError('Please fix the errors in the form');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return; // Prevent double submission
    }

    if (!validateShippingForm()) {
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity
        })),
        shippingAddress,
        paymentMethod: 'COD',
        couponCode: appliedCoupon ? appliedCoupon.code : null
      };

      const res = await createOrder(orderData, token);
      queryClient.invalidateQueries({ queryKey: orderKeys.myOrders() });
      clearCart();
      navigate('/order-success', { state: { order: res?.order || res } });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to place order');
      setIsSubmitting(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpaySuccess = (createdOrder: any) => {
    queryClient.invalidateQueries({ queryKey: orderKeys.myOrders() });
    clearCart();
    navigate('/order-success', { state: { order: createdOrder } });
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-cart">
            <h2 className="empty-title">
              Your cart is empty
            </h2>

            <Link
              to="/products"
              className="btn btn-primary"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // KEEP THESE HERE
  const subtotal = getCartTotal();
  const shipping = subtotal >= 999 ? 0 : 99;

  const total = Math.max(
    0,
    subtotal + shipping - discountAmount
  );

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
                      className={`form-input ${fieldErrors.fullName ? 'error' : ''}`}
                      required
                      placeholder="Enter your full name"
                    />
                    {fieldErrors.fullName && (
                      <span className="field-error">{fieldErrors.fullName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleChange}
                      className={`form-input ${fieldErrors.phone ? 'error' : ''}`}
                      required
                      placeholder="10-digit mobile number"
                      maxLength={10}
                    />
                    {fieldErrors.phone && (
                      <span className="field-error">{fieldErrors.phone}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleChange}
                    className={`form-input ${fieldErrors.address ? 'error' : ''}`}
                    required
                    placeholder="Street address, apartment, etc."
                  />
                  {fieldErrors.address && (
                    <span className="field-error">{fieldErrors.address}</span>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">State / Union Territory *</label>
                    <Autocomplete
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleStateChange}
                      suggestions={stateSuggestions}
                      placeholder="Select or type your state"
                      required
                      hasError={Boolean(fieldErrors.state)}
                    />
                    {fieldErrors.state && (
                      <span className="field-error">{fieldErrors.state}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <Autocomplete
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleCityChange}
                      suggestions={citySuggestions}
                      placeholder={shippingAddress.state ? "Select or type your city" : "Select state first"}
                      required
                      disabled={!shippingAddress.state}
                      hasError={Boolean(fieldErrors.city)}
                      onFocus={handleCityFocus}
                    />
                    {fieldErrors.city && (
                      <span className="field-error">{fieldErrors.city}</span>
                    )}
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
                      className={`form-input ${fieldErrors.postalCode ? 'error' : ''}`}
                      required
                      placeholder="6-digit PIN code"
                      maxLength={6}
                    />
                    {fieldErrors.postalCode && (
                      <span className="field-error">{fieldErrors.postalCode}</span>
                    )}
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
                        cartItems={cartItems}
                        shippingAddress={shippingAddress}
                        couponCode={appliedCoupon ? appliedCoupon.code : null}
                        user={user}
                        validateForm={validateShippingForm}
                        onSuccess={handleRazorpaySuccess}
                        onError={(err) => setError(err)}
                        loading={loading}
                      />
                    </div>
                  )}

                  {paymentMethod === 'COD' && (
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg place-order-btn"
                      disabled={loading || isSubmitting}
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
              <div className="coupon-section">
                <label className="coupon-label">
                  Have a coupon?
                </label>

                <div className="coupon-input-row">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());

                      if (appliedCoupon) {
                        setAppliedCoupon(null);
                        setDiscountAmount(0);
                        setCouponMessage('');
                      }

                      setCouponError('');
                    }}
                    placeholder="Enter coupon code"
                    className="coupon-input"
                    disabled={couponLoading}
                  />

                  <button
                    type="button"
                    className="coupon-apply-btn"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                  >
                    {couponLoading ? 'Applying...' : 'Apply'}
                  </button>
                </div>

                {couponMessage && (
                  <div className="coupon-success">
                    ✓ {couponMessage}
                  </div>
                )}

                {couponError && (
                  <div className="coupon-error">
                    {couponError}
                  </div>
                )}
              </div>

              {appliedCoupon && discountAmount > 0 && (
                <div className="summary-row discount-row">
                  <span className="summary-label">
                    Discount ({appliedCoupon.code})
                  </span>

                  <span className="summary-value discount-value">
                    -₹{discountAmount.toLocaleString()}
                  </span>
                </div>
              )}
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
