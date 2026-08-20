import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaHome } from 'react-icons/fa';
import './OrderSuccess.css';

const OrderSuccess = () => {
  return (
    <Container className="order-success-container">
      <Card className="text-center p-5">
        <FaCheckCircle size={80} className="text-success mb-4" />
        <h2 className="mb-3">Order Placed Successfully!</h2>
        <p className="text-muted mb-4">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
        <p className="mb-4">
          You will receive an order confirmation email shortly with your order details.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/orders">
            <Button variant="primary">
              <FaShoppingBag className="me-2" />
              View My Orders
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline-secondary">
              <FaHome className="me-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </Card>
    </Container>
  );
};

export default OrderSuccess;
