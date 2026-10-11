
import { Link } from 'react-router-dom';
import {
  FiRefreshCcw,
  FiPackage,
  FiCamera,
  FiCreditCard,
  FiXCircle,
  FiHelpCircle,
  FiArrowRight,
  FiCheckCircle,
} from 'react-icons/fi';

import './ReturnsPolicy.css';

const returnSections = [
  {
    icon: FiRefreshCcw,
    title: 'Return Requests',
    description:
      'If you experience an issue with your order, please contact our support team with your order details. Return eligibility depends on the applicable product and order conditions.',
  },
  {
    icon: FiPackage,
    title: 'Product Condition',
    description:
      'When requesting a return, keep the product and its original packaging where possible. Our support team may ask for information about the condition of the item.',
  },
  {
    icon: FiCamera,
    title: 'Damaged or Incorrect Items',
    description:
      'If your order arrives damaged or contains an incorrect item, contact support and provide your order number, a description of the issue, and photographs where available.',
  },
  {
    icon: FiCreditCard,
    title: 'Refund Processing',
    description:
      'Refund eligibility and processing depend on the order status, payment method, and review of the request. Any approved refund arrangements should be communicated to the customer.',
  },
  {
    icon: FiXCircle,
    title: 'Order Cancellations',
    description:
      'Cancellation requests should be submitted as early as possible. Whether an order can be cancelled depends on its current processing and fulfilment status.',
  },
  {
    icon: FiHelpCircle,
    title: 'Need Assistance?',
    description:
      'Our contact page is available for questions about returns, cancellations, damaged products, or refund requests.',
  },
];

const returnSteps = [
  {
    number: '01',
    title: 'Contact Support',
    description: 'Share your order number and explain the issue.',
  },
  {
    number: '02',
    title: 'Provide Details',
    description: 'Include relevant photographs or product details if requested.',
  },
  {
    number: '03',
    title: 'Request Review',
    description: 'The return or refund request can be reviewed for eligibility.',
  },
  {
    number: '04',
    title: 'Receive an Update',
    description: 'Support can communicate the outcome and any next steps.',
  },
];

export default function ReturnsPolicy() {
  return (
    <main className="returns-page">
      <section className="returns-hero">
        <div className="returns-hero-inner">
          <span className="returns-eyebrow">
            <FiRefreshCcw aria-hidden="true" />
            CUSTOMER INFORMATION
          </span>

          <h1>
            Returns <em>&amp; Refunds</em>
          </h1>

          <p>
            Find helpful information about return requests,
            refunds, cancellations, and resolving order issues.
          </p>
        </div>
      </section>

      <section className="returns-container">
        <div className="returns-intro">
          <span className="returns-small-label">
            SHOP WITH CONFIDENCE
          </span>

          <h2>We're Here to Help</h2>

          <p>
            Every handcrafted product is special. If something
            isn't right with your order, you can contact our
            support team to discuss the issue and available options.
          </p>
        </div>

        <div className="returns-grid">
          {returnSections.map((section) => {
            const Icon = section.icon;

            return (
              <article
                className="returns-card"
                key={section.title}
              >
                <div className="returns-card-icon">
                  <Icon aria-hidden="true" />
                </div>

                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </article>
            );
          })}
        </div>

        <section className="returns-process">
          <div className="returns-process-heading">
            <span className="returns-small-label">
              SIMPLE GUIDANCE
            </span>

            <h2>How to Request Help With an Order</h2>

            <p>
              Follow these steps if you need assistance
              with a return, refund, or cancellation.
            </p>
          </div>

          <div className="returns-steps">
            {returnSteps.map((step) => (
              <div
                className="returns-step"
                key={step.number}
              >
                <span className="returns-step-number">
                  {step.number}
                </span>

                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="returns-order">
          <div>
            <span className="returns-small-label">
              YOUR PURCHASES
            </span>

            <h2>Check Your Order Details</h2>

            <p>
              View your order history to find the information
              you may need when contacting support.
            </p>
          </div>

          <Link
            to="/user/dashboard?tab=orders"
            className="returns-order-btn"
          >
            View My Orders
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="returns-support">
          <FiCheckCircle aria-hidden="true" />

          <h2>Have a Return or Refund Question?</h2>

          <p>
            Tell us about your order and we'll help you
            understand the available next steps.
          </p>

          <Link
            to="/contact"
            className="returns-contact-btn"
          >
            Contact Support
          </Link>
        </div>

        <p className="returns-note">
          Note: This page contains general information for the
          Handicraft Hub portfolio project. Return eligibility,
          refund timelines, cancellation rules, and other
          operational policies must be established before
          accepting real customer transactions.
        </p>
      </section>
    </main>
  );
}
