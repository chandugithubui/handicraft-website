import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMapPin, FiAward, FiArrowRight } from 'react-icons/fi';
import './ArtisanStorySection.css';

const ArtisanStorySection = () => {
  const artisans = [
    {
      id: 1,
      name: 'Rakesh Prusty',
      slug: 'rakesh-prusty',
      craft: 'Pattachitra Painting',
      location: 'Chandanpur, Puri, Odisha',
      years: 25,
      story: 'Rakesh learned the ancient art of Pattachitra from his father, who learned it from his father. For 5 years, he has been keeping this 200-year-old tradition alive, creating intricate mythological paintings on cloth and palm leaves.',
      image: '/images/rakesh.jpeg',
      specialty: 'Lord Jagannath Paintings'
    },
    {
      id: 2,
      name: 'Jagannath Das',
      slug: 'jagannath-das',
      craft: 'Palm Leaf Engraving',
      location: 'Raghurajpur, Odisha',
      years: 26,
      story: 'Jagannath is a master of palm leaf engraving, a delicate art form that requires immense patience and precision. Her work tells stories from Indian epics through intricate cut-work on dried palm leaves.',
      image: '/images/jaga.jpeg',
      specialty: 'Epic Narratives'
    },
    {
      id: 3,
      name: 'Chandan Sahoo ',
      slug: 'chandan-sahoo',
      craft: 'Wood Carving',
      location: 'Saharanpur, Uttar Pradesh',
      years: 26,
      story: 'Jagannath comes from a family of wood carvers who have been crafting beautiful wooden artifacts for generations. His work ranges from decorative bowls to intricate furniture pieces.',
      image: '/images/chandan.jpeg',
      specialty: 'Decorative Artifacts'
    }
  ];

  return (
    <div className="artisan-story-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Meet Our Artisans</h2>
          <p className="section-subtitle">
            The skilled hands behind every masterpiece. Each artisan brings generations of tradition and expertise to create unique handcrafted treasures.
          </p>
        </div>

        <div className="artisans-grid">
          {artisans.map((artisan) => (
            <div key={artisan.id} className="artisan-card">
              <div className={`artisan-image ${artisan.id === 1 ? 'face-high' :
                                                   artisan.id === 2 ? 'face-right' :
                                                   ''}`}>
                <img src={artisan.image} alt={artisan.name} />
                <div className="artisan-overlay">
                  <div className="craft-badge">{artisan.craft}</div>
                </div>
              </div>
              
              <div className="artisan-content">
                <div className="artisan-header">
                  <h3 className="artisan-name">{artisan.name}</h3>
                  <div className="artisan-location">
                    <FiMapPin className="location-icon" />
                    <span>{artisan.location}</span>
                  </div>
                </div>

                <div className="artisan-stats">
                  <div className="stat">
                    <FiAward className="stat-icon" />
                    <span>{artisan.years} Years</span>
                  </div>
                  <div className="stat">
                    <FiHeart className="stat-icon" />
                    <span>{artisan.specialty}</span>
                  </div>
                </div>

                <p className="artisan-story">{artisan.story}</p>

                <Link to={`/artisan/${artisan.slug}`} className="btn btn-outline artisan-btn">
                  View Their Work
                  <FiArrowRight className="btn-icon" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="artisan-cta">
          <div className="cta-content">
            <h3 className="cta-title">Support Traditional Craftsmanship</h3>
            <p className="cta-description">
              Every purchase directly supports our artisans and their families, helping preserve centuries-old traditions for future generations.
            </p>
            <a href="/products" className="btn btn-primary cta-btn">
              Shop Artisan Products
              <FiArrowRight className="btn-icon" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanStorySection;
