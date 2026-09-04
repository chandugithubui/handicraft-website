import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiHeart,
  FiAward,
  FiUsers,
  FiGlobe,
  FiStar,
  FiArrowRight
} from 'react-icons/fi';
import './About.css';

const About = () => {
  return (
    <div className="about-page">

      {/* =====================================================
          HERO SECTION
          ===================================================== */}

      <section className="about-hero">

        <img
          src="/images/homepagedesign.png"
          alt="Indian traditional handicraft artwork"
          className="about-hero-image"
        />

        <div className="about-hero-overlay"></div>

        <div className="container about-hero-container">
          <div className="about-hero-content">

            <span className="about-hero-label">
              HANDICRAFT HUB
            </span>

            <h1 className="about-hero-title">
              Our Story
            </h1>

            <p className="about-hero-subtitle">
              Celebrating Indian craftsmanship and connecting you with
              the artisans who keep traditions alive
            </p>

          </div>
        </div>

      </section>


      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <div className="container">


        {/* ===================================================
            MISSION SECTION
            =================================================== */}

        <section className="about-section mission-section">

          <div className="section-header">
            <span className="section-eyebrow">
              WHY WE EXIST
            </span>

            <h2 className="section-title">
              Our Mission
            </h2>

            <p className="section-subtitle">
              Empowering artisans, preserving traditions
            </p>
          </div>


          <div className="mission-content">

            <div className="mission-text">

              <p>
                At Handicraft Hub, we believe that every handmade piece
                carries a story. Our mission is to celebrate India's rich
                craftsmanship while creating meaningful opportunities for
                the artisans behind these traditions.
              </p>

              <p>
                We strive to connect customers with authentic handmade
                products while supporting the skilled craftspeople and
                communities who keep these timeless techniques alive.
              </p>

              <p>
                Every purchase is more than a product. It is a way of
                appreciating craftsmanship, supporting livelihoods and
                helping traditional Indian art find its place in modern
                homes.
              </p>

            </div>


            <div className="mission-image">

              <img
                src="/images/pattachitra1.jpg.jpg"
                alt="Traditional Indian Pattachitra craftsmanship"
              />

              <div className="mission-image-caption">
                <span>Tradition</span>
                <span>Craftsmanship</span>
                <span>Community</span>
              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            VALUES SECTION
            =================================================== */}

        <section className="about-section values-section">

          <div className="section-header">

            <span className="section-eyebrow">
              WHAT GUIDES US
            </span>

            <h2 className="section-title">
              Our Core Values
            </h2>

            <p className="section-subtitle">
              The principles that guide everything we do
            </p>

          </div>


          <div className="values-grid">

            <div className="value-card">

              <div className="value-icon">
                <FiHeart />
              </div>

              <h3 className="value-title">
                Integrity
              </h3>

              <p className="value-description">
                We believe in honest relationships and transparent
                dealings with both our customers and artisans.
              </p>

            </div>


            <div className="value-card">

              <div className="value-icon">
                <FiAward />
              </div>

              <h3 className="value-title">
                Quality
              </h3>

              <p className="value-description">
                Every handcrafted piece is chosen with care to celebrate
                authentic craftsmanship and thoughtful design.
              </p>

            </div>


            <div className="value-card">

              <div className="value-icon">
                <FiUsers />
              </div>

              <h3 className="value-title">
                Community
              </h3>

              <p className="value-description">
                We care about the people behind every craft and the
                communities that keep these traditions alive.
              </p>

            </div>


            <div className="value-card">

              <div className="value-icon">
                <FiGlobe />
              </div>

              <h3 className="value-title">
                Sustainability
              </h3>

              <p className="value-description">
                We value thoughtful craftsmanship and encourage the use
                of traditional and responsible materials.
              </p>

            </div>

          </div>

        </section>


        {/* ===================================================
            JOURNEY SECTION
            =================================================== */}

        <section className="about-section journey-section">

          <div className="section-header">

            <span className="section-eyebrow">
              OUR JOURNEY
            </span>

            <h2 className="section-title">
              From an Idea to a Community
            </h2>

            <p className="section-subtitle">
              A journey built around craftsmanship and people
            </p>

          </div>


          <div className="story-timeline">

            <div className="timeline-item">

              <div className="timeline-year">
                2015
              </div>

              <div className="timeline-content">

                <span className="timeline-step">
                  THE BEGINNING
                </span>

                <h3 className="timeline-title">
                  The Beginning
                </h3>

                <p className="timeline-description">
                  Handicraft Hub began with a simple vision — to create
                  a platform where talented artisans could showcase their
                  handcrafted creations to a wider audience.
                </p>

              </div>

            </div>


            <div className="timeline-item">

              <div className="timeline-year">
                2018
              </div>

              <div className="timeline-content">

                <span className="timeline-step">
                  GROWING COMMUNITY
                </span>

                <h3 className="timeline-title">
                  Growing Community
                </h3>

                <p className="timeline-description">
                  We began building relationships with skilled artisans
                  from different regions, helping traditional crafts
                  reach more customers.
                </p>

              </div>

            </div>


            <div className="timeline-item">

              <div className="timeline-year">
                2021
              </div>

              <div className="timeline-content">

                <span className="timeline-step">
                  EXPANDING REACH
                </span>

                <h3 className="timeline-title">
                  Expanding Reach
                </h3>

                <p className="timeline-description">
                  Our growing community helped Indian craftsmanship reach
                  customers beyond local markets and connect traditional
                  art with modern homes.
                </p>

              </div>

            </div>


            <div className="timeline-item">

              <div className="timeline-year">
                Today
              </div>

              <div className="timeline-content">

                <span className="timeline-step">
                  CONTINUING THE LEGACY
                </span>

                <h3 className="timeline-title">
                  Continuing the Legacy
                </h3>

                <p className="timeline-description">
                  We continue to grow while staying focused on the same
                  purpose — celebrating Indian craftsmanship and helping
                  traditional arts remain part of everyday life.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            IMPACT SECTION
            =================================================== */}

        <section className="about-section impact-section">

          <div className="section-header">

            <span className="section-eyebrow">
              OUR IMPACT
            </span>

            <h2 className="section-title">
              Making a Difference
            </h2>

            <p className="section-subtitle">
              One craft, one artisan and one customer at a time
            </p>

          </div>


          <div className="impact-stats">

            <div className="stat-card">
              <div className="stat-number">500+</div>
              <div className="stat-label">Artisans Supported</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Products Sold</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">50+</div>
              <div className="stat-label">Crafts Preserved</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">25+</div>
              <div className="stat-label">States Reached</div>
            </div>

          </div>

        </section>


        {/* ===================================================
            TESTIMONIALS SECTION
            =================================================== */}

        <section className="about-section testimonials-section">

          <div className="section-header">

            <span className="section-eyebrow">
              FROM OUR COMMUNITY
            </span>

            <h2 className="section-title">
              What Our Customers Say
            </h2>

            <p className="section-subtitle">
              Stories from people who value authentic craftsmanship
            </p>

          </div>


          <div className="testimonials-grid">


            <div className="testimonial-card">

              <div className="testimonial-rating">

                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className="star filled"
                  />
                ))}

              </div>

              <p className="testimonial-text">
                "The handcrafted jewelry I purchased was absolutely
                stunning. I love knowing that it supports local artisans.
                The quality and design are unmatched!"
              </p>

              <div className="testimonial-author">

                <div className="author-avatar">
                  ER
                </div>

                <div className="author-info">

                  <span className="author-name">
                    Emily R.
                  </span>

                  <span className="author-location">
                    Mumbai
                  </span>

                </div>

              </div>

            </div>


            <div className="testimonial-card">

              <div className="testimonial-rating">

                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className="star filled"
                  />
                ))}

              </div>

              <p className="testimonial-text">
                "Beautiful pottery that arrived safely packaged. The
                attention to detail is incredible. Will definitely be
                ordering again for gifts!"
              </p>

              <div className="testimonial-author">

                <div className="author-avatar">
                  RK
                </div>

                <div className="author-info">

                  <span className="author-name">
                    Rahul K.
                  </span>

                  <span className="author-location">
                    Delhi
                  </span>

                </div>

              </div>

            </div>


            <div className="testimonial-card">

              <div className="testimonial-rating">

                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className="star filled"
                  />
                ))}

              </div>

              <p className="testimonial-text">
                "The Pattachitra painting I bought is now the centerpiece
                of my living room. Authentic artistry at its finest!"
              </p>

              <div className="testimonial-author">

                <div className="author-avatar">
                  PS
                </div>

                <div className="author-info">

                  <span className="author-name">
                    Priya S.
                  </span>

                  <span className="author-location">
                    Bangalore
                  </span>

                </div>

              </div>

            </div>


          </div>

        </section>


        {/* ===================================================
            CTA SECTION
            =================================================== */}

        <section className="about-section cta-section">

          <div className="cta-content">

            <span className="cta-eyebrow">
              DISCOVER THE CRAFT
            </span>

            <h2 className="cta-title">
              Be Part of Our Journey
            </h2>

            <p className="cta-description">
              Discover handcrafted pieces that carry the skill,
              culture and stories of Indian artisans into your home.
            </p>

            <Link
              to="/products"
              className="btn btn-primary btn-lg cta-btn"
            >
              Explore Our Collection
              <FiArrowRight className="btn-icon" />
            </Link>

          </div>

        </section>

      </div>

    </div>
  );
};

export default About;