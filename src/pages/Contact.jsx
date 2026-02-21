import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import axios from 'axios'; // Import axios for making API requests
import './Contact.css'; // Import the custom CSS file for styling

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  // Handle input field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:5000/api/contacts', formData);
      setResponseMessage('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' }); // Clear form after submission
    } catch (error) {
      setResponseMessage('There was an error submitting your message. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="contact-heading">Contact Us</h2>
      <Row>
        {/* Left Column - Contact Form */}
        <Col md={6}>
          <Card className="contact-form-card">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="name">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your name"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group controlId="email" className="mt-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group controlId="message" className="mt-3">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Your message"
                    required
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Button variant="success" type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </Form>
              {responseMessage && <p className="response-message">{responseMessage}</p>}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Contact Info (Address, Social Media, etc.) */}
        <Col md={6}>
          <Card className="contact-info-card">
            <Card.Body>
              <h4>Our Location</h4>
              <p><strong>Handicraft Hub</strong></p>
              <p>Address: XYZ Street, ABC City, 12345</p>
              <p>Phone: +1 (123) 456-7890</p>
              <p>Email: contact@handicrafthub.com</p>

              <h4>Follow Us</h4>
              <p>Stay connected with us on social media:</p>
              <ul>
                <li><a href="https://facebook.com/HandicraftHub" target="_blank" rel="noopener noreferrer">Facebook: @HandicraftHub</a></li>
                <li><a href="https://instagram.com/HandicraftHub" target="_blank" rel="noopener noreferrer">Instagram: @HandicraftHub</a></li>
                <li><a href="https://twitter.com/HandicraftHub" target="_blank" rel="noopener noreferrer">Twitter: @HandicraftHub</a></li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;
