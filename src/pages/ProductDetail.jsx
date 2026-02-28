import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Image, Alert, Spinner, Badge, Tab, Tabs } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaStar, FaHeart, FaShare, FaTruck, FaShieldAlt, FaUndo } from 'react-icons/fa';
import { getProductById } from '../services/productService';

const ProductDetail = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProductById(productId);
        setProduct(productData);
        setError(null);
      } catch (err) {
        setError('Failed to load product details. Please try again later.');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i <= rating ? 'text-warning' : 'text-secondary'}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading product...</span>
        </Spinner>
        <p className="mt-3">Loading product details...</p>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Product not found'}</Alert>
        <Button as={Link} to="/products" variant="primary">
          Back to Products
        </Button>
      </Container>
    );
  }

  const productImages = product.images || [product.image];
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <Container className="py-4">
      <Row>
        <Col lg={6}>
          <div className="mb-4">
            <Image
              src={productImages[selectedImage] || '/images/placeholder-product.jpg'}
              alt={product.name}
              fluid
              rounded
              className="main-product-image"
              style={{ maxHeight: '500px', objectFit: 'cover' }}
            />
          </div>
          
          {productImages.length > 1 && (
            <Row className="g-2">
              {productImages.map((image, index) => (
                <Col xs={3} key={index}>
                  <Image
                    src={image || '/images/placeholder-product.jpg'}
                    alt={`${product.name} ${index + 1}`}
                    fluid
                    rounded
                    className={`thumbnail-image cursor-pointer ${selectedImage === index ? 'border-primary border-2' : ''}`}
                    onClick={() => setSelectedImage(index)}
                    style={{ cursor: 'pointer', maxHeight: '100px', objectFit: 'cover' }}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Col>

        <Col lg={6}>
          <div className="mb-3">
            {product.isNew && <Badge bg="success" className="me-2">New</Badge>}
            {discount > 0 && <Badge bg="danger">{discount}% OFF</Badge>}
          </div>

          <h1 className="mb-3">{product.name}</h1>
          
          <div className="mb-3">
            {renderStars(product.rating || 4)}
            <span className="text-muted ms-2">({product.reviews || 12} reviews)</span>
          </div>

          <div className="mb-4">
            <span className="h3 text-primary fw-bold">₹{product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-muted text-decoration-line-through ms-2">
                  ₹{product.originalPrice}
                </span>
                <span className="text-success ms-2">Save ₹{product.originalPrice - product.price}</span>
              </>
            )}
          </div>

          <p className="lead mb-4">{product.description}</p>

          <div className="mb-4">
            <label className="form-label fw-bold">Quantity:</label>
            <div className="d-flex align-items-center">
              <Button
                variant="outline-secondary"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="mx-3 fw-bold fs-5" style={{ minWidth: '50px', textAlign: 'center' }}>
                {quantity}
              </span>
              <Button
                variant="outline-secondary"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          <div className="d-flex gap-3 mb-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleAddToCart}
              className="flex-fill d-flex align-items-center justify-content-center gap-2"
            >
              <FaShoppingCart />
              Add to Cart
            </Button>
            
            <Button variant="outline-danger" size="lg">
              <FaHeart />
            </Button>
            
            <Button variant="outline-secondary" size="lg">
              <FaShare />
            </Button>
          </div>

          <div className="border-top pt-4">
            <Row className="text-center">
              <Col xs={4}>
                <FaTruck size={24} className="text-primary mb-2" />
                <div className="small fw-bold">Free Shipping</div>
                <div className="small text-muted">On orders above ₹999</div>
              </Col>
              <Col xs={4}>
                <FaShieldAlt size={24} className="text-primary mb-2" />
                <div className="small fw-bold">Authenticity</div>
                <div className="small text-muted">100% Genuine</div>
              </Col>
              <Col xs={4}>
                <FaUndo size={24} className="text-primary mb-2" />
                <div className="small fw-bold">Easy Returns</div>
                <div className="small text-muted">7 days return</div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <Tabs defaultActiveKey="description" id="product-tabs" className="mb-4">
            <Tab eventKey="description" title="Description">
              <div className="p-3">
                <h4>Product Description</h4>
                <p>{product.description}</p>
                {product.details && (
                  <div>
                    <h5 className="mt-4">Product Details</h5>
                    <ul>
                      {Object.entries(product.details).map(([key, value]) => (
                        <li key={key}>
                          <strong>{key}:</strong> {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Tab>
            
            <Tab eventKey="artisan" title="Artisan Story">
              <div className="p-3">
                <h4>About the Artisan</h4>
                <p>
                  This beautiful piece has been handcrafted by skilled artisans from Raghurajpur, 
                  a heritage village in Puri, Odisha, known for its centuries-old tradition of Pattachitra painting.
                </p>
                <p>
                  Each piece tells a story and carries the legacy of generations of craftsmanship. 
                  By purchasing this product, you're not just buying a beautiful item, but also supporting 
                  the preservation of traditional art forms and the livelihood of local artisans.
                </p>
              </div>
            </Tab>
            
            <Tab eventKey="care" title="Care Instructions">
              <div className="p-3">
                <h4>Care Instructions</h4>
                <ul>
                  <li>Keep away from direct sunlight and moisture</li>
                  <li>Clean gently with a soft, dry cloth</li>
                  <li>Avoid using harsh chemicals or cleaning agents</li>
                  <li>Store in a cool, dry place</li>
                  <li>Handle with care to preserve the intricate details</li>
                </ul>
              </div>
            </Tab>
            
            <Tab eventKey="reviews" title="Reviews">
              <div className="p-3">
                <h4>Customer Reviews</h4>
                <p className="text-muted">No reviews yet. Be the first to review this product!</p>
                <Button variant="outline-primary">Write a Review</Button>
              </div>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;
