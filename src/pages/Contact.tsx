
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiMail,
  FiMapPin,
  FiPhone,
  FiSend,
  FiMessageSquare,
  FiFacebook,
  FiInstagram,
  FiTwitter,
} from 'react-icons/fi';
import { useSubmitContact } from '../hooks/api';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [responseMessage, setResponseMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const submitContactMutation = useSubmitContact();
  const isSubmitting = submitContactMutation.isPending;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setResponseMessage('');
    setSubmitStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      await submitContactMutation.mutateAsync(formData);

      setResponseMessage('Message sent successfully!');
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        message: '',
      });
    } catch (error: any) {
      setResponseMessage(
        error?.message ||
          'There was an error submitting your message. Please try again.'
      );
      setSubmitStatus('error');
      console.error(error);
    }
  };

  return (
    <div className="contact-page">

      {/* ================= CONTACT HERO ================= */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <span className="contact-hero-eyebrow">
            HANDICRAFT HUB · GET IN TOUCH
          </span>

          <h1 className="hero-title">
            Let's Start a
            <span> Conversation.</span>
          </h1>

          <p className="hero-subtitle">
            Have a question about our handmade crafts,
            your order, or something else? We'd love
            to hear from you.
          </p>

          <a href="#contact-form" className="contact-hero-button">
            Send Us a Message <FiSend />
          </a>
        </div>

        <div
          className="contact-hero-decoration"
          aria-hidden="true"
        />
      </section>

      {/* ================= CONTACT CONTENT ================= */}
      <div className="container">
        <div className="contact-layout">

          {/* ================= CONTACT FORM ================= */}
          <div
            className="contact-form-section"
            id="contact-form"
          >
            <div className="form-card">

              <div className="form-header">
                <div className="form-icon">
                  <FiSend />
                </div>

                <div>
                  <h2 className="form-title">
                    Send Us a Message
                  </h2>

                  <p className="form-subtitle">
                    Have something on your mind? Fill out
                    the form and we'll be happy to hear from you.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="contact-form"
              >
                <div className="form-group">
                  <label
                    htmlFor="contact-name"
                    className="form-label"
                  >
                    Your Name
                  </label>

                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    autoComplete="name"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="contact-email"
                    className="form-label"
                  >
                    Email Address
                  </label>

                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    autoComplete="email"
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="contact-message"
                    className="form-label"
                  >
                    Your Message
                  </label>

                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="form-input form-textarea"
                    required
                    placeholder="Tell us how we can help you..."
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
                  <div
                    className={`response-message ${
                      submitStatus === 'success'
                        ? 'success'
                        : 'error'
                    }`}
                    role="status"
                    aria-live="polite"
                  >
                    {responseMessage}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* ================= CONTACT INFORMATION ================= */}
          <div className="contact-info-section">

            <div className="info-card">
              <div className="info-header">
                <h2 className="info-title">
                  Get in Touch
                </h2>

                <p className="info-subtitle">
                  We're here to help with your questions
                  about handmade crafts and orders.
                </p>
              </div>

              <div className="info-items">

                {/* Location */}
                <div className="info-item">
                  <div className="info-icon">
                    <FiMapPin />
                  </div>

                  <div className="info-content">
                    <h3 className="info-label">
                      Our Location
                    </h3>

                    <p className="info-text">
                      Handicraft Hub
                    </p>

                    <p className="info-text">
                      Online Handicrafts Store
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="info-item">
                  <div className="info-icon">
                    <FiMail />
                  </div>

                  <div className="info-content">
                    <h3 className="info-label">
                      Email Us
                    </h3>

                    <p className="info-text">
                      For product and order enquiries,
                      please use the contact form.
                    </p>
                  </div>
                </div>

                {/* Support */}
                <div className="info-item">
                  <div className="info-icon">
                    <FiPhone />
                  </div>

                  <div className="info-content">
                    <h3 className="info-label">
                      Customer Support
                    </h3>

                    <p className="info-text">
                      Have a question? Send us a message
                      and we'll get back to you.
                    </p>
                  </div>
                </div>

              </div>

              {/* ================= SOCIAL MEDIA ================= */}
              <div className="social-section">
                <h3 className="social-title">
                  Follow Our Journey
                </h3>

                <div className="social-links">
                  <a
                    href="https://facebook.com/HandicraftHub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    aria-label="Facebook"
                  >
                    <FiFacebook />
                  </a>

                  <a
                    href="https://instagram.com/HandicraftHub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    aria-label="Instagram"
                  >
                    <FiInstagram />
                  </a>

                  <a
                    href="https://twitter.com/HandicraftHub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    aria-label="Twitter"
                  >
                    <FiTwitter />
                  </a>
                </div>
              </div>
            </div>

            {/* ================= QUICK HELP ================= */}
            <div className="support-card">
              <div className="support-icon">
                <FiMessageSquare />
              </div>

              <h3 className="support-title">
                Need Quick Help?
              </h3>

              <p className="support-text">
                Looking for answers about orders,
                shipping, returns, or handmade products?
                Visit our help section for more information.
              </p>

              <Link
                to="/faq"
                className="btn btn-outline support-btn"
              >
                Explore FAQs
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
