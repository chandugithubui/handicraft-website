import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiShoppingCart, FiBox, FiDollarSign, FiLogOut, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAdminStats, getAllOrders, getAllUsers, getAllContacts, updateOrderStatus,
  getAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct, uploadProductImage
} from '../services/adminService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, isAuthenticated, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  // ── Products tab state ────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = add mode

  const EMPTY_FORM = { name: '', price: '', description: '', category: '', material: '', stock: '', featured: false, imageUrl: '' };
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(''); // '' | 'uploading' | 'success' | 'error'
  const [imagePreview, setImagePreview] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, ordersData, usersData, contactsData, newslettersData, productsData] = await Promise.all([
        getAdminStats(token),
        getAllOrders(token),
        getAllUsers(token),
        getAllContacts(token),
        fetchNewsletters(),
        getAdminProducts(token)
      ]);
      setStats(statsData);
      setOrders(ordersData);
      setUsers(usersData);
      setContacts(contactsData);
      setNewsletters(newslettersData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading) {
      return; // Wait for auth to finish loading
    }

    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [authLoading, isAuthenticated, user, navigate, fetchDashboardData]);

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

  const fetchNewsletters = async () => {
    try {
      const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api/newsletter/subscribers'
        : 'https://handicraft-website.onrender.com/api/newsletter/subscribers';
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.success) {
        return data.subscribers;
      }
      return [];
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      return [];
    }
  };

  const handleUnsubscribe = async (email) => {
    try {
      const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api/newsletter/unsubscribe'
        : 'https://handicraft-website.onrender.com/api/newsletter/unsubscribe';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh the newsletters list
        const updatedNewsletters = await fetchNewsletters();
        setNewsletters(updatedNewsletters);
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
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

  // ── Resolve image URL for display ─────────────────────────────────────────
  // Must be declared before any handler that calls it.
  const resolveImageUrl = (url) => {
    if (!url) return '';
    // Already an absolute URL — use as-is
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Public folder images (/images/...) — served by the React dev/build server
    if (url.startsWith('/images/')) return url;
    // Uploaded files (/uploads/...) — served by the Express backend
    if (url.startsWith('/uploads/')) {
      const backendOrigin =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'http://localhost:5000'
          : 'https://handicraft-website.onrender.com';
      return `${backendOrigin}${url}`;
    }
    // Fallback: return unchanged
    return url;
  };

  // ── Products: refresh only the products list ─────────────────────────────
  const refreshProducts = useCallback(async () => {
    setProductLoading(true);
    try {
      const data = await getAdminProducts(token);
      setProducts(data);
    } catch (err) {
      console.error('Error refreshing products:', err);
    } finally {
      setProductLoading(false);
    }
  }, [token]);

  // ── Open form in Add mode ─────────────────────────────────────────────────
  const openAddForm = () => {
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setUploadStatus('');
    setImagePreview('');
    setShowProductForm(true);
  };

  // ── Open form in Edit mode ────────────────────────────────────────────────
  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      price: product.price ?? '',
      description: product.description || '',
      category: product.category || '',
      material: product.material || '',
      stock: product.stock ?? '',
      featured: product.featured || false,
      imageUrl: product.imageUrl || ''
    });
    setFormError('');
    setUploadStatus('');
    setImagePreview(product.imageUrl ? resolveImageUrl(product.imageUrl) : '');
    setShowProductForm(true);
  };

  // ── Close modal ───────────────────────────────────────────────────────────
  const closeProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setUploadStatus('');
    setImagePreview('');
    setFormSaving(false);
  };

  // ── Form field change ─────────────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // ── Image file selected → upload immediately ──────────────────────────────
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadStatus('uploading');
    setImagePreview('');
    try {
      const result = await uploadProductImage(file, token);
      const rawUrl = result?.imageUrl;
      setFormData(prev => ({ ...prev, imageUrl: rawUrl }));
      setImagePreview(resolveImageUrl(rawUrl));
      setUploadStatus('success');
    } catch (err) {
      console.error('Upload error:', err);
      setUploadStatus('error');
    }
  };

  // ── Submit form (add or edit) ─────────────────────────────────────────────
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Basic client-side validation
    if (!formData.name.trim()) return setFormError('Product name is required.');
    if (!formData.price || isNaN(Number(formData.price))) return setFormError('A valid price is required.');
    if (!formData.description.trim()) return setFormError('Description is required.');
    if (!formData.imageUrl) return setFormError('Please upload an image before saving.');

    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
      description: formData.description.trim(),
      category: formData.category.trim() || 'General',
      material: formData.material.trim(),
      stock: Number(formData.stock) || 0,
      featured: formData.featured,
      imageUrl: formData.imageUrl
    };

    setFormSaving(true);
    try {
      if (editingProduct) {
        await updateAdminProduct(editingProduct._id, payload, token);
      } else {
        await createAdminProduct(payload, token);
      }
      closeProductForm();
      await refreshProducts();
    } catch (err) {
      console.error('Save product error:', err);
      setFormError(err?.response?.data?.message || 'Failed to save product. Please try again.');
    } finally {
      setFormSaving(false);
    }
  };

  // ── Delete product ────────────────────────────────────────────────────────
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product._id);
    try {
      await deleteAdminProduct(product._id, token);
      await refreshProducts();
    } catch (err) {
      console.error('Delete product error:', err);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeletingId(null);
    }
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
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
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
          <button 
            className={`tab-btn ${activeTab === 'newsletters' ? 'active' : ''}`}
            onClick={() => setActiveTab('newsletters')}
          >
            Newsletters
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'products' && (
            <div className="content-card">
              <div className="products-header">
                <h3 className="content-title" style={{ margin: 0 }}>Products</h3>
                <button className="btn btn-primary" onClick={openAddForm}>
                  + Add Product
                </button>
              </div>

              {productLoading ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--color-charcoal-light)' }}>
                  Loading products…
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Featured</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="no-data">No products found.</td>
                        </tr>
                      ) : (
                        products.map((product) => (
                          <tr key={product._id}>
                            <td>
                              {product.imageUrl ? (
                                <img
                                  src={resolveImageUrl(product.imageUrl)}
                                  alt={product.name}
                                  className="product-thumb"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="product-thumb-placeholder">No img</div>
                              )}
                            </td>
                            <td style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-charcoal)' }}>
                              {product.name}
                            </td>
                            <td>₹{product.price?.toLocaleString()}</td>
                            <td>{product.category}</td>
                            <td>{product.stock}</td>
                            <td>
                              <span className={`featured-badge${product.featured ? '' : ' no'}`}>
                                {product.featured ? '★ Yes' : 'No'}
                              </span>
                            </td>
                            <td>
                              <div className="row-actions">
                                <button
                                  className="btn-edit"
                                  onClick={() => openEditForm(product)}
                                  disabled={deletingId === product._id}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn-delete"
                                  onClick={() => handleDeleteProduct(product)}
                                  disabled={deletingId === product._id}
                                >
                                  {deletingId === product._id ? 'Deleting…' : 'Delete'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

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

          {activeTab === 'newsletters' && (
            <div className="content-card">
              <h3 className="content-title">Newsletter Subscribers</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th width="40%">Email</th>
                      <th width="25%">Subscribed Date</th>
                      <th width="20%">Status</th>
                      <th width="15%">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newsletters.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="no-data">
                          No newsletter subscribers yet
                        </td>
                      </tr>
                    ) : (
                      newsletters.map((subscriber) => (
                        <tr key={subscriber._id}>
                          <td className="subscriber-email" data-label="Email">{subscriber.email}</td>
                          <td className="subscriber-date" data-label="Subscribed Date">
                            {new Date(subscriber.subscribedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="subscriber-status" data-label="Status">
                            <span className={`status-badge status-${subscriber.status === 'active' ? 'delivered' : 'cancelled'}`}>
                              {subscriber.status}
                            </span>
                          </td>
                          <td className="subscriber-actions" data-label="Actions">
                            {subscriber.status === 'active' && (
                              <button 
                                className="btn btn-sm btn-outline"
                                onClick={() => handleUnsubscribe(subscriber.email)}
                              >
                                Unsubscribe
                              </button>
                            )}
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

      {/* ── Product Add / Edit Modal ───────────────────────────────────────── */}
      {showProductForm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeProductForm(); }}>
          <div className="product-form-modal">
            <div className="modal-header">
              <h2 className="modal-title">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button className="modal-close-btn" onClick={closeProductForm} aria-label="Close">✕</button>
            </div>

            <form className="product-form" onSubmit={handleProductSubmit} noValidate>
              {/* Name */}
              <div className="form-group">
                <label htmlFor="pf-name">Name *</label>
                <input
                  id="pf-name" type="text" name="name"
                  value={formData.name} onChange={handleFormChange}
                  placeholder="e.g. Pattachitra Wall Art"
                  required
                />
              </div>

              {/* Price + Stock */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pf-price">Price (₹) *</label>
                  <input
                    id="pf-price" type="number" name="price" min="0"
                    value={formData.price} onChange={handleFormChange}
                    placeholder="e.g. 1500"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pf-stock">Stock</label>
                  <input
                    id="pf-stock" type="number" name="stock" min="0"
                    value={formData.stock} onChange={handleFormChange}
                    placeholder="e.g. 10"
                  />
                </div>
              </div>

              {/* Category + Material */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pf-category">Category</label>
                  <input
                    id="pf-category" type="text" name="category"
                    value={formData.category} onChange={handleFormChange}
                    placeholder="e.g. Pattachitra"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pf-material">Material</label>
                  <input
                    id="pf-material" type="text" name="material"
                    value={formData.material} onChange={handleFormChange}
                    placeholder="e.g. Cloth, Wood"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="pf-desc">Description *</label>
                <textarea
                  id="pf-desc" name="description"
                  value={formData.description} onChange={handleFormChange}
                  placeholder="Brief description of the product…"
                  required
                />
              </div>

              {/* Featured */}
              <div className="form-group checkbox-group">
                <input
                  id="pf-featured" type="checkbox" name="featured"
                  checked={formData.featured} onChange={handleFormChange}
                />
                <label htmlFor="pf-featured">Mark as Featured (shows in Best Sellers)</label>
              </div>

              {/* Image upload */}
              <div className="form-group">
                <label>Product Image *</label>
                <div className="upload-area">
                  <input
                    type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    disabled={uploadStatus === 'uploading'}
                  />
                  {uploadStatus === 'uploading' && (
                    <span className="upload-status uploading">Uploading…</span>
                  )}
                  {uploadStatus === 'success' && (
                    <span className="upload-status success">✓ Image uploaded</span>
                  )}
                  {uploadStatus === 'error' && (
                    <span className="upload-status error">Upload failed — try again</span>
                  )}
                  {imagePreview && imagePreview.length > 0 && (
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                  )}
                </div>
              </div>

              {/* Error banner */}
              {formError && <div className="form-error">{formError}</div>}

              {/* Actions */}
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={closeProductForm} disabled={formSaving}>
                  Cancel
                </button>
                <button
                  type="submit" className="btn btn-primary"
                  disabled={formSaving || uploadStatus === 'uploading'}
                >
                  {formSaving ? 'Saving…' : (editingProduct ? 'Save Changes' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
