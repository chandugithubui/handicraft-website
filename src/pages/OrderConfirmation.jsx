import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaBox } from 'react-icons/fa';

const OrderConfirmation = () => {
  const orderNumber = `ORD${Date.now()}`;
  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <FaCheckCircle className="text-success mb-3" size={80} />
        <h1 className="mb-3">Order Confirmed!</h1>
        <p className="lead text-muted">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
      </div>

      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-4">Order Details</h5>
              
              <Row className="mb-3">
                <Col sm={4}>
                  <small className="text-muted">Order Number</small>
                  <div className="fw-bold">{orderNumber}</div>
                </Col>
                <Col sm={4}>
                  <small className="text-muted">Order Date</small>
                  <div className="fw-bold">
                    {new Date().toLocaleDateString('en-IN')}
                  </div>
                </Col>
                <Col sm={4}>
                  <small className="text-muted">Estimated Delivery</small>
                  <div className="fw-bold">{estimatedDelivery}</div>
                </Col>
              </Row>

              <hr />

              <div className="mb-4">
                <h6>What happens next?</h6>
                <div className="d-flex align-items-start mb-2">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" 
                       style={{ width: '30px', height: '30px', fontSize: '14px' }}>1</div>
                  <div>
                    <div className="fw-bold">Order Confirmation</div>
                    <small className="text-muted">You'll receive an email confirmation shortly</small>
                  </div>
                </div>
                <div className="d-flex align-items-start mb-2">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" 
                       style={{ width: '30px', height: '30px', fontSize: '14px' }}>2</div>
                  <div>
                    <div className="fw-bold">Artisan Preparation</div>
                    <small className="text-muted">Our skilled artisans will carefully prepare your handicraft</small>
                  </div>
                </div>
                <div className="d-flex align-items-start">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" 
                       style={{ width: '30px', height: '30px', fontSize: '14px' }}>3</div>
                  <div>
                    <div className="fw-bold">Delivery</div>
                    <small className="text-muted">Your order will be delivered to your shipping address</small>
                  </div>
                </div>
              </div>

              <hr />

              <div className="text-center">
                <p className="text-muted mb-3">
                  A confirmation email with all order details has been sent to your registered email address.
                </p>
                <div className="d-flex gap-3 justify-content-center">
                  <Button as={Link} to="/" variant="primary">
                    <FaHome className="me-2" />
                    Back to Home
                  </Button>
                  <Button as={Link} to="/products" variant="outline-primary">
                    <FaBox className="me-2" />
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="bg-light">
            <Card.Body className="text-center">
              <h6 className="mb-3">Support Traditional Artisans</h6>
              <p className="text-muted small mb-0">
                By purchasing from Handicraft Hub, you're supporting the rich cultural heritage 
                of Raghurajpur artisans and helping preserve traditional crafts for future generations.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderConfirmation;
