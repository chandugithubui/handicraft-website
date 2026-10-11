
import { Link } from 'react-router-dom';
import {
  FiTruck,
  FiPackage,
  FiMapPin,
  FiClock,
  FiHelpCircle,
  FiArrowRight,
} from 'react-icons/fi';
import './ShippingPolicy.css';

const shippingSections = [
  {
    icon: FiPackage,
    title: 'Order Processing',
    description:
      'After an order is placed, its details are recorded for processing. Processing arrangements may vary depending on product availability and the type of handcrafted item.',
  },
  {
    icon: FiClock,
    title: 'Estimated Delivery',
    description:
      'Delivery timelines depend on the destination, product availability, and shipping arrangements. Any available delivery estimates should be confirmed before placing an order.',
  },
  {
    icon: FiTruck,
    title: 'Shipping Charges',
    description:
      'Applicable shipping charges, if any, are displayed in your order summary during checkout. Please review the final total before confirming your order.',
  },
  {
    icon: FiMapPin,
    title: 'Delivery Locations',
    description:
      'Delivery availability may vary by destination. Please provide a complete and accurate shipping address during checkout.',
  },
  {
    icon: FiPackage,
    title: 'Order Tracking',
    description:
      'You can check the latest available order status using the Track Order page or your account order history. Carrier tracking information may not be available for every order.',
  },
  {
    icon: FiHelpCircle,
    title: 'Delivery Issues',
    description:
      'If you have questions about an order, an incorrect address, or a delivery issue, contact our support team with your order details.',
  },
];

export default function ShippingPolicy() {
  return (
    <main className="shipping-page">
      <section className="shipping-hero">
        <div className="shipping-hero-inner">
          <span className="shipping-eyebrow">
            <FiTruck aria-hidden="true" /> CUSTOMER INFORMATION
          </span>
          <h1>
            Shipping <em>Policy</em>
          </h1>
          <p>
            Helpful information about order processing, shipping charges,
            delivery, and tracking your handcrafted purchases.
          </p>
        </div>
      </section>

      <section className="shipping-container">
        <div className="shipping-intro">
          <h2>From Craftsmanship to Your Doorstep</h2>
          <p>
            At Handicraft Hub, we aim to make your shopping experience
            clear and convenient. This page explains how shipping-related
            information is handled on our website.
          </p>
        </div>

        <div className="shipping-grid">
          {shippingSections.map((section) => {
            const Icon = section.icon;

            return (
              <article className="shipping-card" key={section.title}>
                <div className="shipping-card-icon">
                  <Icon aria-hidden="true" />
                </div>

                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </article>
            );
          })}
        </div>

        <div className="shipping-tracking">
          <div>
            <span className="shipping-small-label">
              CHECK YOUR ORDER
            </span>
            <h2>Want to know your order status?</h2>
            <p>
              Use our Track Order page to view the latest status
              available for your purchase.
            </p>
          </div>

          <Link to="/track-order" className="shipping-track-btn">
            Track Your Order <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="shipping-support">
          <FiHelpCircle aria-hidden="true" />
          <h2>Need help with a delivery?</h2>
          <p>
            Have a question about shipping or your order?
            Our contact page is available for assistance.
          </p>
          <Link to="/contact" className="shipping-contact-btn">
            Contact Support
          </Link>
        </div>

        <p className="shipping-note">
          Note: This page provides general shipping information for the
          Handicraft Hub project. Specific shipping arrangements and
          delivery commitments should be confirmed before accepting
          real customer orders.
        </p>
      </section>
    </main>
  );
}
