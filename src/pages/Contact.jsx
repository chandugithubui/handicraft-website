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
      await axios.post('https://handicraft-website.onrender.com/api/contacts', formData);
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
    <Container className="py-5 contact-page">
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
          className="mb-4 contact-alert"
          onClose={() => setShowAlert(false)}
          dismissible
        >
          {responseMessage}
        </Alert>
      )}

      <Row>
        {/* Contact Form */}
        <Col lg={8} className="mb-4 mb-lg-0">
          <Card className="border-0 shadow-sm h-100 contact-form-card">
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
                      className="form-control-lg contact-input"
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
                      className="form-control-lg contact-input"
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
                      className="form-control-lg contact-input"
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
                      className="form-control-lg contact-input"
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
                    className="form-control-lg contact-textarea"
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  size="lg"
                  className="w-100 contact-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Contact Information */}
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm h-100 contact-info-card">
            <Card.Body className="p-4 text-center contact-info">
              <h4 className="mb-4">Contact Information</h4>
              
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <FaMapMarkerAlt className="text-primary me-3" size={20} />
                  <div>
                    <h5 className="mb-1">Visit Our Workshop</h5>
                    <p className="mb-0">Raghurajpur, Puri District<br />Odisha, India - 752012</p>
                  </div>
                </div>
                
                <div className="d-flex align-items-center mb-3">
                  <FaPhone className="text-primary me-3" size={20} />
                  <div>
                    <h5 className="mb-1">Call Us</h5>
                    <p className="mb-0">+91 98765 43210</p>
                  </div>
                </div>
                
                <div className="d-flex align-items-center mb-4">
                  <FaEnvelope className="text-primary me-3" size={20} />
                  <div>
                    <h5 className="mb-1">Email Us</h5>
                    <p className="mb-0">handicraft@example.com</p>
                  </div>
                </div>
                
                <div className="d-flex align-items-center mb-4">
                  <FaClock className="text-primary me-3" size={20} />
                  <div>
                    <h5 className="mb-1">Working Hours</h5>
                    <p className="mb-0">Mon - Sat: 9:00 AM - 6:00 PM<br />Sunday: Closed</p>
                  </div>
                </div>
              </div>

              <div className="social-links text-center">
                <h5 className="mb-3">Follow Us</h5>
                <div className="d-flex justify-content-center gap-3">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    <FaFacebook size={24} className="text-primary" />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    <FaInstagram size={24} className="text-danger" />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    <FaTwitter size={24} className="text-info" />
                  </a>
                  <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="social-link">
                    <FaWhatsapp size={24} className="text-success" />
                  </a>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;
