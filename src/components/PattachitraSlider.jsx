import React, { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';

const PattachitraSlider = () => {
  const backendUrl = "https://handicraft-website.onrender.com";
  
  // Initial list of all products with details
  const allProducts = [
    { 
      id: 1, 
      title: 'Teapot Painting', 
      category: 'Paintings', 
      price: '₹800', 
      image: `${backendUrl}/uploads/teapot.webp`,
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
      image: `${backendUrl}/uploads/GiftsItems.webp`,
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
      image: `${backendUrl}/uploads/glassbottle.webp`,
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
      image: `${backendUrl}/uploads/elephant.webp`,
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
      image: `${backendUrl}/uploads/handmadevase.webp`,
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
      image: `${backendUrl}/uploads/toys.jpg`,
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
      image: `${backendUrl}/uploads/pattachitrawall.jpg`,
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
      image: `${backendUrl}/uploads/woodentoys.jpg`,
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
      image: `${backendUrl}/uploads/decorativeplate.webp`,
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
      image: `${backendUrl}/uploads/carvedwooden.jpg`,
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
      image: `${backendUrl}/uploads/tilledpattachitra.webp`,
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
      image: `${backendUrl}/uploads/handcraftwooden.jpg`,
      description: 'Decorative wooden box with traditional paintings. Perfect for jewelry or keepsakes.',
      material: 'Seasoned wood',
      dimensions: '8 x 6 x 4 inches',
      artisan: 'Jagannath'
    },
  ];

  // Featured Handicrafts data
  const featuredHandicrafts = [
    { 
      id: 1, 
      title: 'Handcrafted Wooden Bowl', 
      price: '₹1200', 
      image: `${backendUrl}/uploads/HandcraftedwoodenBowl.webp`,
      description: 'Traditional wooden bowl with intricate carvings. Perfect for serving snacks.',
      material: 'Seasoned wood',
      dimensions: '8 x 4 inches',
      artisan: 'Salini'
    },
    { 
      id: 2, 
      title: 'Traditional Metal Lamp', 
      price: '₹3500', 
      image: `${backendUrl}/uploads/metallamp.jpg`,
      description: 'Antique-style metal lamp with traditional designs. Creates warm ambiance.',
      material: 'Brass with glass',
      dimensions: '12 x 6 inches',
      artisan: 'Rakesh'
    },
    { 
      id: 3, 
      title: 'Handpainted Wooden Tray', 
      price: '₹2200', 
      image: `${backendUrl}/uploads/woodentray.jpg`,
      description: 'Elegant wooden tray with Pattachitra paintings. Perfect for serving guests.',
      material: 'Polished wood',
      dimensions: '16 x 12 inches',
      artisan: 'Chandan'
    },
    { 
      id: 4, 
      title: 'Decorative Clay Pot', 
      price: '₹800', 
      image: `${backendUrl}/uploads/claypot.jpg`,
      description: 'Traditional clay pot with earthy designs. Ideal for indoor plants.',
      material: 'Terracotta',
      dimensions: '8 x 8 inches',
      artisan: 'Pupsa'
    },
  ];

  // Featured Collection data
  const featuredCollection = [
    { 
      id: 1, 
      title: 'Handcrafted Vase', 
      price: '₹1500', 
      image: `${backendUrl}/uploads/handcraftvase.jpg`,
      artist: 'Jagannath',
      description: 'Elegant vase with traditional motifs. Perfect home decor piece.',
      material: 'Ceramic',
      dimensions: '10 x 5 inches'
    },
    { 
      id: 2, 
      title: 'Pattachitra Wall Art', 
      price: '₹5000', 
      image: `${backendUrl}/uploads/pattachitrawallpainting.webp`,
      artist: 'Archita',
      description: 'Large wall art depicting mythological stories. Museum quality piece.',
      material: 'Canvas with natural pigments',
      dimensions: '30 x 20 inches'
    },
    { 
      id: 3, 
      title: 'Handcrafted Wooden Box', 
      price: '₹900', 
      image: `${backendUrl}/uploads/woodenhandcraft.jpg`,
      artist: 'Bandana',
      description: 'Decorative box with traditional paintings. Perfect for storing treasures.',
      material: 'Seasoned wood',
      dimensions: '10 x 8 x 6 inches'
    },
    { 
      id: 4, 
      title: 'Carved Wooden Sculpture', 
      price: '₹1000', 
      image: `${backendUrl}/uploads/sculpture.webp`, 
      artist: 'Salini',
      description: 'Intricate sculpture showcasing traditional craftsmanship. Collector\'s item.',
      material: 'Teak wood',
      dimensions: '12 x 8 x 6 inches'
    },
  ];

  // State for category selection, modal visibility, cart items, and product details
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  // Filter products based on selected category
  const filteredProducts = selectedCategory === 'All' 
    ? allProducts 
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

  return (
    <Container>
    {/* PattachitraSlider Section */}
    <Carousel interval={3000}>
      <Carousel.Item>
        <img className="d-block w-100 mt-3" src={`${backendUrl}/uploads/pattachitra1.jpg.jpg`} alt="First slide" style={{ height: '500px', objectFit: 'cover', }} />
        <Carousel.Caption>
          <h3>Pattachitra Art 1</h3>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img className="d-block w-100 mt-3" src={`${backendUrl}/uploads/pattachitra2.jpg.jpg`} alt="Second slide" style={{ height: '500px', objectFit: 'cover',}} />
        <Carousel.Caption>
          <h3>Pattachitra Art 2</h3>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img className="d-block w-100 mt-3" src={`${backendUrl}/uploads/pattachitra3.jpg.jpg`} alt="Third slide" style={{ height: '500px', objectFit: 'cover',}} />
        <Carousel.Caption>
          <h3>Pattachitra Art 3</h3>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>

      {/* Category Filter Section */}
      <Row className="my-5">
        <Col md={3}>
          <h4>Filter by Category</h4>
          <Button variant={selectedCategory === 'All' ? 'primary' : 'outline-primary'} onClick={() => setSelectedCategory('All')} className="mb-2" block>All</Button>
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
                  <Card.Img variant="top" src={product.image} style={{ height: '200px', objectFit: 'cover' }} />
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

      {/* Featured Handicrafts Section */}
      <section className="my-5">
        <h2>Featured Handicrafts</h2>
        <Row className="my-4">
          {featuredHandicrafts.map((handicraft) => (
            <Col sm={6} md={4} lg={3} className="mb-4 d-flex" key={handicraft.id}>
              <Card className="h-100 flex-fill">
                <Card.Img variant="top" src={handicraft.image} style={{ height: '200px', objectFit: 'cover' }} />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fs-6">{handicraft.title}</Card.Title>
                  <Card.Text className="fw-bold text-primary mb-3">{handicraft.price}</Card.Text>
                  <div className="mt-auto d-grid gap-2">
                    <Button variant="primary" onClick={() => addToCart(handicraft)}>Add to Cart</Button>
                    <Button variant="outline-secondary" onClick={() => viewDetails(handicraft)}>View Details</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
       {/* Featured Collection Section */}
       <section className="my-5">
        <h2>Featured Collection</h2>
        <Row className="my-4">
          {featuredCollection.map((product) => (
            <Col sm={6} md={4} lg={3} className="mb-4 d-flex" key={product.id}>
              <Card className="h-100 flex-fill">
                <Card.Img variant="top" src={product.image} style={{ height: '200px', objectFit: 'cover' }} />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fs-6">{product.title}</Card.Title>
                  <Card.Text className="fw-bold text-primary mb-2">{product.price}</Card.Text>
                  <Card.Text className="text-muted small mb-3"><strong>Artist:</strong> {product.artist}</Card.Text>
                  <div className="mt-auto d-grid gap-2">
                    <Button variant="primary" onClick={() => addToCart(product)}>Add to Cart</Button>
                    <Button variant="outline-secondary" onClick={() => viewDetails(product)}>View Details</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

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
