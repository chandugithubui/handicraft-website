import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Row, Col, Table, Badge, Nav, Tab } from 'react-bootstrap';
import { FaUsers, FaShoppingCart, FaBox, FaRupeeSign } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAdminStats, getAllOrders, getAllUsers, updateOrderStatus } from '../services/adminService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, ordersData, usersData] = await Promise.all([
        getAdminStats(token),
        getAllOrders(token),
        getAllUsers(token)
      ]);
      setStats(statsData);
      setOrders(ordersData);
      setUsers(usersData);
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

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Container className="admin-dashboard">
        <div className="text-center my-5">
          <div className="spinner-border text-primary"></div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="admin-dashboard">
      <h2 className="mb-4">Admin Dashboard</h2>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <FaUsers size={32} className="text-primary mb-2" />
              <h3>{stats?.totalUsers || 0}</h3>
              <p className="text-muted mb-0">Total Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <FaShoppingCart size={32} className="text-success mb-2" />
              <h3>{stats?.totalOrders || 0}</h3>
              <p className="text-muted mb-0">Total Orders</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <FaBox size={32} className="text-warning mb-2" />
              <h3>{stats?.totalProducts || 0}</h3>
              <p className="text-muted mb-0">Total Products</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <FaRupeeSign size={32} className="text-danger mb-2" />
              <h3>₹{stats?.totalRevenue?.toLocaleString() || 0}</h3>
              <p className="text-muted mb-0">Total Revenue</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs for Orders and Users */}
      <Tab.Container defaultActiveKey="orders">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="orders">Orders</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="users">Users</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* Orders Tab */}
          <Tab.Pane eventKey="orders">
            <Card>
              <Card.Body>
                <h5 className="mb-4">Recent Orders</h5>
                <Table responsive hover>
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
                        <td>{getStatusBadge(order.orderStatus)}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={order.orderStatus}
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                            style={{ width: '120px' }}
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
                </Table>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Users Tab */}
          <Tab.Pane eventKey="users">
            <Card>
              <Card.Body>
                <h5 className="mb-4">Registered Users</h5>
                <Table responsive hover>
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
                          <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default AdminDashboard;
