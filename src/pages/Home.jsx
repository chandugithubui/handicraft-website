import React, { useState } from 'react';
import HeroSection from '../components/HeroSection';
import BenefitsStrip from '../components/BenefitsStrip';
import CategorySection from '../components/CategorySection';
import ArtisanStorySection from '../components/ArtisanStorySection';
import ProductModal from '../components/ProductModal';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaShoppingBag, FaHeart, FaStar, FaAward, FaLeaf, FaShieldAlt, FaTruck, FaHeadset } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };
  return (
    <div className="home-page">
      {/* New Hero Section */}
      <HeroSection />

      {/* New Benefits Strip */}
      <BenefitsStrip />

      {/* New Category Section */}
      <CategorySection />

      {/* Artisan Story Section */}
      <ArtisanStorySection />

      {/* Best Sellers Section */}
      <section className="featured-section py-5">
        <Container>
          <div className="section-header text-center mb-5">
            <h2 className="section-title">Best Sellers</h2>
            <p className="section-subtitle">Handpicked treasures from our artisans</p>
          </div>
          <Row>
            {[
              { id: 1, name: 'Pattachitra Wall Art', price: '₹3,500', image: '/images/pattachitra1.jpg.jpg', rating: 4.9, slug: 'pattachitra-lord-jagannath' },
              { id: 2, name: 'Palm Leaf Engraving', price: '₹2,800', image: '/images/pattachitra2.jpg.jpg', rating: 4.8, slug: 'palm-leaf-radha-krishna' },
              { id: 3, name: 'Wooden Bowl', price: '₹1,200', image: '/images/HandcraftedWoodenBowl.webp', rating: 4.9, slug: 'wooden-bowl' },
              { id: 4, name: 'Decorative Plate', price: '₹950', image: '/images/decorativeplate.webp', rating: 4.7, slug: 'decorative-plate' },
              { id: 5, name: 'Handcrafted Vase', price: '₹1,800', image: '/images/handmadevase.webp', rating: 4.8, slug: 'handcrafted-vase' },
              { id: 6, name: 'Wooden Tray', price: '₹1,400', image: '/images/woodentray.jpg', rating: 4.6, slug: 'wooden-tray' },
              { id: 7, name: 'Glass Bottle', price: '₹2,200', image: '/images/glassbottle.webp', rating: 4.9, slug: 'glass-bottle' },
              { id: 8, name: 'Teapot', price: '₹1,600', image: '/images/teapot.webp', rating: 4.7, slug: 'teapot' },
            ].map((product, index) => (
              <Col xs={6} sm={6} md={6} lg={3} key={index} className="mb-4">
                <Card className="product-card h-100">
                  <div className="product-image-wrapper">
                    <Card.Img variant="top" src={product.image} alt={product.name} />
                    <div className="product-actions">
                      <Button variant="light" className="action-btn"><FaHeart /></Button>
                      <Button variant="light" className="action-btn"><FaShoppingBag /></Button>
                    </div>
                  </div>
                  <Card.Body>
                    <Card.Title className="product-title">{product.name}</Card.Title>
                    <div className="product-rating">
                      <FaStar className="star-icon" />
                      <span>{product.rating}</span>
                    </div>
                    <Card.Text className="product-price">{product.price}</Card.Text>
                    <Button onClick={() => handleViewDetails(product)} className="btn btn-primary w-100">View Details</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-4">
            <Link to="/products" className="btn btn-outline-primary btn-lg">View All Products</Link>
          </div>
        </Container>
      </section>

      {/* Promotional Banner Section */}
      <section className="promo-banner-section">
        <div className="promo-banner">
          <div className="promo-content">
            <h2 className="promo-title">Special Offer: 20% Off on All Pattachitra Art</h2>
            <p className="promo-subtitle">Use code: CRAFT20 at checkout</p>
            <Link to="/products?category=Pattachitra" className="btn btn-primary btn-lg promo-btn">Shop Now</Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="features-section py-5">
        <div className="features-header">
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-subtitle">Every purchase tells a story</p>
        </div>
        <div className="features-grid">
          {[
            { icon: <FaTruck />, title: 'Free Shipping', description: 'Free shipping on orders above ₹999' },
            { icon: <FaShieldAlt />, title: 'Secure Payment', description: '100% secure payment options' },
            { icon: <FaHeadset />, title: '24/7 Support', description: 'Dedicated customer support' },
            { icon: <FaLeaf />, title: 'Eco-Friendly', description: 'Sustainable and natural materials' },
            { icon: <FaAward />, title: 'Authentic Quality', description: 'Genuine handcrafted products' },
            { icon: <FaHeart />, title: 'Artisan Support', description: 'Directly supporting local artisans' },
          ].map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-5 bg-light">
        <Container>
          <div className="section-header text-center mb-5">
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">Real reviews from our happy customers</p>
          </div>
          <Row>
            {[
              { name: 'Priya Sharma', location: 'Mumbai', rating: 5, text: 'Amazing quality! The Pattachitra painting I ordered exceeded my expectations. Will definitely order again.', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
              { name: 'Rahul Verma', location: 'Delhi', rating: 5, text: 'Beautiful craftsmanship and fast delivery. The wooden bowl is a centerpiece in my home now.', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
              { name: 'Anita Desai', location: 'Bangalore', rating: 4, text: 'Love supporting local artisans through this platform. Great collection and reasonable prices.', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
            ].map((testimonial, index) => (
              <Col md={4} key={index} className="mb-4">
                <Card className="testimonial-card h-100">
                  <Card.Body>
                    <div className="testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FaStar key={i} className="star-icon" />
                      ))}
                    </div>
                    <p className="testimonial-text">"{testimonial.text}"</p>
                    <div className="testimonial-author">
                      <img src={testimonial.avatar} alt={testimonial.name} className="author-avatar" />
                      <div>
                        <h5 className="author-name">{testimonial.name}</h5>
                        <p className="author-location">{testimonial.location}</p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section py-5">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <h2 className="newsletter-title">Subscribe to Our Newsletter</h2>
              <p className="newsletter-subtitle">Get updates on new arrivals, exclusive offers, and artisan stories</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Enter your email address" className="form-control newsletter-input" />
                <Button variant="primary" className="newsletter-btn">Subscribe</Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Product Modal */}
      <ProductModal 
        show={showModal} 
        onHide={handleCloseModal} 
        product={selectedProduct} 
      />
    </div>
  );
};

export default Home;
