import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBox, FiShoppingBag, FiEye, FiPackage, FiClock, FiCheckCircle, FiXCircle, FiTruck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Orders.css';

const Orders = () => {
  const { isAuthenticated, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setError('Please login to view your orders');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const getApiUrl = () => {
          if (window.location.hostname === 'localhost' || 
              window.location.hostname === '127.0.0.1') {
            return 'http://localhost:5000/api';
          }
          if (window.location.hostname === 'handicraft-website-fyao.vercel.app' ||
              window.location.hostname.includes('vercel.app')) {
            return 'https://handicraft-website.onrender.com/api';
          }
          return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        };
        const API_URL = getApiUrl();
        const response = await axios.get(`${API_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data);
      } catch (err) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, token]);

  const getStatusInfo = (status) => {
    const statusMap = {
      'Pending': { icon: <FiClock />, color: 'pending', label: 'Pending' },
      'Processing': { icon: <FiPackage />, color: 'processing', label: 'Processing' },
      'Shipped': { icon: <FiTruck />, color: 'shipped', label: 'Shipped' },
      'Delivered': { icon: <FiCheckCircle />, color: 'delivered', label: 'Delivered' },
      'Cancelled': { icon: <FiXCircle />, color: 'cancelled', label: 'Cancelled' }
    };
    return statusMap[status] || { icon: <FiClock />, color: 'pending', label: status };
  };

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
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.orderStatus);
              return (
                <div key={order._id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-info">
                      <span className="order-id">#{order._id.slice(-8)}</span>
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
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="order-item-preview">
                        <div className="item-image">
                          <img 
                            src={item.image ? `${getApiUrl()}/uploads/${item.image}` : '/images/placeholder.jpg'}
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = '/images/placeholder.jpg';
                            }}
                          />
                        </div>
                        <div className="item-details">
                          <span className="item-name">{item.name}</span>
                          <span className="item-qty">Qty: {item.quantity}</span>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="more-items">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>

                  <div className="order-card-footer">
                    <div className="order-total">
                      <span className="total-label">Total:</span>
                      <span className="total-amount">₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="order-payment">
                      <span className="payment-label">{order.paymentMethod}</span>
                    </div>
                    <button className="btn btn-outline view-order-btn">
                      <FiEye className="btn-icon" />
                      View Details
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
