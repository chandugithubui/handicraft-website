import React from 'react';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaAward, FaHandSparkles, FaUsers, FaCertificate, FaMapMarkerAlt, FaPalette } from 'react-icons/fa';

const About = () => {
  return (
    <Container className="my-5">
      {/* Hero Section */}
      <Row className="text-center mb-5">
        <Col>
          <div className="hero-section rounded-3 p-5">
            <h1 className="display-4 fw-bold mb-3">Handicraft Hub</h1>
            <p className="lead">
              Preserving the centuries-old tradition of Pattachitra art from Raghurajpur, Puri
            </p>
            <div className="mt-4 d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <Badge bg="warning" text="dark" className="p-2">
                <FaMapMarkerAlt className="me-1" /> Raghurajpur Heritage Village
              </Badge>
              <Badge bg="info" className="p-2">
                <FaCertificate className="me-1" /> Authentic Artisans
              </Badge>
            </div>
          </div>
        </Col>
      </Row>

      {/* Mission Section */}
      <Row className="bg-light py-4 mb-5 rounded-3">
        <Col md={6}>
          <h3 className="mb-3">
            <FaHandSparkles className="text-primary me-2" />
            Our Mission
          </h3>
          <p className="text-muted">
            At Handicraft Hub, we are dedicated to preserving and promoting the rich cultural heritage 
            of Raghurajpur's traditional Pattachitra paintings. We provide a global platform for the 
            skilled artisans of this heritage village, ensuring their centuries-old craft continues to 
            thrive in the modern world.
          </p>
        </Col>
        <Col md={6}>
          <h3 className="mb-3">
            <FaAward className="text-primary me-2" />
            Why Choose Us?
          </h3>
          <ul className="text-muted">
            <li><strong>100% Authentic:</strong> Genuine Pattachitra art directly from Raghurajpur artisans</li>
            <li><strong>Fair Trade:</strong> Ensuring fair wages and sustainable livelihoods for artists</li>
            <li><strong>Certificate of Authenticity:</strong> Every piece comes with verified documentation</li>
            <li><strong>Cultural Preservation:</strong> Supporting the continuation of 500+ years of tradition</li>
          </ul>
          <Link to="/products">
            <Button variant="primary" className="mt-3">
              Explore Our Collection
            </Button>
          </Link>
        </Col>
      </Row>

      {/* Raghurajpur Heritage */}
      <Row className="mb-5">
        <Col>
          <h3 className="text-center mb-4">
            <FaMapMarkerAlt className="text-primary me-2" />
            Raghurajpur: The Heritage Village
          </h3>
          <Row>
            <Col md={6}>
              <p className="text-muted">
                Raghurajpur, a picturesque heritage village in Puri district of Odisha, is renowned worldwide 
                for its master Pattachitra artists. This village has been the cradle of traditional Odishan art 
                for over 500 years, with every family engaged in some form of craft or art.
              </p>
              <p className="text-muted">
                The village was declared a heritage village by the Indian National Trust for Art and Cultural 
                Heritage (INTACH) and has been recognized by UNESCO for its contribution to preserving traditional 
                art forms. Here, art is not just a profession but a way of life, passed down through generations.
              </p>
            </Col>
            <Col md={6}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <h5 className="mb-3">Village Highlights</h5>
                  <ul className="text-muted">
                    <li>Over 100 families of traditional artists</li>
                    <li>500+ years of uninterrupted artistic tradition</li>
                    <li>National award-winning artisans</li>
                    <li>Government recognized heritage craft village</li>
                    <li>Living museum of Odishan art and culture</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Meet the Artisans */}
      <Row className="mb-5">
        <Col>
          <h3 className="text-center mb-4">
            <FaUsers className="text-primary me-2" />
            Meet Our Master Artisans
          </h3>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Img 
                  variant="top" 
                  src="/images/artisan1.jpg" 
                  alt="Master Artisan"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <h5>Raghunath Moharana</h5>
                  <p className="text-muted small">National Award Winner | 35+ Years Experience</p>
                  <p className="text-muted">
                    A master of traditional Pattachitra, specializing in mythological themes and temple art forms.
                  </p>
                  <Badge bg="success" className="artisan-badge">
                    <FaAward className="me-1" /> Master Artisan
                  </Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Img 
                  variant="top" 
                  src="/images/artisan2.jpg" 
                  alt="Lady Artisan"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <h5>Sushila Maharana</h5>
                  <p className="text-muted small">State Award Winner | 20+ Years Experience</p>
                  <p className="text-muted">
                    Known for her intricate detailing and vibrant color compositions in traditional Pattachitra.
                  </p>
                  <Badge bg="info" className="artisan-badge">
                    <FaPalette className="me-1" /> Color Specialist
                  </Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Img 
                  variant="top" 
                  src="/images/artisan3.jpg" 
                  alt="Young Artisan"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <h5>Prakash Das</h5>
                  <p className="text-muted small">Emerging Artist | 8+ Years Experience</p>
                  <p className="text-muted">
                    Young talent bringing contemporary themes to traditional Pattachitra techniques.
                  </p>
                  <Badge bg="warning" text="dark" className="artisan-badge">
                    <FaHandSparkles className="me-1" /> Rising Star
                  </Badge>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Authenticity Certificate */}
      <Row className="bg-primary text-white py-5 mb-5 rounded-3">
        <Col>
          <h3 className="text-center mb-4">
            <FaCertificate className="me-2" />
            Certificate of Authenticity
          </h3>
          <Row>
            <Col md={8} className="mx-auto text-center">
              <p className="lead mb-4">
                Every Pattachitra painting from Handicraft Hub comes with a verified Certificate of Authenticity
              </p>
              <Row className="text-start">
                <Col md={6}>
                  <h6>What's Included:</h6>
                  <ul>
                    <li>Artisan verification and bio</li>
                    <li>Artwork creation date</li>
                    <li>Traditional techniques used</li>
                    <li>Materials and pigments details</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h6>Quality Assurance:</h6>
                  <ul>
                    <li>100% handmade verification</li>
                    <li>Traditional process compliance</li>
                    <li>Artisan direct sourcing</li>
                    <li>Heritage craft authentication</li>
                  </ul>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Traditional Process */}
      <Row className="mb-5">
        <Col>
          <h3 className="text-center mb-4">The Traditional Pattachitra Process</h3>
          <Row>
            <Col md={3} className="text-center mb-4">
              <div className="feature-icon">
                <span>1</span>
              </div>
              <h6>Canvas Preparation</h6>
              <p className="text-muted small">
                Hand-prepared canvas using dried palm leaves or cotton fabric with natural adhesives
              </p>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="feature-icon">
                <span>2</span>
              </div>
              <h6>Natural Colors</h6>
              <p className="text-muted small">
                Colors made from natural sources - conch shells, minerals, and vegetable extracts
              </p>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="feature-icon">
                <span>3</span>
              </div>
              <h6>Outline Drawing</h6>
              <p className="text-muted small">
                Intricate outlines drawn with fine brushes made from animal hair
              </p>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="feature-icon">
                <span>4</span>
              </div>
              <h6>Filling & Finishing</h6>
              <p className="text-muted small">
                Careful color filling and final touches with traditional techniques
              </p>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Impact Section */}
      <Row className="bg-light py-4 mb-5 rounded-3">
        <Col className="text-center">
          <h3 className="mb-4">Our Impact</h3>
          <Row>
            <Col md={3}>
              <h2 className="text-primary">150+</h2>
              <p className="text-muted">Artisans Supported</p>
            </Col>
            <Col md={3}>
              <h2 className="text-primary">5000+</h2>
              <p className="text-muted">Artworks Sold</p>
            </Col>
            <Col md={3}>
              <h2 className="text-primary">25+</h2>
              <p className="text-muted">Countries Reached</p>
            </Col>
            <Col md={3}>
              <h2 className="text-primary">15+</h2>
              <p className="text-muted">Years of Service</p>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Call to Action */}
      <Row className="text-center">
        <Col>
          <h3 className="mb-3">Support Traditional Art, Preserve Cultural Heritage</h3>
          <p className="text-muted mb-4">
            Every purchase you make helps preserve the centuries-old tradition of Pattachitra art 
            and supports the livelihoods of skilled artisans in Raghurajpur.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <Link to="/products">
              <Button variant="primary" size="lg">
                Shop Authentic Art
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline-primary" size="lg">
                Visit Our Workshop
              </Button>
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default About;
