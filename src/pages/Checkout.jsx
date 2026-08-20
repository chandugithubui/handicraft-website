import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { createPaymentIntent } from '../services/paymentService';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../components/StripePaymentForm';
import './Checkout.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_key');

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { token } = useAuth();
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
  const [clientSecret, setClientSecret] = useState('');

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

      // Use token if authenticated, otherwise send without auth
      await createOrder(orderData, token || null);
      clearCart();
      navigate('/order-success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async (paymentMethod) => {
    setLoading(true);
    setError('');

    try {
      // Create payment intent
      const { clientSecret } = await createPaymentIntent(getCartTotal(), token);
      setClientSecret(clientSecret);

      const orderData = {
        items: cartItems.map(item => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shippingAddress,
        paymentMethod: 'Card',
        totalAmount: getCartTotal()
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
      <Container className="checkout-container">
        <Alert variant="info">
          Your cart is empty. <Link to="/products">Go to products</Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="checkout-container">
      <Link to="/cart" className="mb-3 d-inline-block">
        <Button variant="outline-secondary">
          <FaArrowLeft className="me-2" />
          Back to Cart
        </Button>
      </Link>

      <h2 className="mb-4">Checkout</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-4">Shipping Information</h5>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={shippingAddress.fullName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Address *</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleChange}
                    required
                    placeholder="Street address, apartment, etc."
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City *</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>State *</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Postal Code *</Form.Label>
                      <Form.Control
                        type="text"
                        name="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Country</Form.Label>
                      <Form.Control
                        type="text"
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <h5 className="mb-3 mt-4">Payment Method</h5>
                <Form.Group>
                  <Form.Check
                    type="radio"
                    label="Cash on Delivery (COD)"
                    name="paymentMethod"
                    id="cod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <Form.Check
                    type="radio"
                    label="Credit/Debit Card"
                    name="paymentMethod"
                    id="card"
                    value="Card"
                    checked={paymentMethod === 'Card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                </Form.Group>

                {paymentMethod === 'Card' && (
                  <div className="mt-4">
                    {clientSecret ? (
                      <Elements stripe={stripePromise}>
                        <StripePaymentForm
                          amount={getCartTotal()}
                          onSuccess={handleCardPayment}
                          onError={(err) => setError(err)}
                        />
                      </Elements>
                    ) : (
                      <Button
                        variant="primary"
                        className="w-100"
                        onClick={() => handleCardPayment()}
                        disabled={loading}
                      >
                        {loading ? 'Initializing...' : 'Continue to Payment'}
                      </Button>
                    )}
                  </div>
                )}

                {paymentMethod === 'COD' && (
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mt-4"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </Button>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="order-summary">
            <Card.Body>
              <h5 className="mb-4">Order Summary</h5>
              {cartItems.map((item) => (
                <div key={item._id} className="d-flex justify-content-between mb-2">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>₹{getCartTotal()}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span className="text-success">Free</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total</strong>
                <strong>₹{getCartTotal()}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
