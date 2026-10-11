
import { Link } from 'react-router-dom';
import {
  FiShield,
  FiUser,
  FiShoppingBag,
  FiCreditCard,
  FiLock,
  FiDatabase,
  FiMail,
  FiSettings,
  FiArrowRight,
} from 'react-icons/fi';

import './PrivacyPolicy.css';

const privacySections = [
  {
    icon: FiUser,
    title: 'Information You Provide',
    description:
      'When you register, update your profile, or contact us, you may provide details such as your name, email address, phone number, and other information entered into our forms.',
  },
  {
    icon: FiShoppingBag,
    title: 'Orders & Delivery Information',
    description:
      'When placing an order, you may provide delivery details, including a shipping address and contact information. Order records may also contain purchased products, quantities, and order totals.',
  },
  {
    icon: FiCreditCard,
    title: 'Payment Information',
    description:
      'Our checkout may offer cash on delivery or integration with a third-party payment provider such as Razorpay. Payment-related information may be processed by the provider according to its own privacy practices. The payment integration is currently intended for testing.',
  },
  {
    icon: FiLock,
    title: 'Account Authentication',
    description:
      'Handicraft Hub uses account authentication to manage signed-in sessions and access to account-related features. Authentication tokens and related account data should be handled securely.',
  },
  {
    icon: FiDatabase,
    title: 'Data Storage',
    description:
      'Account, product, and order information may be stored in the application database. Some shopping preferences, such as cart-related information, may also be stored locally in your browser.',
  },
  {
    icon: FiSettings,
    title: 'How Information Is Used',
    description:
      'Information may be used to provide account access, display order history, manage shopping features, respond to support requests, and operate the application.',
  },
];

const privacyPrinciples = [
  {
    number: '01',
    title: 'Transparency',
    description:
      'Explain what information the application collects and how it is used.',
  },
  {
    number: '02',
    title: 'Account Access',
    description:
      'Provide authenticated access to relevant account and order information.',
  },
  {
    number: '03',
    title: 'User Requests',
    description:
      'Provide a contact channel for questions about personal information.',
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="privacy-page">
      <section className="privacy-hero">
        <div className="privacy-hero-inner">
          <span className="privacy-eyebrow">
            <FiShield aria-hidden="true" />
            YOUR INFORMATION MATTERS
          </span>

          <h1>
            Privacy <em>Policy</em>
          </h1>

          <p>
            Learn what information Handicraft Hub may collect,
            how it supports your shopping experience, and
            where to ask questions about your data.
          </p>
        </div>
      </section>

      <section className="privacy-container">
        <div className="privacy-intro">
          <span className="privacy-small-label">
            PRIVACY & TRANSPARENCY
          </span>

          <h2>Understanding Your Information</h2>

          <p>
            Handicraft Hub is a MERN-based e-commerce portfolio
            application. This page describes the types of
            information involved in its account, shopping,
            checkout, and order-management features.
          </p>
        </div>

        <div className="privacy-grid">
          {privacySections.map((section) => {
            const Icon = section.icon;

            return (
              <article
                className="privacy-card"
                key={section.title}
              >
                <div className="privacy-card-icon">
                  <Icon aria-hidden="true" />
                </div>

                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </article>
            );
          })}
        </div>

        <section className="privacy-principles">
          <div className="privacy-principles-heading">
            <span className="privacy-small-label">
              OUR APPROACH
            </span>

            <h2>Important Privacy Considerations</h2>

            <p>
              These principles guide how privacy-related
              features should be designed and maintained.
            </p>
          </div>

          <div className="privacy-steps">
            {privacyPrinciples.map((principle) => (
              <article
                className="privacy-step"
                key={principle.number}
              >
                <span className="privacy-step-number">
                  {principle.number}
                </span>

                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="privacy-notice">
          <div className="privacy-notice-icon">
            <FiShield aria-hidden="true" />
          </div>

          <div>
            <h2>Security & Third-Party Services</h2>

            <p>
              The application uses services that may include
              MongoDB Atlas, deployment providers, and payment
              integrations. Each service has its own security
              responsibilities and privacy practices.
            </p>

            <p>
              No internet-based system can guarantee absolute
              security. Before operating this project as a
              real store, its authentication, payment handling,
              access controls, data retention, and deployment
              configuration should be reviewed.
            </p>
          </div>
        </section>

        <div className="privacy-account">
          <div>
            <span className="privacy-small-label">
              YOUR ACCOUNT
            </span>

            <h2>Manage Your Account Information</h2>

            <p>
              Visit your account dashboard to review
              available profile and order information.
            </p>
          </div>

          <Link
            to="/user/dashboard"
            className="privacy-account-btn"
          >
            My Account
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="privacy-support">
          <FiMail aria-hidden="true" />

          <h2>Have a Privacy Question?</h2>

          <p>
            Contact us if you have questions about
            information entered into the application
            or its privacy-related features.
          </p>

          <Link
            to="/contact"
            className="privacy-contact-btn"
          >
            Contact Support
          </Link>
        </div>

        <p className="privacy-note">
          Note: This is an informational draft for the
          Handicraft Hub portfolio project, not a complete
          legally reviewed privacy notice. Before processing
          real customer data, the policy must be updated
          to reflect verified data collection, third-party
          sharing, retention periods, user rights, and
          applicable legal requirements.
        </p>
      </section>
    </main>
  );
}
