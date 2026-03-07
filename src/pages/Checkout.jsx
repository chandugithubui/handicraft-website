import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, ListGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaArrowLeft, FaLock } from 'react-icons/fa';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    paymentMethod: 'cod'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would normally send the order to your backend
      const orderData = {
        items: cartItems,
        total: cartTotal * 1.18, // Including tax
        shippingAddress: formData,
        paymentMethod: formData.paymentMethod,
        orderDate: new Date().toISOString()
      };

      console.log('Order placed:', orderData);
      
      setOrderPlaced(true);
      clearCart();
      
      // Redirect to order confirmation after 3 seconds
      setTimeout(() => {
        navigate('/order-confirmation');
      }, 3000);
      
    } catch (err) {
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <Container className="py-5">
        <Alert variant="info">
          Your cart is empty. <Link to="/products">Continue shopping</Link>
        </Alert>
      </Container>
    );
  }

  if (orderPlaced) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="mb-4">
            <div className="rounded-circle bg-success d-inline-flex align-items-center justify-content-center" 
                 style={{ width: '80px', height: '80px' }}>
              <span style={{ fontSize: '40px', color: 'white' }}>✓</span>
            </div>
          </div>
          <h2 className="mb-3">Order Placed Successfully!</h2>
          <p className="text-muted mb-4">
            Thank you for your order. You will receive a confirmation email shortly.
          </p>
          <p>Redirecting to order confirmation...</p>
        </div>
      </Container>
    );
  }

  const subtotal = cartTotal;
  const tax = subtotal * 0.18;
  const shipping = subtotal > 999 ? 0 : 50;
  const total = subtotal + tax + shipping;

  return (
    <Container className="py-4">
      <div className="mb-4">
        <Button as={Link} to="/cart" variant="outline-secondary" className="mb-3">
          <FaArrowLeft className="me-2" />
          Back to Cart
        </Button>
        <h1 className="mb-0">Checkout</h1>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col lg={8}>
          <Form onSubmit={handleSubmit}>
            {/* Contact Information */}
            <Card className="mb-4">
              <Card.Body>
                <h5 className="mb-4">Contact Information</h5>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>First Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Last Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </Col>
                </Row>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Email Address *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Phone Number *</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Shipping Address */}
            <Card className="mb-4">
              <Card.Body>
                <h5 className="mb-4">Shipping Address</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Street Address *</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Row>
                  <Col md={4} className="mb-3">
                    <Form.Label>City *</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>State *</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>PIN Code *</Form.Label>
                    <Form.Control
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      required
                    />
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Payment Method */}
            <Card className="mb-4">
              <Card.Body>
                <h5 className="mb-4">Payment Method</h5>
                <Form.Group>
                  <Form.Check
                    type="radio"
                    name="paymentMethod"
                    id="cod"
                    label="Cash on Delivery (COD)"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                    className="mb-2"
                  />
                  <Form.Check
                    type="radio"
                    name="paymentMethod"
                    id="card"
                    label="Credit/Debit Card"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleInputChange}
                    className="mb-2"
                  />
                  <Form.Check
                    type="radio"
                    name="paymentMethod"
                    id="upi"
                    label="UPI Payment"
                    value="upi"
                    checked={formData.paymentMethod === 'upi'}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </Button>
          </Form>
        </Col>

        <Col lg={4}>
          <Card className="position-sticky" style={{ top: '20px' }}>
            <Card.Body>
              <h5 className="mb-4">Order Summary</h5>
              
              <ListGroup variant="flush">
                {cartItems.map((item) => (
                  <ListGroup.Item key={item._id} className="px-0">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{item.name}</h6>
                        <small className="text-muted">Qty: {item.quantity}</small>
                      </div>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <hr />

              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (18%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-success' : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                </span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-4">
                <h5>Total</h5>
                <h5>₹{total.toFixed(2)}</h5>
              </div>

              <div className="text-center text-muted small mb-3">
                <FaLock className="me-1" />
                Secure Checkout
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
