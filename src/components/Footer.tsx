import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-white text-center py-4">
      <Container>
        <Row>
          <Col sm={12} md={6} className="mb-3 mb-md-0">
            <p>© 2024 Handicraft Hub | All Rights Reserved</p>
          </Col>
          <Col sm={12} md={6}>
            <div>
              <Button
                variant="link"
                href="/privacy-policy"
                className="text-white mx-2"
              >
                Privacy Policy
              </Button>
              <Button
                variant="link"
                href="/terms"
                className="text-white mx-2"
              >
                Terms & Conditions
              </Button>
            </div>
          </Col>
        </Row>

        {/* Social Media Icons */}
        <Row className="mt-3">
          <Col>
            <a href="https://www.facebook.com" className="text-white mx-2">
              <FaFacebookF size={24} />
            </a>
            <a href="https://www.instagram.com" className="text-white mx-2">
              <FaInstagram size={24} />
            </a>
            <a href="https://www.twitter.com" className="text-white mx-2">
              <FaTwitter size={24} />
            </a>
            <a href="https://www.linkedin.com" className="text-white mx-2">
              <FaLinkedinIn size={24} />
            </a>
          </Col>
        </Row>

        {/* Newsletter Signup */}
        <Row className="mt-4">
          <Col>
            <h5>Stay Connected</h5>
            <p>Sign up for our newsletter to receive updates and special offers.</p>
            <Button variant="outline-light">Subscribe</Button>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
