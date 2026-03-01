import React, { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';

const PattachitraSlider = () => {
  // Use your actual carousel images
  const carouselImages = [
    {
      src: '/images/pattachitra1.jpg.jpg',
      fallback: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      title: 'Traditional Pattachitra Art'
    },
    {
      src: '/images/pattachitra2.jpg.jpg', 
      fallback: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      title: 'Handicraft Collection'
    },
    {
      src: '/images/pattachitra3.jpg.jpg',
      fallback: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      title: 'Artisan Masterpieces'
    }
  ];
  
  // Initial list of all products with details - use your actual images
  const allProducts = [
    { 
      id: 1, 
      title: 'Teapot Painting', 
      category: 'Paintings', 
      price: '₹800', 
      image: '/images/teapot.webp',
      description: 'Hand-painted traditional teapot featuring Pattachitra art. Perfect for tea lovers and art collectors.',
      material: 'Ceramic with natural colors',
      dimensions: '6 x 4 inches',
      artisan: 'Salini'
    },
    { 
      id: 2, 
      title: 'Gift Items', 
      category: 'Gift Items', 
      price: '₹2000', 
      image: '/images/GiftsItems.webp',
      description: 'Exclusive gift set with handcrafted items. Ideal for special occasions and corporate gifts.',
      material: 'Mixed materials',
      dimensions: 'Varies',
      artisan: 'Rakesh'
    },
    { 
      id: 3, 
      title: 'Glass Bottle', 
      category: 'Home Decor', 
      price: '₹1000', 
      image: '/images/glassbottle.webp',
      description: 'Decorative glass bottle with traditional Pattachitra paintings. Beautiful home decor item.',
      material: 'Glass with natural pigments',
      dimensions: '12 x 6 inches',
      artisan: 'Chandan'
    },
    { 
      id: 4, 
      title: 'Elephant Painting', 
      category: 'Paintings', 
      price: '₹700', 
      image: '/images/elephant.webp',
      description: 'Sacred elephant motif in traditional Pattachitra style. Symbol of wisdom and strength.',
      material: 'Treated cotton canvas',
      dimensions: '10 x 8 inches',
      artisan: 'Pupsa'
    },
    { 
      id: 5, 
      title: 'Handcrafted Vase', 
      category: 'Home Decor', 
      price: '₹1200', 
      image: '/images/handmadevase.webp',
      description: 'Beautiful handcrafted vase with intricate Pattachitra designs. Perfect for fresh flowers.',
      material: 'Terracotta with natural colors',
      dimensions: '10 x 5 inches',
      artisan: 'Jagannath'
    },
    { 
      id: 6, 
      title: 'Wooden Toys', 
      category: 'Gift Items', 
      price: '₹600', 
      image: '/images/toys.jpg',
      description: 'Traditional wooden toys with safe natural colors. Educational and decorative pieces.',
      material: 'Seasoned wood',
      dimensions: 'Varies',
      artisan: 'Archita'
    },
    { 
      id: 7, 
      title: 'Pattachitra Wall Art', 
      category: 'Paintings', 
      price: '₹2500', 
      image: '/images/pattachitrawall.jpg',
      description: 'Large wall art piece depicting mythological scenes. Centerpiece for any room.',
      material: 'Canvas with natural pigments',
      dimensions: '24 x 18 inches',
      artisan: 'Bandana'
    },
    { 
      id: 8, 
      title: 'Wooden Coasters', 
      category: 'Home Decor', 
      price: '₹350', 
      image: '/images/woodentoys.jpg',
      description: 'Set of 6 wooden coasters with Pattachitra art. Protect your furniture in style.',
      material: 'Polished wood',
      dimensions: '4 x 4 inches each',
      artisan: 'Salini'
    },
    { 
      id: 9, 
      title: 'Decorative Plate', 
      category: 'Home Decor', 
      price: '₹900', 
      image: '/images/decorativeplate.webp',
      description: 'Hand-painted decorative plate with traditional motifs. Wall hanging or table decor.',
      material: 'Ceramic',
      dimensions: '10 inches diameter',
      artisan: 'Rakesh'
    },
    { 
      id: 10, 
      title: 'Carved Wooden Sculpture', 
      category: 'Gift Items', 
      price: '₹1800', 
      image: '/images/carvedwooden.jpg',
      description: 'Intricately carved wooden sculpture showcasing traditional craftsmanship.',
      material: 'Seasoned teak wood',
      dimensions: '8 x 6 x 4 inches',
      artisan: 'Chandan'
    },
    { 
      id: 11, 
      title: 'Tiled Pattachitra Art', 
      category: 'Paintings', 
      price: '₹3500', 
      image: '/images/tilledpattachitra.webp',
      description: 'Premium tiled artwork with multiple Pattachitra scenes. Luxury home decor.',
      material: 'Natural stone tiles',
      dimensions: '36 x 24 inches',
      artisan: 'Pupsa'
    },
    { 
      id: 12, 
      title: 'Handcrafted Wooden Box', 
      category: 'Gift Items', 
      price: '₹900', 
      image: '/images/handcraftwooden.jpg',
      description: 'Decorative wooden box with traditional paintings. Perfect for jewelry or keepsakes.',
      material: 'Seasoned wood',
      dimensions: '8 x 6 x 4 inches',
      artisan: 'Jagannath'
    },
  ];

  // State for category selection, modal visibility, cart items, and product details
  const [selectedCategory, setSelectedCategory] = useState('Paintings');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  // Filter products based on selected category
  const filteredProducts = selectedCategory === 'Paintings' 
    ? allProducts.filter((product) => product.category === 'Paintings')
    : allProducts.filter((product) => product.category === selectedCategory);

  // Handle opening modal
  const viewDetails = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Handle adding product to cart
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const updatedCart = [...prevItems, product];
      // Show an alert when item is added
      alert(`${product.title} has been added to your cart.`);
      return updatedCart;
    });
  };

  // Close modal
  const handleCloseModal = () => setShowModal(false);

  // Handle image errors
  const handleImageError = (e) => {
    // For carousel images
    if (e.target.dataset.fallback) {
      e.target.style.display = 'none';
      const parent = e.target.parentElement;
      if (parent && !parent.querySelector('.fallback-bg')) {
        const fallback = document.createElement('div');
        fallback.className = 'fallback-bg';
        fallback.style.cssText = e.target.dataset.fallback + '; width: 100%; height: 500px; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: bold;';
        fallback.textContent = e.target.dataset.title;
        parent.insertBefore(fallback, e.target);
      }
    } else {
      // For product images - use placeholder
      e.target.src = 'https://via.placeholder.com/300x200/cccccc/666666?text=Product+Image';
    }
  };

  return (
    <Container>
    {/* PattachitraSlider Section */}
    <Carousel interval={3000}>
      {carouselImages.map((image, index) => (
        <Carousel.Item key={index}>
          <img 
            className="d-block w-100 mt-3" 
            src={image.src} 
            alt={image.title}
            style={{ height: '500px', objectFit: 'cover' }} 
            onError={handleImageError}
            data-fallback={image.fallback}
            data-title={image.title}
          />
          <Carousel.Caption>
            <h3>{image.title}</h3>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>

      {/* Category Filter Section */}
      <Row className="my-5">
        <Col md={3}>
          <h4>Filter by Category</h4>
          <Button variant={selectedCategory === 'Paintings' ? 'primary' : 'outline-primary'} onClick={() => setSelectedCategory('Paintings')} className="mb-2" block>Paintings</Button>
          <Button variant={selectedCategory === 'Gift Items' ? 'primary' : 'outline-primary'} onClick={() => setSelectedCategory('Gift Items')} className="mb-2" block>Gift Items</Button>
          <Button variant={selectedCategory === 'Home Decor' ? 'primary' : 'outline-primary'} onClick={() => setSelectedCategory('Home Decor')} className="mb-2" block>Home Decor</Button>
        </Col>

        {/* Products Grid */}
        <Col md={9} className="bg-light p-4 rounded">
          <h2>Shop Our Pattachitra Art</h2>
          <Row className="my-4">
            {filteredProducts.map((product) => (
              <Col sm={6} md={4} lg={3} className="mb-4 d-flex" key={product.id}>
                <Card className="h-100 flex-fill">
                  <Card.Img variant="top" src={product.image} style={{ height: '200px', objectFit: 'cover' }} onError={handleImageError} />
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="fs-6">{product.title}</Card.Title>
                    <Card.Text className="fw-bold text-primary mb-3">{product.price}</Card.Text>
                    <div className="mt-auto d-grid gap-2">
                      <Button variant="primary" onClick={() => addToCart(product)}>Add to Cart</Button>
                      <Button variant="outline-secondary" onClick={() => viewDetails(product)}>View Details</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Modal for Product Details */}
      {selectedProduct && (
        <Modal show={showModal} onHide={handleCloseModal} size="sm" centered>
          <Modal.Header closeButton>
            <Modal.Title className="fs-5">{selectedProduct.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3">
            <div className="text-center mb-3">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.title} 
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '150px', 
                  objectFit: 'contain',
                  width: 'auto',
                  height: 'auto',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} 
                className="img-fluid"
                onError={handleImageError}
              />
            </div>
            <div className="text-center">
              <h5 className="text-primary fw-bold mb-2">{selectedProduct.price}</h5>
              <p className="text-muted small mb-2">{selectedProduct.description}</p>
              <div className="row g-2 mb-2">
                <div className="col-6">
                  <small className="text-muted d-block">Material:</small>
                  <span className="fw-bold small">{selectedProduct.material}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Size:</small>
                  <span className="fw-bold small">{selectedProduct.dimensions}</span>
                </div>
              </div>
              <div className="mb-2">
                <small className="text-muted d-block">Artisan:</small>
                <span className="fw-bold small">{selectedProduct.artisan}</span>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="py-2">
            <Button variant="secondary" size="sm" onClick={handleCloseModal}>Close</Button>
            <Button variant="primary" size="sm" onClick={() => addToCart(selectedProduct)}>Add to Cart</Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Cart Items Count */}
      <div className="my-3">
        <h4>Items in Cart: {cartItems.length}</h4>
      </div>
    </Container>
  );
};

export default PattachitraSlider;
