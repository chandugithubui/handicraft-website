
import { Link } from 'react-router-dom';
import {
  FiFileText,
  FiUser,
  FiShoppingBag,
  FiCreditCard,
  FiTruck,
  FiRefreshCcw,
  FiShield,
  FiAlertCircle,
  FiMail,
  FiArrowRight,
  FiCheckCircle,
} from 'react-icons/fi';

import './TermsConditions.css';

const termsSections = [
  {
    icon: FiUser,
    title: '1. User Accounts',
    description:
      'Users may create an account to access shopping features, manage their profile, and view orders. Account holders are responsible for providing accurate information and keeping their login credentials confidential.',
  },
  {
    icon: FiShoppingBag,
    title: '2. Products & Information',
    description:
      'Handicraft Hub showcases handcrafted products. Product descriptions, images, prices, and availability are provided for shopping purposes. Handmade items may naturally vary in colour, texture, and appearance.',
  },
  {
    icon: FiCreditCard,
    title: '3. Orders & Payments',
    description:
      'Orders are submitted through the checkout process. Available payment options may include Cash on Delivery and a third-party payment gateway in test mode. Order submission does not itself guarantee fulfilment.',
  },
  {
    icon: FiTruck,
    title: '4. Shipping & Delivery',
    description:
      'Shipping availability, charges, and delivery estimates depend on the destination and applicable fulfilment arrangements. Please review the Shipping Policy for additional information.',
  },
  {
    icon: FiRefreshCcw,
    title: '5. Returns & Refunds',
    description:
      'Return, cancellation, and refund requests are subject to the applicable order conditions and review. Please refer to our Returns & Refunds page for general guidance.',
  },
  {
    icon: FiShield,
    title: '6. Privacy & Data',
    description:
      'Information entered into the application may be used to support accounts, shopping, orders, and customer communication. Our Privacy Policy explains the relevant information-handling considerations.',
  },
  {
    icon: FiFileText,
    title: '7. Website Content',
    description:
      'The website design, written content, branding, and other materials may be protected by applicable intellectual property rights. Users should not reproduce protected materials without appropriate permission.',
  },
  {
    icon: FiAlertCircle,
    title: '8. Responsible Website Use',
    description:
      'Users should not attempt unauthorised access, interfere with application functionality, submit harmful content, or misuse website features.',
  },
];

const usageGuidelines = [
  {
    number: '01',
    title: 'Accurate Information',
    description:
      'Provide correct account, contact, and shipping details.',
  },
  {
    number: '02',
    title: 'Secure Account',
    description:
      'Protect your login details and avoid sharing credentials.',
  },
  {
    number: '03',
    title: 'Responsible Shopping',
    description:
      'Review product details and order totals before checkout.',
  },
  {
    number: '04',
    title: 'Contact Support',
    description:
      'Reach out if you encounter an issue with your order.',
  },
];

export default function TermsConditions() {
  return (
    <main className="terms-page">
      {/* Hero Section */}
      <section className="terms-hero">
        <div className="terms-hero-inner">
          <span className="terms-eyebrow">
            <FiFileText aria-hidden="true" />
            WEBSITE INFORMATION
          </span>

          <h1>
            Terms <em>&amp; Conditions</em>
          </h1>

          <p>
            Important information about using Handicraft Hub,
            managing your account, placing orders, and
            accessing our shopping features.
          </p>
        </div>
      </section>

      <section className="terms-container">
        {/* Introduction */}
        <div className="terms-intro">
          <span className="terms-small-label">
            PLEASE READ
          </span>

          <h2>Understanding Our Website Terms</h2>

          <p>
            Handicraft Hub is a MERN-based e-commerce portfolio
            application featuring handcrafted products.
            These draft terms describe expected website usage,
            account responsibilities, and shopping-related
            considerations.
          </p>
        </div>

        {/* Terms Cards */}
        <div className="terms-grid">
          {termsSections.map((section) => {
            const Icon = section.icon;

            return (
              <article
                className="terms-card"
                key={section.title}
              >
                <div className="terms-card-icon">
                  <Icon aria-hidden="true" />
                </div>

                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </article>
            );
          })}
        </div>

        {/* Usage Guidelines */}
        <section className="terms-guidelines">
          <div className="terms-guidelines-heading">
            <span className="terms-small-label">
              GOOD PRACTICES
            </span>

            <h2>Using Handicraft Hub Responsibly</h2>

            <p>
              A few important guidelines to keep in mind
              when using the website.
            </p>
          </div>

          <div className="terms-steps">
            {usageGuidelines.map((item) => (
              <article
                className="terms-step"
                key={item.number}
              >
                <span className="terms-step-number">
                  {item.number}
                </span>

                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Important Notice */}
        <section className="terms-notice">
          <div className="terms-notice-icon">
            <FiAlertCircle aria-hidden="true" />
          </div>

          <div>
            <h2>Important Information</h2>

            <p>
              Handicraft Hub is currently a portfolio and
              development project. Features, product information,
              payment options, and operational arrangements
              may change during development.
            </p>

            <p>
              Before operating the website as a real online
              store, business-specific terms, payment conditions,
              delivery commitments, customer rights, and
              applicable legal requirements must be reviewed.
            </p>
          </div>
        </section>

        {/* Related Policies */}
        <section className="terms-related">
          <div className="terms-related-heading">
            <span className="terms-small-label">
              MORE INFORMATION
            </span>

            <h2>Explore Our Policies</h2>

            <p>
              Find additional information about shipping,
              returns, and privacy.
            </p>
          </div>

          <div className="terms-policy-links">
            <Link to="/shipping" className="terms-policy-link">
              <FiTruck aria-hidden="true" />
              <span>Shipping Policy</span>
              <FiArrowRight aria-hidden="true" />
            </Link>

            <Link to="/returns" className="terms-policy-link">
              <FiRefreshCcw aria-hidden="true" />
              <span>Returns &amp; Refunds</span>
              <FiArrowRight aria-hidden="true" />
            </Link>

            <Link to="/privacy" className="terms-policy-link">
              <FiShield aria-hidden="true" />
              <span>Privacy Policy</span>
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Support */}
        <div className="terms-support">
          <FiCheckCircle aria-hidden="true" />

          <h2>Have Questions About Our Terms?</h2>

          <p>
            If you have questions about website usage,
            your account, or an order, visit our contact page.
          </p>

          <Link
            to="/contact"
            className="terms-contact-btn"
          >
            <FiMail aria-hidden="true" />
            Contact Support
          </Link>
        </div>

        <p className="terms-note">
          Note: These terms are an informational draft for
          the Handicraft Hub portfolio project and are not
          legally reviewed contractual terms. They must be
          adapted to the actual business and applicable laws
          before accepting real customer transactions.
        </p>
      </section>
    </main>
  );
}
