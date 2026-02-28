import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebook, FaInstagram, FaTwitter, FaWhatsapp } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowAlert(false);

    try {
      const response = await axios.post('https://handicraft-website.onrender.com/api/contacts', formData);
      setResponseMessage('Message sent successfully! We will get back to you soon.');
      setShowAlert(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      setResponseMessage('There was an error submitting your message. Please try again.');
      setShowAlert(true);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      {/* Header Section */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-3">Get in Touch</h1>
        <p className="lead text-muted">
          Have questions about our Pattachitra art? Want to visit our workshop? 
          We'd love to hear from you!
        </p>
      </div>

      {showAlert && (
        <Alert 
          variant={responseMessage.includes('success') ? 'success' : 'danger'} 
          className="mb-4"
          onClose={() => setShowAlert(false)}
          dismissible
        >
          {responseMessage}
        </Alert>
      )}

      <Row>
        {/* Contact Form */}
        <Col lg={8} className="mb-4 mb-lg-0">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4">
              <h4 className="mb-4">Send us a Message</h4>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Your Name *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="John Doe"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-control-lg"
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Email Address *</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="john@example.com"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-control-lg"
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="+91 98765 43210"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-control-lg"
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="How can we help you?"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="form-control-lg"
                    />
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label>Your Message *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="Tell us about your interest in Pattachitra art, custom orders, or workshop visits..."
                    required
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="form-control-lg"
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  size="lg"
                  disabled={isSubmitting}
                  className="px-5"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Contact Information */}
        <Col lg={4}>
          <div className="space-y-4">
            {/* Visit Our Workshop */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="feature-icon me-3">
                    <FaMapMarkerAlt />
                  </div>
                  <h5 className="mb-0">Visit Our Workshop</h5>
                </div>
                <p className="text-muted mb-2">
                  <strong>Handicraft Hub</strong><br />
                  Raghurajpur Heritage Village<br />
                  Puri, Odisha - 752012<br />
                  India
                </p>
                <Button variant="outline-primary" size="sm" className="w-100">
                  Get Directions
                </Button>
              </Card.Body>
            </Card>

            {/* Contact Information */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="feature-icon me-3">
                    <FaPhone />
                  </div>
                  <h5 className="mb-0">Call Us</h5>
                </div>
                <p className="text-muted mb-2">
                  <strong>Phone:</strong> +91 70084 12345<br />
                  <strong>WhatsApp:</strong> +91 70084 12345
                </p>
                <Button variant="outline-success" size="sm" className="w-100">
                  <FaWhatsapp className="me-2" />
                  WhatsApp Us
                </Button>
              </Card.Body>
            </Card>

            {/* Email */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="feature-icon me-3">
                    <FaEnvelope />
                  </div>
                  <h5 className="mb-0">Email Us</h5>
                </div>
                <p className="text-muted mb-2">
                  <strong>General:</strong> info@handicrafthub.com<br />
                  <strong>Orders:</strong> orders@handicrafthub.com<br />
                  <strong>Support:</strong> support@handicrafthub.com
                </p>
                <Button variant="outline-info" size="sm" className="w-100">
                  Send Email
                </Button>
              </Card.Body>
            </Card>

            {/* Working Hours */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="feature-icon me-3">
                    <FaClock />
                  </div>
                  <h5 className="mb-0">Working Hours</h5>
                </div>
                <p className="text-muted mb-0">
                  <strong>Monday - Saturday:</strong> 9:00 AM - 6:00 PM<br />
                  <strong>Sunday:</strong> 10:00 AM - 4:00 PM<br />
                  <small className="text-primary">Workshop visits by appointment only</small>
                </p>
              </Card.Body>
            </Card>

            {/* Social Media */}
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="mb-3">Follow Us</h5>
                <p className="text-muted small mb-3">
                  Stay updated with our latest Pattachitra artworks and artisan stories
                </p>
                <div className="d-flex gap-2">
                  <Button variant="primary" size="sm" className="flex-fill">
                    <FaFacebook />
                  </Button>
                  <Button variant="danger" size="sm" className="flex-fill">
                    <FaInstagram />
                  </Button>
                  <Button variant="info" size="sm" className="flex-fill">
                    <FaTwitter />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;
