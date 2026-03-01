// src/components/ProductList.js
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Modal } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaEye, FaCheck } from 'react-icons/fa';

const ProductList = () => {
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [addedProducts, setAddedProducts] = useState(new Set());
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  // Local cart state for accurate counting
  const [localCart, setLocalCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  
  // Use the same product data from PattachitraSlider with proper structure
  const allProducts = [
    { 
      _id: 1, 
      name: 'Teapot Painting', 
      price: 800, 
      image: '/images/teapot.webp',
      description: 'Hand-painted traditional teapot featuring Pattachitra art. Perfect for tea lovers and art collectors.',
      category: 'Paintings',
      rating: 4.5,
      reviews: 12
    },
    { 
      _id: 2, 
      name: 'Gift Items', 
      price: 2000, 
      image: '/images/GiftsItems.webp',
      description: 'Exclusive gift set with handcrafted items. Ideal for special occasions and corporate gifts.',
      category: 'Gift Items',
      rating: 4.8,
      reviews: 8
    },
    { 
      _id: 3, 
      name: 'Glass Bottle', 
      price: 1000, 
      image: '/images/glassbottle.webp',
      description: 'Decorative glass bottle with traditional Pattachitra paintings. Beautiful home decor item.',
      category: 'Home Decor',
      rating: 4.3,
      reviews: 6
    },
    { 
      _id: 4, 
      name: 'Elephant Painting', 
      price: 700, 
      image: '/images/elephant.webp',
      description: 'Sacred elephant motif in traditional Pattachitra style. Symbol of wisdom and strength.',
      category: 'Paintings',
      rating: 4.7,
      reviews: 15
    },
    { 
      _id: 5, 
      name: 'Handcrafted Vase', 
      price: 1200, 
      image: '/images/handmadevase.webp',
      description: 'Beautiful handcrafted vase with intricate Pattachitra designs. Perfect for fresh flowers.',
      category: 'Home Decor',
      rating: 4.6,
      reviews: 10
    },
    { 
      _id: 6, 
      name: 'Wooden Toys', 
      price: 600, 
      image: '/images/toys.jpg',
      description: 'Traditional wooden toys with safe natural colors. Educational and decorative pieces.',
      category: 'Gift Items',
      rating: 4.4,
      reviews: 9
    },
    { 
      _id: 7, 
      name: 'Pattachitra Wall Art', 
      price: 2500, 
      image: '/images/pattachitrawall.jpg',
      description: 'Large wall art piece depicting mythological scenes. Centerpiece for any room.',
      category: 'Paintings',
      rating: 5.0,
      reviews: 20
    },
    { 
      _id: 8, 
      name: 'Wooden Coasters', 
      price: 350, 
      image: '/images/woodentoys.jpg',
      description: 'Set of 6 wooden coasters with Pattachitra art. Protect your furniture in style.',
      category: 'Home Decor',
      rating: 4.2,
      reviews: 7
    },
    { 
      _id: 9, 
      name: 'Decorative Plate', 
      price: 900, 
      image: '/images/decorativeplate.webp',
      description: 'Hand-painted decorative plate with traditional motifs. Wall hanging or table decor.',
      category: 'Home Decor',
      rating: 4.5,
      reviews: 11
    },
    { 
      _id: 10, 
      name: 'Carved Wooden Sculpture', 
      price: 1800, 
      image: '/images/carvedwooden.jpg',
      description: 'Intricately carved wooden sculpture showcasing traditional craftsmanship.',
      category: 'Gift Items',
      rating: 4.8,
      reviews: 13
    },
    { 
      _id: 11, 
      name: 'Tiled Pattachitra Art', 
      price: 3500, 
      image: '/images/tilledpattachitra.webp',
      description: 'Premium tiled artwork with multiple Pattachitra scenes. Luxury home decor.',
      category: 'Paintings',
      rating: 4.9,
      reviews: 18
    },
    { 
      _id: 12, 
      name: 'Handcrafted Wooden Box', 
      price: 900, 
      image: '/images/handcraftwooden.jpg',
      description: 'Decorative wooden box with traditional paintings. Perfect for jewelry or keepsakes.',
      category: 'Gift Items',
      rating: 4.6,
      reviews: 8
    },
    { 
      _id: 13, 
      name: 'Handcrafted Wooden Bowl', 
      price: 1200, 
      image: '/images/HandcraftedWoodenBowl.webp',
      description: 'Traditional wooden bowl with intricate carvings. Perfect for serving snacks.',
      category: 'Home Decor',
      rating: 4.7,
      reviews: 12
    },
    { 
      _id: 14, 
      name: 'Traditional Metal Lamp', 
      price: 3500, 
      image: '/images/metallamp.jpg',
      description: 'Antique-style metal lamp with traditional designs. Creates warm ambiance.',
      category: 'Home Decor',
      rating: 4.9,
      reviews: 16
    },
    { 
      _id: 15, 
      name: 'Handpainted Wooden Tray', 
      price: 2200, 
      image: '/images/woodentray.jpg',
      description: 'Elegant wooden tray with Pattachitra paintings. Perfect for serving guests.',
      category: 'Home Decor',
      rating: 4.8,
      reviews: 14
    },
    { 
      _id: 16, 
      name: 'Decorative Clay Pot', 
      price: 800, 
      image: '/images/claypot.jpg',
      description: 'Traditional clay pot with earthy designs. Ideal for indoor plants.',
      category: 'Home Decor',
      rating: 4.4,
      reviews: 6
    }
  ];

  const handleAddToCart = (product) => {
    // Convert the product data to match the cart context format
    const cartProduct = {
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      quantity: 1
    };
    
    // Add to cart context
    addToCart(cartProduct);
    
    // Update local cart state for accurate counting
    setLocalCart(prev => {
      const existingItem = prev.find(item => item.id === product._id);
      let newCart;
      
      if (existingItem) {
        // Update quantity if item exists
        newCart = prev.map(item => 
          item.id === product._id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item
        newCart = [...prev, cartProduct];
      }
      
      // Calculate new total
      const newTotal = newCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setCartTotal(newTotal);
      
      return newCart;
    });
    
    // Mark product as added for visual feedback
    setAddedProducts(prev => new Set(prev).add(product._id));
    
    // Show success message with correct count and total
    setAlertMessage(`${product.name} added to cart! Items: ${localCart.length + 1}, Total: ₹${cartTotal + product.price}`);
    setShowAlert(true);
    
    // Hide alert after 3 seconds
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
    
    // Remove visual feedback after 2 seconds
    setTimeout(() => {
      setAddedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product._id);
        return newSet;
      });
    }, 2000);
  };

  const handleViewDetails = (product) => {
    // Set selected product and show modal
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    // Close modal and clear selected product
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleModalAddToCart = () => {
    if (selectedProduct) {
      handleAddToCart(selectedProduct);
      handleCloseModal();
    }
  };

  return (
    <Container className="py-4">
      {/* Cart Counter and Alert */}
      <div className="text-center mb-4">
        <h2 className="fw-bold">All Products</h2>
        <p className="text-muted">Discover authentic, handcrafted treasures from Raghurajpur artisans</p>
        
        {/* Cart Counter */}
        <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
          <Badge bg="primary" className="p-2">
            <FaShoppingCart className="me-1" />
            Cart: {localCart.length} items
          </Badge>
          {localCart.length > 0 && (
            <Badge bg="success" className="p-2">
              Total: ₹{cartTotal}
            </Badge>
          )}
        </div>
        
        {/* Success Alert */}
        {showAlert && (
          <Alert variant="success" className="d-inline-block" onClose={() => setShowAlert(false)} dismissible>
            <FaCheck className="me-2" />
            {alertMessage}
          </Alert>
        )}
      </div>
      
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {allProducts.map((product) => (
          <Col key={product._id} className="d-flex">
            <Card className={`h-100 product-card shadow-sm`}>
              <div className="position-relative">
                <Card.Img
                  variant="top"
                  src={product.image}
                  alt={product.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                  className="product-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200/cccccc/666666?text=Product+Image';
                  }}
                />
                
                {/* Added to Cart Indicator */}
                {addedProducts.has(product._id) && (
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-success bg-opacity-75">
                    <div className="text-white text-center">
                      <FaCheck size={32} className="mb-2" />
                      <div className="fw-bold">Added to Cart!</div>
                    </div>
                  </div>
                )}
              </div>
              
              <Card.Body className="d-flex flex-column">
                <Card.Title className="fs-6 fw-bold text-truncate" title={product.name}>
                  {product.name}
                </Card.Title>
                
                <Card.Text className="text-muted small flex-grow-1">
                  {product.description && product.description.length > 80
                    ? `${product.description.substring(0, 80)}...`
                    : product.description}
                </Card.Text>

                {product.rating && (
                  <div className="mb-2">
                    <div className="d-flex align-items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-warning me-1 ${i < Math.floor(product.rating) ? '' : 'text-secondary'}`}
                          style={{ fontSize: '12px' }}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-muted small ms-1">({product.reviews || 0})</span>
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <span className="fw-bold text-primary fs-5">₹{product.price}</span>
                </div>

                <div className="mt-auto d-flex gap-2">
                  <Button
                    variant={addedProducts.has(product._id) ? "success" : "primary"}
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    className="flex-fill d-flex align-items-center justify-content-center gap-1"
                    disabled={addedProducts.has(product._id)}
                  >
                    {addedProducts.has(product._id) ? (
                      <>
                        <FaCheck size={12} />
                        Added
                      </>
                    ) : (
                      <>
                        <FaShoppingCart size={12} />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleViewDetails(product)}
                    className="d-flex align-items-center justify-content-center"
                  >
                    <FaEye size={12} />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      {/* Product Details Modal */}
      {selectedProduct && (
        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>{selectedProduct.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300/cccccc/666666?text=Product+Image';
                  }}
                />
              </Col>
              <Col md={6}>
                <h4 className="text-primary fw-bold mb-3">₹{selectedProduct.price}</h4>
                <p className="text-muted mb-4">{selectedProduct.description}</p>
                
                <div className="mb-3">
                  <strong>Category:</strong> {selectedProduct.category}
                </div>
                
                {selectedProduct.rating && (
                  <div className="mb-3">
                    <strong>Rating:</strong>
                    <div className="d-flex align-items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-warning me-1 ${i < Math.floor(selectedProduct.rating) ? '' : 'text-secondary'}`}
                          style={{ fontSize: '16px' }}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-muted ms-1">({selectedProduct.reviews || 0} reviews)</span>
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <strong>Product Details:</strong>
                  <ul className="text-muted mt-2">
                    <li>Handcrafted by traditional artisans</li>
                    <li>Premium quality materials</li>
                    <li>Certificate of authenticity included</li>
                    <li>Free shipping on orders above ₹999</li>
                  </ul>
                </div>
                
                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleModalAddToCart}
                  >
                    <FaShoppingCart className="me-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="lg"
                    onClick={handleCloseModal}
                  >
                    Close
                  </Button>
                </div>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
      )}
    </Container>
  );
};

export default ProductList;
