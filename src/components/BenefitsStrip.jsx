import React from 'react';
import { FiCheckCircle, FiHeart, FiShield, FiRefreshCw } from 'react-icons/fi';
import './BenefitsStrip.css';

const BenefitsStrip = () => {
  const benefits = [
    {
      icon: <FiCheckCircle />,
      title: 'Authentic Handicrafts',
      description: 'Genuine artisan-crafted products'
    },
    {
      icon: <FiHeart />,
      title: 'Supporting Artisans',
      description: 'Empowering local craftsmen'
    },
    {
      icon: <FiShield />,
      title: 'Secure Payments',
      description: 'Safe & secure transactions'
    },
    {
      icon: <FiRefreshCw />,
      title: 'Easy Returns',
      description: 'Hassle-free return policy'
    }
  ];

  return (
    <section className="benefits-strip">
      <div className="container">
        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <div key={index} className="benefit-item">
              <div className="benefit-icon-wrapper">
                <span className="benefit-icon">{benefit.icon}</span>
              </div>
              <div className="benefit-content">
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-description">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsStrip;
