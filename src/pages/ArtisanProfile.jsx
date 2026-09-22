import React, { useEffect, useState } from 'react';
import {
  getArtisanBySlug,
  getArtisanProducts
} from '../services/artisanService';
import { useParams, Link } from 'react-router-dom';
import { FiMapPin, FiAward, FiHeart, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import './ArtisanProfile.css';



const ArtisanProfile = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();

  const [artisan, setArtisan] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtisan = async () => {
      try {
        setLoading(true);
        setError('');

        const [artisanData, productData] = await Promise.all([
          getArtisanBySlug(slug),
          getArtisanProducts(slug)
        ]);

        setArtisan(artisanData);
        setProducts(productData);
      } catch (error) {
        console.error('Failed to load artisan:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtisan();
  }, [slug]);

  const handleAddToCart = (product) => {
    addToCart(product);
  };


  if (loading) {
    return (
      <div className="artisan-profile-page">
        <div className="container">
          <div className="artisan-not-found">
            <h2>Loading artisan...</h2>
          </div>
        </div>
      </div>
    );
  }
  if (error || !artisan) {
    return (
      <div className="artisan-profile-page">
        <div className="container">
          <div className="artisan-not-found">
            <h2>Artisan Not Found</h2>

            <Link to="/" className="btn btn-primary">
              <FiArrowLeft className="btn-icon" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="artisan-profile-page">
      {/* Hero Section */}
      <div className="artisan-hero">
        <div className="container">
          <Link to="/" className="back-link">
            <FiArrowLeft className="back-icon" />
            Back to Home
          </Link>
          <div className="artisan-hero-content">
            <div className="artisan-hero-image">
              <img src={artisan.image} alt={artisan.name} />
            </div>
            <div className="artisan-hero-info">
              <span className="craft-badge-hero">{artisan.craft}</span>
              <h1 className="artisan-name-hero">{artisan.name}</h1>
              <div className="artisan-location-hero">
                <FiMapPin className="location-icon" />
                <span>{artisan.location}</span>
              </div>
              <div className="artisan-stats-hero">
                <div className="stat-item">
                  <FiAward className="stat-icon" />
                  <span>{artisan.years} Years Experience</span>
                </div>
                <div className="stat-item">
                  <FiHeart className="stat-icon" />
                  <span>{artisan.specialty}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Story Section */}
        <div className="artisan-story-section">
          <div className="section-header">
            <h2 className="section-title">Their Story</h2>
          </div>
          <p className="artisan-story-full">{artisan.story}</p>
        </div>

        {/* Craft Process Section */}
        <div className="craft-process-section">
          <div className="section-header">
            <h2 className="section-title">How They Create</h2>
            <p className="section-subtitle">
              Discover the traditional process behind {artisan.name}'s {artisan.craft}
            </p>
          </div>
          <div className="craft-process-timeline">
            {artisan.craftProcess.map((process, index) => (
              <div key={index} className="process-step">
                <div className="step-number">
                  <span>{process.step}</span>
                </div>
                <div className="step-content">
                  <div className="step-image">
                    <img src={process.image} alt={process.title} />
                  </div>
                  <h3 className="step-title">{process.title}</h3>
                  <p className="step-description">{process.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery Section */}
        <div className="artisan-gallery-section">
          <div className="section-header">
            <h2 className="section-title">Work Gallery</h2>
          </div>

          {products.length > 0 ? (
            <div className="gallery-grid">
              {products.map((product) => (
                <div key={product._id} className="gallery-product-card">
                  <div className="gallery-product-image">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                    />
                  </div>

                  <div className="gallery-product-info">
                    <h3 className="gallery-product-name">
                      {product.name}
                    </h3>

                    <p className="gallery-product-description">
                      {product.description}
                    </p>

                    <div className="gallery-product-meta">
                      <div className="meta-item">
                        <span className="meta-label">Price:</span>
                        <span className="meta-value">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="meta-item">
                        <span className="meta-label">Material:</span>
                        <span className="meta-value">
                          {product.material || 'Handcrafted'}
                        </span>
                      </div>

                      <div className="meta-item">
                        <span className="meta-label">Stock:</span>
                        <span className="meta-value">
                          {product.stock > 0
                            ? `${product.stock} available`
                            : 'Out of Stock'}
                        </span>
                      </div>
                    </div>

                    <div className="gallery-product-actions">
                      <button
                        className="btn btn-primary btn-sm add-to-cart-btn"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                      >
                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </button>

                      <Link
                        to={`/product/${product._id}`}
                        className="btn btn-outline btn-sm view-details-btn"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No products are currently available from this artisan.</p>
          )}
        </div>

        {/* Products Section */}
        <div className="artisan-products-section">
          <div className="section-header">
            <h2 className="section-title">Shop Their Work</h2>
            <p className="section-subtitle">
              Discover beautiful handcrafted products by {artisan.name}
            </p>
          </div>
          <Link to={`/products?craft=${encodeURIComponent(artisan.craft)}`} className="btn btn-primary btn-lg cta-btn">
            <FiShoppingBag className="btn-icon" />
            Browse {artisan.craft} Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArtisanProfile;
