import React, { useState } from 'react';
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiMail } from 'react-icons/fi';
import './FooterNew.css';

const FooterNew = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Newsletter subscription logic would go here
    setEmail('');
    alert('Thank you for subscribing!');
  };

  const footerLinks = {
    shop: [
      { label: 'All Products', path: '/products' },
      { label: 'Categories', path: '/category/all' },
      { label: 'Best Sellers', path: '/products?sort=bestseller' },
      { label: 'New Arrivals', path: '/products?sort=newest' },
      { label: 'Offers', path: '/products?sort=discount' },
    ],
    customerService: [
      { label: 'Contact Us', path: '/contact' },
      { label: 'Track Order', path: '/track-order' },
      { label: 'Shipping Policy', path: '/shipping' },
      { label: 'Returns & Refunds', path: '/returns' },
      { label: 'FAQ', path: '/faq' },
    ],
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Our Artisans', path: '/artisans' },
      { label: 'Careers', path: '/careers' },
      { label: 'Blog', path: '/blog' },
    ],
    legal: [
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms & Conditions', path: '/terms' },
      { label: 'Return Policy', path: '/return-policy' },
      { label: 'Cancellation Policy', path: '/cancellation' },
    ],
  };

  return (
    <footer className="footer">
      {/* Newsletter Section */}
      <div className="footer-newsletter">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h3 className="newsletter-title">Stay Connected</h3>
              <p className="newsletter-description">
                Subscribe to get updates on new arrivals and special offers.
              </p>
            </div>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <div className="newsletter-input-group">
                <FiMail className="newsletter-icon" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                  required
                />
                <button type="submit" className="newsletter-btn">
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-brand">
              <div className="footer-logo">
                <span className="footer-logo-text">Handicraft Hub</span>
              </div>
              <p className="footer-tagline">
                Celebrating Indian craftsmanship and empowering artisans across the country.
              </p>
              <div className="footer-social">
                <button className="social-link" aria-label="Facebook">
                  <FiFacebook />
                </button>
                <button className="social-link" aria-label="Instagram">
                  <FiInstagram />
                </button>
                <button className="social-link" aria-label="Twitter">
                  <FiTwitter />
                </button>
                <button className="social-link" aria-label="YouTube">
                  <FiYoutube />
                </button>
              </div>
            </div>

            {/* Shop Links */}
            <div className="footer-links-column">
              <h4 className="footer-heading">Shop</h4>
              <ul className="footer-links">
                {footerLinks.shop.map((link, index) => (
                  <li key={index}>
                    <a href={link.path} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service Links */}
            <div className="footer-links-column">
              <h4 className="footer-heading">Customer Service</h4>
              <ul className="footer-links">
                {footerLinks.customerService.map((link, index) => (
                  <li key={index}>
                    <a href={link.path} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div className="footer-links-column">
              <h4 className="footer-heading">Company</h4>
              <ul className="footer-links">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a href={link.path} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className="footer-links-column">
              <h4 className="footer-heading">Legal</h4>
              <ul className="footer-links">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a href={link.path} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {new Date().getFullYear()} Handicraft Hub | All Rights Reserved
            </p>
            <div className="footer-payment-methods">
              <span className="payment-method">Visa</span>
              <span className="payment-method">Mastercard</span>
              <span className="payment-method">UPI</span>
              <span className="payment-method">Razorpay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterNew;
