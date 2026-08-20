import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBox, FaArrowLeft, FaEye } from 'react-icons/fa';
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
        const response = await axios.get('http://localhost:5000/api/orders/my-orders', {
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

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': 'warning',
      'Processing': 'info',
      'Shipped': 'primary',
      'Delivered': 'success',
      'Cancelled': 'danger'
    };
    return statusMap[status] || 'secondary';
  };

  if (loading) {
    return (
      <Container className="orders-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container className="orders-container">
        <Card className="text-center p-5">
          <Alert variant="warning">
            Please <Link to="/login">login</Link> to view your orders
          </Alert>
          <Link to="/">
            <Button variant="primary">Back to Home</Button>
          </Link>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="orders-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="orders-title">
          <FaBox className="me-2" />
          My Orders
        </h2>
        <Link to="/">
          <Button variant="outline-secondary">
            <FaArrowLeft className="me-2" />
            Continue Shopping
          </Button>
        </Link>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {orders.length === 0 ? (
        <Card className="text-center p-5">
          <h4>No orders yet</h4>
          <p className="text-muted mb-4">You haven't placed any orders yet.</p>
          <Link to="/products">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </Card>
      ) : (
        <Card className="orders-card">
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-8)}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.items.length} items</td>
                    <td>₹{order.totalAmount}</td>
                    <td>{order.paymentMethod}</td>
                    <td>
                      <Badge bg={getStatusBadge(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                    </td>
                    <td>
                      <Button variant="outline-primary" size="sm">
                        <FaEye className="me-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Orders;
