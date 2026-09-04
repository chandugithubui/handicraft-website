import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-background">
        <img
          src="/images/homepagedesign.png"
          alt="Indian handicrafts and Pattachitra art"
          className="hero-bg-image"
        />
      </div>

      <div className="hero-content">
        <div className="hero-text-wrapper">

          <h1 className="hero-title">
            Handcrafted<br />
            Stories, Made to Last
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