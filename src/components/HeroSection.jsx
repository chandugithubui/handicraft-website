import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-background">
        <picture>
          <source
            media="(max-width: 480px)"
            srcSet="/images/homepagedesign-mobile.png"
          />

          <img
            src="/images/homepagedesign.png"
            alt="Indian handicrafts and Pattachitra art"
            className="hero-bg-image"
          />
        </picture>
      </div>

      <div className="hero-content">
        <div className="hero-text-wrapper">

          <h1 className="hero-title">
            <span>Handcrafted</span>
            <span>Stories, Made</span>
            <span>to Last</span>
          </h1>

          <p className="hero-description">
            Discover authentic Indian handicrafts created by skilled
            artisans and rooted in generations of tradition.
          </p>

          <div className="hero-buttons">
            <Link
              to="/products"
              className="hero-btn hero-btn-primary"
            >
              Explore Collection
            </Link>

            <Link
              to="/about"
              className="hero-btn hero-btn-secondary"
            >
              Meet the Artisans
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;