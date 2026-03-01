import React from 'react';
import ProductList from '../components/ProductList'; // Import ProductList component
import PattachitraSlider from '../components/PattachitraSlider'; // Import the PattachitraSlider
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FaHandSparkles, FaAward, FaTruck, FaShieldAlt, FaEye, FaShoppingCart } from 'react-icons/fa';

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="hero-section text-white">
        <Container>
          <Row className="align-items-center min-vh-50">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Authentic Pattachitra Art from Raghurajpur
              </h1>
              <p className="lead mb-4">
                Discover centuries-old traditional paintings handcrafted by master artisans 
                from the heritage village of Raghurajpur, Puri. Each piece tells a story 
                of Odisha's rich cultural heritage.
              </p>
              <div className="d-flex gap-3 mb-4">
                <Button variant="light" size="lg" href="#products">
                  Explore Collection
                </Button>
                <Button variant="outline-light" size="lg" href="#about">
                  Learn More
                </Button>
              </div>
              <div className="d-flex gap-3">
                <Badge bg="success" className="p-2">
                  <FaAward className="me-1" /> Authentic Artisans
                </Badge>
                <Badge bg="info" className="p-2">
                  <FaShieldAlt className="me-1" /> Certified Art
                </Badge>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Pattachitra Slider */}
      <Container className="py-4">
        <PattachitraSlider />
      </Container>

      {/* Our Handicraft Collection Section */}
      <Container className="py-5">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="fw-bold mb-3">Featured Collection</h2>
            <p className="text-muted">Discover our curated selection of authentic Pattachitra art and traditional handicrafts</p>
          </Col>
        </Row>
        
        <Row className="g-4">
          <Col md={6} lg={3} className="d-flex">
            <Card className="border-0 shadow-sm h-100 flex-fill collection-card">
              <div className="position-relative overflow-hidden">
                <Card.Img 
                  variant="top" 
                  src="/images/pattachitrawall.jpg" 
                  style={{ height: '250px', objectFit: 'cover' }}
                  className="collection-img"
                />
                <div className="collection-overlay">
                  <Badge bg="danger" className="position-absolute top-0 end-0 m-2">New</Badge>
                </div>
              </div>
              <Card.Body className="d-flex flex-column">
                <Card.Title className="h5">Pattachitra Wall Art</Card.Title>
                <Card.Text className="text-muted flex-grow-1">
                  Traditional wall paintings depicting mythological stories and cultural heritage.
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center mt-auto">
                  <span className="h5 text-primary mb-0">₹2,500</span>
                  <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm">
                      <FaEye className="me-1" /> View
                    </Button>
                    <Button variant="primary" size="sm">
                      <FaShoppingCart className="me-1" /> Add
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6} lg={3} className="d-flex">
            <Card className="border-0 shadow-sm h-100 flex-fill collection-card">
              <div className="position-relative overflow-hidden">
                <Card.Img 
                  variant="top" 
                  src="/images/handmadevase.webp" 
                  style={{ height: '250px', objectFit: 'cover' }}
                  className="collection-img"
                />
                <div className="collection-overlay">
                  <Badge bg="success" className="position-absolute top-0 end-0 m-2">Popular</Badge>
                </div>
              </div>
              <Card.Body className="d-flex flex-column">
                <Card.Title className="h5">Handcrafted Vase</Card.Title>
                <Card.Text className="text-muted flex-grow-1">
                  Elegant terracotta vase with intricate Pattachitra designs for home decor.
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center mt-auto">
                  <span className="h5 text-primary mb-0">₹1,200</span>
                  <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm">
                      <FaEye className="me-1" /> View
                    </Button>
                    <Button variant="primary" size="sm">
                      <FaShoppingCart className="me-1" /> Add
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6} lg={3} className="d-flex">
            <Card className="border-0 shadow-sm h-100 flex-fill collection-card">
              <div className="position-relative overflow-hidden">
                <Card.Img 
                  variant="top" 
                  src="/images/teapot.webp" 
                  style={{ height: '250px', objectFit: 'cover' }}
                  className="collection-img"
                />
              </div>
              <Card.Body className="d-flex flex-column">
                <Card.Title className="h5">Teapot Painting</Card.Title>
                <Card.Text className="text-muted flex-grow-1">
                  Hand-painted ceramic teapot featuring traditional Pattachitra art motifs.
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center mt-auto">
                  <span className="h5 text-primary mb-0">₹800</span>
                  <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm">
                      <FaEye className="me-1" /> View
                    </Button>
                    <Button variant="primary" size="sm">
                      <FaShoppingCart className="me-1" /> Add
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6} lg={3} className="d-flex">
            <Card className="border-0 shadow-sm h-100 flex-fill collection-card">
              <div className="position-relative overflow-hidden">
                <Card.Img 
                  variant="top" 
                  src="/images/carvedwooden.jpg" 
                  style={{ height: '250px', objectFit: 'cover' }}
                  className="collection-img"
                />
                <div className="collection-overlay">
                  <Badge bg="warning" className="position-absolute top-0 end-0 m-2">Limited</Badge>
                </div>
              </div>
              <Card.Body className="d-flex flex-column">
                <Card.Title className="h5">Wooden Sculpture</Card.Title>
                <Card.Text className="text-muted flex-grow-1">
                  Intricately carved teak wood sculpture showcasing traditional craftsmanship.
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center mt-auto">
                  <span className="h5 text-primary mb-0">₹1,800</span>
                  <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm">
                      <FaEye className="me-1" /> View
                    </Button>
                    <Button variant="primary" size="sm">
                      <FaShoppingCart className="me-1" /> Add
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row className="text-center mt-5">
          <Col>
            <Button variant="outline-primary" size="lg" href="#products">
              View All Products
            </Button>
          </Col>
        </Row>
      </Container>

      {/* Features Section */}
      <Container className="py-5">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="fw-bold mb-3">Why Choose Handicraft Hub?</h2>
            <p className="text-muted">Experience the authenticity of traditional Odisha art</p>
          </Col>
        </Row>
        
        <Row className="g-4 mb-5">
          <Col md={3} className="d-flex">
            <Card className="border-0 text-center h-100 flex-fill">
              <Card.Body className="d-flex flex-column">
                <div className="feature-icon mb-3">
                  <FaHandSparkles />
                </div>
                <h5>100% Handmade</h5>
                <p className="text-muted small">
                  Every piece is meticulously handcrafted by skilled artisans using traditional techniques
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="d-flex">
            <Card className="border-0 text-center h-100 flex-fill">
              <Card.Body className="d-flex flex-column">
                <div className="feature-icon mb-3">
                  <FaAward />
                </div>
                <h5>Certificate of Authenticity</h5>
                <p className="text-muted small">
                  All artworks come with verified certificates from recognized art institutions
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="d-flex">
            <Card className="border-0 text-center h-100 flex-fill">
              <Card.Body className="d-flex flex-column">
                <div className="feature-icon mb-3">
                  <FaTruck />
                </div>
                <h5>Free Shipping</h5>
                <p className="text-muted small">
                  Complimentary shipping on all orders above ₹999. Safe packaging guaranteed.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="d-flex">
            <Card className="border-0 text-center h-100 flex-fill">
              <Card.Body className="d-flex flex-column">
                <div className="feature-icon mb-3">
                  <FaShieldAlt />
                </div>
                <h5>Artisan Support</h5>
                <p className="text-muted small">
                  Direct support to Raghurajpur artisans. Fair trade practices guaranteed.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Products Section */}
      <Container className="py-4" id="products">
        <ProductList />
      </Container>
    </>
  );
};

export default Home;
