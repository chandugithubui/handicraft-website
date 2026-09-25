import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiArrowRight } from 'react-icons/fi';
import { getArtisans } from '../services/artisanService';
import './ArtisanStorySection.css';

const ArtisanStorySection = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await getArtisans();
        setArtisans(data);
      } catch (error) {
        console.error('Failed to load artisans:', error);
        setError('Unable to load artisans.');
      } finally {
        setLoading(false);
      }
    };

    fetchArtisans();
  }, []);

  return (
    <section className="artisan-story-section">
      <div className="container">

        {/* Section Header */}
        <div className="artisan-section-header">
          <h2 className="artisan-section-title">
            Meet Our Artisans
          </h2>

          <p className="artisan-section-tagline">
            Real people. Real stories. Real craftsmanship.
          </p>

          <p className="artisan-section-description">
            Discover the skilled hands preserving Odisha&apos;s traditional
            crafts and creating meaningful handcrafted pieces.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="artisan-status">
            <p>Loading artisans...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="artisan-status">
            <p>{error}</p>
          </div>
        )}

        {/* Artisan Cards */}
        {!loading && !error && (
          <div className="artisans-grid">
            {artisans.map((artisan) => (
              <article key={artisan._id} className="artisan-card">

                {/* Image */}
                <div className="artisan-image">
                  <img
                    src={artisan.image}
                    alt={artisan.name}
                  />

                  <div className="artisan-location-badge">
                    <FiMapPin />
                    <span>{artisan.location}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="artisan-content">

                  <div className="artisan-info-row">
                    <div className="artisan-main-info">
                      <h3 className="artisan-name">
                        {artisan.name}
                      </h3>

                      <p className="artisan-craft">
                        {artisan.craft}
                      </p>
                    </div>

                    <div className="artisan-experience">
                      {artisan.years}+ Years
                    </div>
                  </div>

                  <p className="artisan-story">
                    {artisan.story}
                  </p>

                  <Link
                    to={`/artisan/${artisan.slug}`}
                    className="artisan-profile-btn"
                  >
                    <span>View Profile</span>
                    <FiArrowRight />
                  </Link>

                </div>
              </article>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && !error && artisans.length > 0 && (
          <div className="artisan-bottom-area">

            <Link
              to="/products"
              className="artisan-products-btn"
            >
              Explore Artisan Products
              <FiArrowRight />
            </Link>

            <p className="artisan-support-text">
              “Supporting artisans means preserving traditional
              craftsmanship for future generations.”
            </p>

          </div>
        )}

      </div>
    </section>
  );
};

export default ArtisanStorySection;