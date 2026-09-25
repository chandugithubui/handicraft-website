import React, { useState } from 'react';
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiYoutube
} from 'react-icons/fi';
import './FooterNew.css';

const FooterNew = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection((current) =>
      current === section ? null : section
    );
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

      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">

            {/* Brand Column */}
            <div className="footer-brand">
              <div className="footer-logo">
                <span className="footer-logo-text">
                  Handicraft Hub
                </span>
              </div>

              <p className="footer-tagline">
                Celebrating Indian craftsmanship and empowering
                artisans across the country.
              </p>

              <div className="footer-social">
                <button
                  className="social-link"
                  aria-label="Facebook"
                  type="button"
                >
                  <FiFacebook />
                </button>

                <button
                  className="social-link"
                  aria-label="Instagram"
                  type="button"
                >
                  <FiInstagram />
                </button>

                <button
                  className="social-link"
                  aria-label="Twitter"
                  type="button"
                >
                  <FiTwitter />
                </button>

                <button
                  className="social-link"
                  aria-label="YouTube"
                  type="button"
                >
                  <FiYoutube />
                </button>
              </div>
            </div>

            {/* Shop Links */}
            <div
              className={`footer-links-column ${
                openSection === 'shop' ? 'open' : ''
              }`}
            >
              <button
                className="footer-heading footer-accordion-btn"
                onClick={() => toggleSection('shop')}
                type="button"
              >
                <span>Shop</span>

                <span className="footer-accordion-icon">
                  {openSection === 'shop' ? '−' : '+'}
                </span>
              </button>

              <ul className="footer-links">
                {footerLinks.shop.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.path}
                      className="footer-link"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service Links */}
            <div
              className={`footer-links-column ${
                openSection === 'customerService'
                  ? 'open'
                  : ''
              }`}
            >
              <button
                className="footer-heading footer-accordion-btn"
                onClick={() =>
                  toggleSection('customerService')
                }
                type="button"
              >
                <span>Customer Service</span>

                <span className="footer-accordion-icon">
                  {openSection === 'customerService'
                    ? '−'
                    : '+'}
                </span>
              </button>

              <ul className="footer-links">
                {footerLinks.customerService.map(
                  (link, index) => (
                    <li key={index}>
                      <a
                        href={link.path}
                        className="footer-link"
                      >
                        {link.label}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Company Links */}
            <div
              className={`footer-links-column ${
                openSection === 'company' ? 'open' : ''
              }`}
            >
              <button
                className="footer-heading footer-accordion-btn"
                onClick={() => toggleSection('company')}
                type="button"
              >
                <span>Company</span>

                <span className="footer-accordion-icon">
                  {openSection === 'company' ? '−' : '+'}
                </span>
              </button>

              <ul className="footer-links">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.path}
                      className="footer-link"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div
              className={`footer-links-column ${
                openSection === 'legal' ? 'open' : ''
              }`}
            >
              <button
                className="footer-heading footer-accordion-btn"
                onClick={() => toggleSection('legal')}
                type="button"
              >
                <span>Legal</span>

                <span className="footer-accordion-icon">
                  {openSection === 'legal' ? '−' : '+'}
                </span>
              </button>

              <ul className="footer-links">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.path}
                      className="footer-link"
                    >
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
              © {new Date().getFullYear()} Handicraft Hub |
              All Rights Reserved
            </p>

            <div className="footer-payment-methods">
              <span className="payment-method">Visa</span>
              <span className="payment-method">
                Mastercard
              </span>
              <span className="payment-method">UPI</span>
              <span className="payment-method">
                Razorpay
              </span>
            </div>

          </div>
        </div>
      </div>

    </footer>
  );
};

export default FooterNew;