import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiShoppingCart, FiBox, FiDollarSign, FiLogOut, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAdminStats, getAllOrders, getAllUsers, getAllContacts, updateOrderStatus } from '../services/adminService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, ordersData, usersData, contactsData] = await Promise.all([
        getAdminStats(token),
        getAllOrders(token),
        getAllUsers(token),
        getAllContacts(token)
      ]);
      setStats(statsData);
      setOrders(ordersData);
      setUsers(usersData);
      setContacts(contactsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, user, navigate, fetchDashboardData]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, token);
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, orderStatus: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': { color: 'pending', label: 'Pending' },
      'processing': { color: 'processing', label: 'Processing' },
      'shipped': { color: 'shipped', label: 'Shipped' },
      'delivered': { color: 'delivered', label: 'Delivered' },
      'cancelled': { color: 'cancelled', label: 'Cancelled' }
    };
    return statusMap[status] || { color: 'pending', label: status };
  };

  const { logout } = useAuth();

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">Manage your store efficiently</p>
          </div>
          <div className="header-actions">
            <button onClick={fetchDashboardData} className="btn btn-outline refresh-btn">
              <FiRefreshCw className="btn-icon" />
              Refresh
            </button>
            <button onClick={() => logout()} className="btn btn-outline logout-btn">
              <FiLogOut className="btn-icon" />
              Logout
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-users">
            <div className="stat-icon">
              <FiUsers />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats?.totalUsers || 0}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>
          <div className="stat-card stat-orders">
            <div className="stat-icon">
              <FiShoppingCart />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats?.totalOrders || 0}</div>
              <div className="stat-label">Total Orders</div>
            </div>
          </div>
          <div className="stat-card stat-products">
            <div className="stat-icon">
              <FiBox />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats?.totalProducts || 0}</div>
              <div className="stat-label">Total Products</div>
            </div>
          </div>
          <div className="stat-card stat-revenue">
            <div className="stat-icon">
              <FiDollarSign />
            </div>
            <div className="stat-content">
              <div className="stat-number">₹{stats?.totalRevenue?.toLocaleString() || 0}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            Contacts
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'orders' && (
            <div className="content-card">
              <h3 className="content-title">Recent Orders</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>#{order._id.slice(-6)}</td>
                        <td>{order.user?.name || 'N/A'}</td>
                        <td>₹{order.totalAmount}</td>
                        <td>
                          <span className={`status-badge status-${getStatusInfo(order.orderStatus).color}`}>
                            {getStatusInfo(order.orderStatus).label}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <select
                            className="status-select"
                            value={order.orderStatus}
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="content-card">
              <h3 className="content-title">Registered Users</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="content-card">
              <h3 className="content-title">Contact Messages</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th width="20%">Name</th>
                      <th width="25%">Email</th>
                      <th width="40%">Message</th>
                      <th width="15%">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="no-data">
                          No contact messages yet
                        </td>
                      </tr>
                    ) : (
                      contacts.map((contact) => (
                        <tr key={contact._id}>
                          <td className="contact-name" data-label="Name">
                            <div className="contact-avatar">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{contact.name}</span>
                          </td>
                          <td className="contact-email" data-label="Email">{contact.email}</td>
                          <td className="message-cell" data-label="Message">
                            <div className="message-content">
                              {contact.message}
                            </div>
                          </td>
                          <td className="contact-date" data-label="Date">
                            {new Date(contact.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
