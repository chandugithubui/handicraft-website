import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBox, FiShoppingBag, FiEye, FiPackage, FiClock, FiCheckCircle, FiXCircle, FiTruck, FiChevronUp } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useMyOrders } from '../hooks/api';
import './Orders.css';

const Orders = () => {
  const { isAuthenticated, token } = useAuth();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const {
    data: orders = [],
    isLoading: loading,
    isError,
    error: queryError,
  } = useMyOrders(token, isAuthenticated);

  const error = isError ? (queryError?.message || 'Failed to fetch orders') : '';

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/HandcraftedWoodenBowl.webp';
    if (imagePath.startsWith('http')) return imagePath;

    // Handle double extensions first (before checking /images/)
    let fixedPath = imagePath;
    if (imagePath.endsWith('.jpg.jpg')) {
      fixedPath = imagePath.replace('.jpg.jpg', '.jpg');
    } else if (imagePath.endsWith('.jpeg.jpeg')) {
      fixedPath = imagePath.replace('.jpeg.jpeg', '.jpeg');
    }

    // If path already starts with /images/, return the fixed path
    if (fixedPath.startsWith('/images/')) {
      return fixedPath;
    }

    // Otherwise, prepend /images/
    return `/images/${fixedPath}`;
  };

  const getStatusInfo = (status: string) => {
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    const statusMap = {
      'Pending': { icon: <FiClock />, color: 'pending', label: 'Pending' },
      'Processing': { icon: <FiPackage />, color: 'processing', label: 'Processing' },
      'Shipped': { icon: <FiTruck />, color: 'shipped', label: 'Shipped' },
      'Delivered': { icon: <FiCheckCircle />, color: 'delivered', label: 'Delivered' },
      'Cancelled': { icon: <FiXCircle />, color: 'cancelled', label: 'Cancelled' }
    };
    return statusMap[normalizedStatus] || { icon: <FiClock />, color: 'pending', label: normalizedStatus };
  };

  const getPaymentStatusInfo = (paymentStatus: string, paymentMethod: string) => {
    if (paymentMethod === 'COD') {
      return { label: 'Cash on Delivery', color: 'pending' };
    }
    const statusMap = {
      'paid': { label: 'Paid', color: 'success' },
      'pending': { label: 'Payment Pending', color: 'pending' },
      'failed': { label: 'Payment Failed', color: 'error' }
    };
    return statusMap[paymentStatus] || { label: paymentStatus, color: 'pending' };
  };

  const getOrderStatusSteps = (currentStatus: string, isCancelled: boolean) => {
    const normalizedStatus = currentStatus.toLowerCase();

    if (isCancelled) {
      return [
        { status: 'pending', label: 'Order Placed', icon: <FiClock />, completed: true },
        { status: 'cancelled', label: 'Cancelled', icon: <FiXCircle />, completed: true, isCancelled: true }
      ];
    }

    const steps = [
      { status: 'pending', label: 'Order Placed', icon: <FiClock />, completed: false },
      { status: 'processing', label: 'Processing', icon: <FiPackage />, completed: false },
      { status: 'shipped', label: 'Shipped', icon: <FiTruck />, completed: false },
      { status: 'delivered', label: 'Delivered', icon: <FiCheckCircle />, completed: false }
    ];

    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(normalizedStatus);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex
    }));
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="orders-loading">
            <div className="loading-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="auth-required">
            <div className="auth-icon">
              <FiBox />
            </div>
            <h2 className="auth-title">Authentication Required</h2>
            <p className="auth-description">Please login to view your orders</p>
            <div className="auth-actions">
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/" className="btn btn-outline">Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <div className="header-left">
            <h1 className="orders-title">
              <FiBox className="title-icon" />
              My Orders
            </h1>
            <p className="orders-subtitle">Track and manage your orders</p>
          </div>
          <Link to="/products" className="btn btn-outline continue-shopping-btn">
            <FiShoppingBag className="btn-icon" />
            Continue Shopping
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">
              <FiPackage />
            </div>
            <h2 className="empty-title">No orders yet</h2>
            <p className="empty-description">You haven't placed any orders yet. Start exploring our beautiful handicrafts!</p>
            <Link to="/products" className="btn btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order: any) => {
              const statusInfo = getStatusInfo(order.orderStatus);
              const paymentInfo = getPaymentStatusInfo(order.paymentStatus, order.paymentMethod);
              const isCancelled = order.orderStatus?.toLowerCase() === 'cancelled';
              const statusSteps = getOrderStatusSteps(order.orderStatus, isCancelled);

              return (
                <div key={order._id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-info">
                      <span className="order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className={`order-status status-${statusInfo.color}`}>
                      {statusInfo.icon}
                      <span>{statusInfo.label}</span>
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items.slice(0, 3).map((item, index) => {
                      console.log('Order item:', item);
                      return (
                        <div key={index} className="order-item-preview">
                          <div className="item-image">
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/HandcraftedWoodenBowl.webp';
                              }}
                              loading="lazy"
                            />
                          </div>
                          <div className="item-details">
                            <span className="item-name">{item.name}</span>
                            <span className="item-qty">Qty: {item.quantity || 1}</span>
                            <span className="item-price">₹{(item.price || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                    {order.items.length > 3 && (
                      <div className="more-items">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>

                  {expandedOrder === order._id && (
                    <div className="order-details-expanded">
                      {/* Order Status Timeline */}
                      <div className="order-status-timeline">
                        <h4>Order Status</h4>
                        <div className="status-timeline">
                          {statusSteps.map((step, index) => (
                            <div key={step.status} className={`timeline-step ${step.completed ? 'completed' : ''} ${step.isCancelled ? 'cancelled' : ''}`}>
                              <div className="timeline-icon">
                                {step.icon}
                              </div>
                              <div className="timeline-content">
                                <span className="timeline-label">{step.label}</span>
                              </div>
                              {index < statusSteps.length - 1 && (
                                <div className={`timeline-connector ${step.completed ? 'completed' : ''}`}></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="order-details-items">
                        <h4>Order Items</h4>
                        {order.items.map((item, index) => (
                          <div key={index} className="order-detail-item">
                            <div className="detail-item-image">
                              <img
                                src={getImageUrl(item.image)}
                                alt={item.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/HandcraftedWoodenBowl.webp';
                                }}
                                loading="lazy"
                              />
                            </div>
                            <div className="detail-item-info">
                              <span className="detail-item-name">{item.name}</span>
                              <span className="detail-item-qty">Quantity: {item.quantity || 1}</span>
                              <span className="detail-item-price">₹{(item.price || 0).toLocaleString()} each</span>
                            </div>
                            <div className="detail-item-total">
                              ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-details-grid">
                        <div className="order-details-shipping">
                          <h4>Shipping Address</h4>
                          <p>{order.shippingAddress?.fullName}</p>
                          <p>{order.shippingAddress?.address}</p>
                          <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</p>
                          <p>Phone: {order.shippingAddress?.phone}</p>
                        </div>

                        <div className="order-details-payment">
                          <h4>Payment Information</h4>
                          <div className="payment-info-row">
                            <span className="payment-info-label">Payment Method:</span>
                            <span className="payment-info-value">{order.paymentMethod || 'N/A'}</span>
                          </div>
                          <div className="payment-info-row">
                            <span className="payment-info-label">Payment Status:</span>
                            <span className={`payment-status payment-status-${paymentInfo.color}`}>
                              {paymentInfo.label}
                            </span>
                          </div>
                          {order.paymentId && (
                            <div className="payment-info-row">
                              <span className="payment-info-label">Payment ID:</span>
                              <span className="payment-info-value payment-id">{order.paymentId}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="order-summary">
                        <h4>Order Summary</h4>
                        <div className="summary-row">
                          <span>Subtotal:</span>
                          <span>₹{(order.subtotal || 0).toLocaleString()}</span>
                        </div>
                        {order.shippingAmount > 0 && (
                          <div className="summary-row">
                            <span>Shipping:</span>
                            <span>₹{(order.shippingAmount || 0).toLocaleString()}</span>
                          </div>
                        )}
                        {order.discountAmount > 0 && (
                          <div className="summary-row discount">
                            <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}:</span>
                            <span>-₹{(order.discountAmount || 0).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="summary-row total">
                          <span>Total Amount:</span>
                          <span>₹{(order.totalAmount || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="order-card-footer">
                    <div className="order-total">
                      <span className="total-label">Total:</span>
                      <span className="total-amount">₹{order.totalAmount ? order.totalAmount.toLocaleString() : '0'}</span>
                    </div>
                    <div className="order-payment">
                      <span className="payment-label">{order.paymentMethod || 'N/A'}</span>
                    </div>
                    <button
                      className="btn btn-outline view-order-btn"
                      onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                    >
                      {expandedOrder === order._id ? (
                        <>
                          <FiChevronUp className="btn-icon" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <FiEye className="btn-icon" />
                          View Details
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
