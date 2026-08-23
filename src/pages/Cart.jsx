import React from 'react';
import { Container, Card, Row, Col, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <Container className="cart-container">
        <Card className="text-center p-5">
          <FaShoppingCart size={64} className="mb-3 text-muted" />
          <h3>Your cart is empty</h3>
          <p className="text-muted">Add some beautiful handicrafts to your cart!</p>
          <Link to="/products">
            <Button variant="primary" className="mt-3">
              <FaArrowLeft className="me-2" />
              Continue Shopping
            </Button>
          </Link>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="cart-container">
      <h2 className="mb-4">Shopping Cart</h2>
      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {item.image && (
                            <img
                              src={`${(() => {
                                const getApiUrl = () => {
                                  if (window.location.hostname === 'handicraft-website-fyao.vercel.app' ||
                                      window.location.hostname.includes('vercel.app')) {
                                    return 'https://handicraft-website.onrender.com/api';
                                  }
                                  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
                                };
                                return getApiUrl();
                              })()}/uploads/${item.image}`}
                              alt={item.name}
                              className="cart-item-image me-3"
                            />
                          )}
                          <div>
                            <h6 className="mb-0">{item.name}</h6>
                            <small className="text-muted">{item.category}</small>
                          </div>
                        </div>
                      </td>
                      <td>₹{item.price}</td>
                      <td>
                        <div className="quantity-control">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="mx-2">{item.quantity}</span>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td>₹{item.price * item.quantity}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeFromCart(item._id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="cart-summary">
            <Card.Body>
              <h5>Order Summary</h5>
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
              <div className="d-flex justify-content-between mb-3">
                <strong>Total</strong>
                <strong>₹{getCartTotal()}</strong>
              </div>
              <Link to="/checkout">
                <Button variant="primary" className="w-100 mb-2">
                  Proceed to Checkout
                </Button>
              </Link>
              <Button
                variant="outline-danger"
                className="w-100"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
              <div className="mt-3 text-center">
                <Link to="/products" className="text-decoration-none">
                  <FaArrowLeft className="me-1" />
                  Continue Shopping
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
