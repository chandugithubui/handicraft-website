import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiMapPin,
  FiPhone,
  FiUser,
  FiSearch,
  FiAlertCircle,
  FiShoppingBag,
  FiMail,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { http } from '../services/apiClient';
import './TrackOrder.css';

interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface Order {
  _id: string;
  user?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
}

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, token } = useAuth();
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam && isAuthenticated && token) {
      setOrderId(orderIdParam);
      // Auto-track when orderId is in URL
      handleTrackOrder(orderIdParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isAuthenticated, token]);

  const handleTrackOrder = async (orderIdToTrack?: string) => {
    let trackId = (orderIdToTrack || orderId).trim();

    // Remove leading # if present
    if (trackId.startsWith('#')) {
      trackId = trackId.substring(1);
    }

    if (!trackId) {
      setError('Please enter an order ID');
      return;
    }

    // Validate MongoDB ObjectID format (24 hex characters)
    if (!/^[0-9a-fA-F]{24}$/.test(trackId)) {
      setError(
        'Invalid order ID format. Please enter the complete 24-character order ID (e.g., 507f1f77bcf86cd799439011)'
      );
      return;
    }

    if (!isAuthenticated) {
      setError('Please sign in to track your order');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await http.get<Order>(`/orders/${trackId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrder(response);
    } catch (err: any) {
      console.error('Track order error:', err);
      if (err.status === 404) {
        setError('Order not found. Please check your order ID and try again.');
      } else if (err.status === 403) {
        setError('You do not have permission to view this order.');
      } else if (err.status === 401) {
        setError('Please sign in to track your order.');
      } else {
        setError(err.message || 'Failed to retrieve order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrackOrder();
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return '/images/HandcraftedWoodenBowl.webp';
    if (imagePath.startsWith('http')) return imagePath;
    let fixedPath = imagePath
      .replace('.jpg.jpg', '.jpg')
      .replace('.jpeg.jpeg', '.jpeg');
    if (fixedPath.startsWith('/images/')) return fixedPath;
    if (fixedPath.startsWith('/')) return fixedPath;
    return `/images/${fixedPath}`;
  };

  const getStatusInfo = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    const statusMap = {
      pending: { icon: <FiClock />, color: 'pending', label: 'Pending' },
      processing: { icon: <FiPackage />, color: 'processing', label: 'Processing' },
      shipped: { icon: <FiTruck />, color: 'shipped', label: 'Shipped' },
      delivered: { icon: <FiCheckCircle />, color: 'delivered', label: 'Delivered' },
      cancelled: { icon: <FiXCircle />, color: 'cancelled', label: 'Cancelled' },
    };
    return (
      statusMap[normalizedStatus] || {
        icon: <FiClock />,
        color: 'pending',
        label: status,
      }
    );
  };

  const getPaymentStatusInfo = (paymentStatus: string, paymentMethod: string) => {
    if (paymentMethod === 'COD') {
      return { label: 'Cash on Delivery', color: 'pending' };
    }
    const statusMap = {
      paid: { label: 'Paid', color: 'success' },
      pending: { label: 'Payment Pending', color: 'pending' },
      failed: { label: 'Payment Failed', color: 'error' },
    };
    return (
      statusMap[paymentStatus] || { label: paymentStatus, color: 'pending' }
    );
  };

  const getOrderStatusSteps = (currentStatus: string, isCancelled: boolean) => {
    const normalizedStatus = currentStatus.toLowerCase();

    if (isCancelled) {
      return [
        {
          status: 'pending',
          label: 'Order Placed',
          icon: <FiClock />,
          completed: true,
        },
        {
          status: 'cancelled',
          label: 'Cancelled',
          icon: <FiXCircle />,
          completed: true,
          isCancelled: true,
        },
      ];
    }

    const steps = [
      {
        status: 'pending',
        label: 'Order Placed',
        icon: <FiClock />,
        completed: false,
      },
      {
        status: 'processing',
        label: 'Processing',
        icon: <FiPackage />,
        completed: false,
      },
      {
        status: 'shipped',
        label: 'Shipped',
        icon: <FiTruck />,
        completed: false,
      },
      {
        status: 'delivered',
        label: 'Delivered',
        icon: <FiCheckCircle />,
        completed: false,
      },
    ];

    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(normalizedStatus);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="track-order-page">
      {/* Hero Section */}
      <section className="track-hero">
        <div className="track-hero-decoration track-hero-decoration-one" />
        <div className="track-hero-decoration track-hero-decoration-two" />

        <div className="track-hero-inner">
          <div className="track-hero-content">
            <span className="track-eyebrow">✦ HANDICRAFT HUB · ORDER TRACKING</span>

            <h1>
              Track Your <em>Order</em>
            </h1>

            <p>
              Enter your order ID below to view real-time status updates and delivery information for your handcrafted treasures.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="track-container">
        {/* Tracking Form */}
        {!order && (
          <div className="track-form-section">
            <div className="track-form-card">
              <div className="track-form-icon">
                <FiSearch />
              </div>
              <h2 className="track-form-title">Find Your Order</h2>
              <p className="track-form-subtitle">
                Enter your order ID to track your shipment
              </p>

              <form onSubmit={handleSubmit} className="track-form">
                <div className="form-group">
                  <label htmlFor="orderId" className="form-label">
                    Order ID
                  </label>
                  <input
                    id="orderId"
                    type="text"
                    value={orderId}
                    onChange={(e) => {
                      setOrderId(e.target.value);
                      setError('');
                    }}
                    className="form-input"
                    placeholder="Enter your order ID (e.g., 507f1f77bcf86cd799439011)"
                    required
                  />
                  <p className="form-hint">
                    Enter the complete 24-character order ID from your order confirmation email or My Orders page (e.g., 507f1f77bcf86cd799439011). You can include the # symbol or omit it.
                  </p>
                </div>

                {!isAuthenticated && (
                  <div className="auth-notice">
                    <FiAlertCircle />
                    <div>
                      <p className="auth-notice-title">Sign In Required</p>
                      <p className="auth-notice-text">
                        Please{' '}
                        <Link to="/login?redirect=/track-order">sign in</Link>{' '}
                        to track your order.
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="error-message" role="alert">
                    <FiAlertCircle />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary track-submit-btn"
                  disabled={loading || !isAuthenticated}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner-small"></span>
                      Tracking...
                    </>
                  ) : (
                    <>
                      <FiSearch />
                      Track Order
                    </>
                  )}
                </button>
              </form>

              <div className="track-help-links">
                <Link to="/user/dashboard?tab=orders" className="track-help-link">
                  <FiShoppingBag /> View All Orders
                </Link>
                <Link to="/contact" className="track-help-link">
                  <FiMail /> Contact Support
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="track-result-section">
            {/* Order Header */}
            <div className="track-result-header">
              <div className="track-result-header-content">
                <div className="track-result-badge">
                  {getStatusInfo(order.orderStatus).icon}
                  <span>{getStatusInfo(order.orderStatus).label}</span>
                </div>
                <h2 className="track-result-title">Order #{order._id.slice(-8)}</h2>
                <p className="track-result-date">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <button
                onClick={() => {
                  setOrder(null);
                  setOrderId('');
                }}
                className="btn btn-outline track-new-btn"
              >
                Track Another Order
              </button>
            </div>

            {/* Status Timeline */}
            <div className="track-timeline-card">
              <h3 className="track-section-title">Order Progress</h3>
              <div className="track-timeline">
                {getOrderStatusSteps(
                  order.orderStatus,
                  order.orderStatus.toLowerCase() === 'cancelled'
                ).map((step, index, array) => (
                  <div
                    key={step.status}
                    className={`track-timeline-step ${
                      step.completed ? 'completed' : ''
                    } ${step.isCancelled ? 'cancelled' : ''}`}
                  >
                    <div className="track-timeline-icon">{step.icon}</div>
                    <div className="track-timeline-content">
                      <p className="track-timeline-label">{step.label}</p>
                    </div>
                    {index < array.length - 1 && (
                      <div className="track-timeline-line"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Info Grid */}
            <div className="track-info-grid">
              {/* Payment Status */}
              <div className="track-info-card">
                <div className="track-info-header">
                  <h3 className="track-info-title">Payment Information</h3>
                </div>
                <div className="track-info-body">
                  <div className="track-info-row">
                    <span className="track-info-label">Payment Method:</span>
                    <span className="track-info-value">
                      {order.paymentMethod === 'COD'
                        ? 'Cash on Delivery'
                        : 'Online Payment'}
                    </span>
                  </div>
                  <div className="track-info-row">
                    <span className="track-info-label">Payment Status:</span>
                    <span
                      className={`track-payment-status ${
                        getPaymentStatusInfo(
                          order.paymentStatus,
                          order.paymentMethod
                        ).color
                      }`}
                    >
                      {
                        getPaymentStatusInfo(
                          order.paymentStatus,
                          order.paymentMethod
                        ).label
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="track-info-card">
                <div className="track-info-header">
                  <FiMapPin />
                  <h3 className="track-info-title">Delivery Address</h3>
                </div>
                <div className="track-info-body">
                  <p className="track-address-name">
                    <FiUser /> {order.shippingAddress.fullName}
                  </p>
                  <p className="track-address-text">
                    {order.shippingAddress.address}
                  </p>
                  <p className="track-address-text">
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p className="track-address-text">
                    {order.shippingAddress.country}
                  </p>
                  <p className="track-address-phone">
                    <FiPhone /> {order.shippingAddress.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="track-items-card">
              <h3 className="track-section-title">Order Items</h3>
              <div className="track-items-list">
                {order.items.map((item, index) => (
                  <div key={index} className="track-item">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="track-item-image"
                    />
                    <div className="track-item-details">
                      <h4 className="track-item-name">{item.name}</h4>
                      <p className="track-item-meta">
                        Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="track-item-price">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="track-summary-card">
              <h3 className="track-section-title">Order Summary</h3>
              <div className="track-summary-rows">
                <div className="track-summary-row">
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="track-summary-row">
                  <span>Shipping:</span>
                  <span>
                    {order.shippingAmount === 0
                      ? 'Free'
                      : `₹${order.shippingAmount.toFixed(2)}`}
                  </span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="track-summary-row discount">
                    <span>
                      Discount{order.couponCode ? ` (${order.couponCode})` : ''}:
                    </span>
                    <span>-₹{order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="track-summary-row total">
                  <span>Total Amount:</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Links */}
            <div className="track-actions">
              <Link to="/user/dashboard?tab=orders" className="btn btn-outline">
                <FiShoppingBag /> View All Orders
              </Link>
              <Link to="/contact" className="btn btn-outline">
                <FiMail /> Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
