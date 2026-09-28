import React, { useState } from 'react';
import { FiMail, FiMapPin, FiPhone, FiSend, FiMessageSquare, FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';
import { useSubmitContact } from '../hooks/api';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [responseMessage, setResponseMessage] = useState('');
  const submitContactMutation = useSubmitContact();
  const isSubmitting = submitContactMutation.isPending;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitContactMutation.mutateAsync(formData);
      setResponseMessage('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error: any) {
      setResponseMessage(error?.message || 'There was an error submitting your message. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="hero-background">
          <img src="/images/homepagedesign.png" alt="Handicraft background" className="hero-bg-image" />
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Connect With Us</h1>
            <p className="hero-subtitle">
              Every conversation begins a new story. Reach out to us and let's create something beautiful together.
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="contact-layout">
          {/* Contact Form */}
          <div className="contact-form-section">
            <div className="form-card">
              <div className="form-header">
                <div className="form-icon">
                  <FiSend />
                </div>
                <h2 className="form-title">Send us a Message</h2>
                <p className="form-subtitle">We'd love to hear from you. Fill out the form below.</p>
              </div>

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Your Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="form-input form-textarea"
                    required
                    placeholder="How can we help you?"
                    rows={6}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  <FiSend className="btn-icon" />
                </button>

                {responseMessage && (
                  <div className={`response-message ${responseMessage.includes('success') ? 'success' : 'error'}`}>
                    {responseMessage}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="contact-info-section">
            <div className="info-card">
              <div className="info-header">
                <h2 className="info-title">Get in Touch</h2>
                <p className="info-subtitle">We're here to help you</p>
              </div>

              <div className="info-items">
                <div className="info-item">
                  <div className="info-icon">
                    <FiMapPin />
                  </div>
                  <div className="info-content">
                    <h3 className="info-label">Our Location</h3>
                    <p className="info-text">Handicraft Hub HQ</p>
                    <p className="info-text">Craft Street, Artisan District</p>
                    <p className="info-text">Mumbai, Maharashtra 400001</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <FiMail />
                  </div>
                  <div className="info-content">
                    <h3 className="info-label">Email Us</h3>
                    <p className="info-text">support@handicrafthub.com</p>
                    <p className="info-text">orders@handicrafthub.com</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <FiPhone />
                  </div>
                  <div className="info-content">
                    <h3 className="info-label">Call Us</h3>
                    <p className="info-text">+91 98765 43210</p>
                    <p className="info-text">Mon - Sat, 9am - 6pm IST</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="social-section">
                <h3 className="social-title">Follow Our Journey</h3>
                <div className="social-links">
                  <a href="https://facebook.com/HandicraftHub" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                    <FiFacebook />
                  </a>
                  <a href="https://instagram.com/HandicraftHub" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                    <FiInstagram />
                  </a>
                  <a href="https://twitter.com/HandicraftHub" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
                    <FiTwitter />
                  </a>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="support-card">
              <div className="support-icon">
                <FiMessageSquare />
              </div>
              <h3 className="support-title">Need Quick Help?</h3>
              <p className="support-text">
                Check our FAQ section for instant answers about orders, shipping, returns, and more.
              </p>
              <a href="/faq" className="btn btn-outline support-btn">Visit FAQ</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
