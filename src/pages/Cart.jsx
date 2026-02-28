import React from 'react';
import { Container, Row, Col, Button, Image, Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa';

const Cart = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      clearCart();
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <FaShoppingCart size={80} className="text-muted mb-4" />
          <h2>Your Cart is Empty</h2>
          <p className="text-muted mb-4">
            Looks like you haven't added any beautiful handicrafts to your cart yet.
          </p>
          <Button as={Link} to="/products" variant="primary" size="lg">
            Start Shopping
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Shopping Cart</h1>
      
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  Cart Items ({cartItems.length})
                </h5>
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={handleClearCart}
                >
                  Clear Cart
                </Button>
              </div>

              {cartItems.map((item) => (
                <div key={item._id} className="border-bottom pb-3 mb-3">
                  <Row className="align-items-center">
                    <Col md={2}>
                      <Image
                        src={item.image || '/images/placeholder-product.jpg'}
                        alt={item.name}
                        fluid
                        rounded
                        style={{ maxHeight: '80px', objectFit: 'cover' }}
                      />
                    </Col>
                    
                    <Col md={4}>
                      <h6 className="mb-1">{item.name}</h6>
                      <p className="text-muted small mb-0">
                        {item.description && item.description.length > 60
                          ? `${item.description.substring(0, 60)}...`
                          : item.description}
                      </p>
                    </Col>
                    
                    <Col md={2}>
                      <div className="d-flex align-items-center">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus size={10} />
                        </Button>
                        <span className="mx-3 fw-bold">{item.quantity}</span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        >
                          <FaPlus size={10} />
                        </Button>
                      </div>
                    </Col>
                    
                    <Col md={2}>
                      <div className="text-end">
                        <div className="fw-bold">₹{(item.price * item.quantity).toFixed(2)}</div>
                        <div className="text-muted small">₹{item.price} each</div>
                      </div>
                    </Col>
                    
                    <Col md={2}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveItem(item._id)}
                        className="w-100"
                      >
                        <FaTrash />
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="position-sticky" style={{ top: '20px' }}>
            <Card.Body>
              <h5 className="mb-4">Order Summary</h5>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span className="text-success">FREE</span>
              </div>
              
              <div className="d-flex justify-content-between mb-3">
                <span>Tax</span>
                <span>₹{(cartTotal * 0.18).toFixed(2)}</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-4">
                <h5>Total</h5>
                <h5>₹{(cartTotal * 1.18).toFixed(2)}</h5>
              </div>
              
              <Button
                as={Link}
                to="/checkout"
                variant="primary"
                size="lg"
                className="w-100 mb-3"
              >
                Proceed to Checkout
              </Button>
              
              <Button
                as={Link}
                to="/products"
                variant="outline-secondary"
                className="w-100"
              >
                Continue Shopping
              </Button>
              
              <div className="mt-3 p-3 bg-light rounded">
                <small className="text-muted">
                  <strong>Authenticity Guaranteed:</strong> All our handicrafts come with a certificate of authenticity from Raghurajpur artisans.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
