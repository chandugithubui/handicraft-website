import React from 'react';
import { Link } from 'react-router-dom';
import './CategorySection.css';

const CategorySection = () => {
  const categories = [
    {
      id: 'pattachitra',
      name: 'Pattachitra',
      label: 'Traditional Paintings',
      image: '/images/pattachitra1.jpg.jpg'
    },
    {
      id: 'palm-leaf',
      name: 'Palm Leaf Crafts',
      label: 'Ancient Art Form',
      image: '/images/pattachitrawall.jpg'
    },
    {
      id: 'sarees',
      name: 'Handwoven Sarees',
      label: 'Elegant Weaves',
      image: '/images/relatedProduct.webp'
    },
    {
      id: 'wooden',
      name: 'Wooden Crafts',
      label: 'Carved Masterpieces',
      image: '/images/handcraftedwoodenBowl2.jpg'
    },
    {
      id: 'sculptures',
      name: 'Sculptures',
      label: 'Artistic Creations',
      image: '/images/sculpture.webp'
    },
    {
      id: 'decor',
      name: 'Home Decor',
      label: 'Beautiful Accents',
      image: '/images/decorativeplate.webp'
    },
    {
      id: 'gifts',
      name: 'Gifts',
      label: 'Perfect Presents',
      image: '/images/GiftsItems.webp'
    }
  ];

  return (
    <section className="category-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Shop by Categories</h2>
          <Link to="/category/all" className="section-link">
            View All Categories →
          </Link>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/category/${category.id}`} 
              className="category-card"
            >
              <div className="category-image-wrapper">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="category-image"
                />
              </div>
              <div className="category-info">
                <h3 className="category-name">{category.name}</h3>
                <p className="category-label">{category.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
