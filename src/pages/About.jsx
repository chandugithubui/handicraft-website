import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <Container className="my-5">
      <Row className="text-center mb-4">
        <Col>
          <h2 style={{ color: '#2C3E50' }}>About Handicraft Hub</h2>
          <p style={{ color: '#7F8C8D' }}>Discover the world of exquisite handcrafted products from talented artisans across the country.</p>
        </Col>
      </Row>

      <Row className="bg-light py-4 mb-5">
        <Col md={6}>
          <h3 style={{ color: '#2980B9' }}>Our Mission</h3>
          <p style={{ color: '#7F8C8D' }}>
            At Handicraft Hub, we believe in promoting traditional craftsmanship while providing customers with the highest quality, handmade products.
            We strive to support artisans by creating a platform that celebrates their creativity and hard work, while also bringing timeless pieces to your home.
          </p>
        </Col>
        <Col md={6} className="text-center">
          <h3 style={{ color: '#2980B9' }}>Why Choose Us?</h3>
          <ul style={{ color: '#7F8C8D' }}>
            <li>Authentic Handcrafted Products</li>
            <li>Fair Trade Practices to Support Artisans</li>
            <li>Eco-Friendly and Sustainable Materials</li>
            <li>Customer Satisfaction Guarantee</li>
          </ul>
          <Link to="/contact">
            <Button variant="primary" style={{ backgroundColor: '#2980B9', borderColor: '#2980B9' }}>Get in Touch</Button>
          </Link>
        </Col>
      </Row>

      {/* Adding a History section */}
      <Row className="mt-5">
        <Col>
          <h3 style={{ color: '#2980B9' }}>Our Story</h3>
          <p style={{ color: '#7F8C8D' }}>
            Handicraft Hub was founded in 2015 with a vision to create a global platform for artisans to showcase their handcrafted creations. 
            Over the years, we have partnered with hundreds of talented artisans from various regions, ensuring fair wages and working conditions, while preserving the artistry of their cultures.
          </p>
        </Col>
      </Row>

      {/* Adding a section about the artisans */}
      <Row className="mt-5">
        <Col md={6}>
          <h3 style={{ color: '#2980B9' }}>Meet the Artisans</h3>
          <p style={{ color: '#7F8C8D' }}>
            Our artisans are at the heart of Handicraft Hub. Each piece is made with love and dedication, using skills passed down through generations. 
            We work closely with our artisans to ensure that their craft is celebrated and that they receive the recognition and compensation they deserve.
          </p>
        </Col>
        <Col md={6}>
          <img src="../images/path_to_image_of_artisans_working.jpg" alt="Artisans" className="img-fluid rounded" />
        </Col>
      </Row>

      {/* Adding a Core Values section */}
      <Row className="bg-light py-4 mt-5">
        <Col>
          <h3 style={{ color: '#2980B9' }}>Our Core Values</h3>
          <p style={{ color: '#7F8C8D' }}>
            At Handicraft Hub, our values guide every aspect of our work. We are committed to:
          </p>
          <ul style={{ color: '#7F8C8D' }}>
            <li><strong>Integrity:</strong> We uphold honesty and transparency in all our dealings with customers and artisans.</li>
            <li><strong>Quality:</strong> We ensure every product meets the highest standards of craftsmanship and design.</li>
            <li><strong>Empathy:</strong> We care deeply about the well-being of our artisans and their communities.</li>
            <li><strong>Sustainability:</strong> We are dedicated to reducing our environmental impact by using eco-friendly materials and ethical practices.</li>
          </ul>
        </Col>
      </Row>

      {/* Adding an Impact section */}
      <Row className="mt-5">
        <Col>
          <h3 style={{ color: '#2980B9' }}>Our Impact</h3>
          <p style={{ color: '#7F8C8D' }}>
            Since our inception, Handicraft Hub has supported hundreds of artisans by offering them fair wages and a platform to showcase their skills. 
            Through your purchases, we have been able to reinvest in communities, improve the livelihoods of artisans, and preserve traditional crafts.
          </p>
        </Col>
      </Row>

      {/* Adding a Partnerships section */}
      <Row className="mt-5">
        <Col>
          <h3 style={{ color: '#2980B9' }}>Our Partners & Collaborations</h3>
          <p style={{ color: '#7F8C8D' }}>
            We are proud to collaborate with organizations and brands that share our vision of promoting sustainable craftsmanship. 
            Our partners help amplify the reach of our artisans and ensure that their work is celebrated worldwide.
          </p>
          {/* Example: Add logos or mention partnerships */}
        </Col>
      </Row>

      {/* Adding a Vision for the Future section */}
      <Row className="bg-light py-4 mt-5">
        <Col>
          <h3 style={{ color: '#2980B9' }}>Vision for the Future</h3>
          <p style={{ color: '#7F8C8D' }}>
            Looking ahead, Handicraft Hub aims to become a global leader in promoting sustainable, handcrafted products. 
            We envision a future where more artisans from underrepresented communities have access to markets, and where the value of traditional craftsmanship is recognized worldwide.
          </p>
        </Col>
      </Row>

      {/* Adding a testimonial section */}
      <Row className="mt-5">
        <Col>
          <h3 style={{ color: '#2980B9' }}>What Our Customers Say</h3>
          <blockquote style={{ borderLeft: '4px solid #2980B9', paddingLeft: '16px', fontStyle: 'italic', color: '#7F8C8D' }}>
            "The handcrafted jewelry I purchased was absolutely stunning. I love knowing that it supports local artisans. The quality and design are unmatched!" 
            — Emily R.
          </blockquote>
        </Col>
      </Row>
    </Container>
  );
};

export default About;
