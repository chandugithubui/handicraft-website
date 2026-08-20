import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaShoppingBag, FaHeart, FaStar, FaTruck, FaShieldAlt, FaHeadset, FaLeaf, FaAward, FaPlay } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-video-bg">
          <video autoPlay muted loop playsInline className="hero-video">
            <source src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-potter-making-a-ceramic-vase-32808-large.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hero-overlay">
          <Container>
            <Row className="align-items-center">
              <Col lg={7} className="hero-content">
                <div className="hero-badge">✨ Handcrafted with Love</div>
                <h1 className="hero-title">Discover the Art of Indian Handicrafts</h1>
                <p className="hero-subtitle">Each piece tells a unique story of tradition, crafted by skilled artisans using techniques passed down through generations. Bring home a piece of India's rich cultural heritage.</p>
                <div className="hero-buttons">
                  <Link to="/products" className="btn btn-primary btn-hero">
                    <FaShoppingBag className="me-2" /> Shop Now
                  </Link>
                  <Link to="/products" className="btn btn-outline-light btn-hero ms-3">
                    <FaPlay className="me-2" /> Watch Story
                  </Link>
                </div>
                <div className="hero-stats">
                  <div className="stat-item">
                    <h3>500+</h3>
                    <p>Artisans</p>
                  </div>
                  <div className="stat-item">
                    <h3>10K+</h3>
                    <p>Products</p>
                  </div>
                  <div className="stat-item">
                    <h3>50K+</h3>
                    <p>Happy Customers</p>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section py-5">
        <Container>
          <div className="section-header text-center mb-5">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Explore our diverse collection of traditional handicrafts</p>
          </div>
          <Row>
            {[
              { name: 'Paintings', image: '/images/pattachitrawall.jpg', count: '6+' },
              { name: 'Palm Leaf', image: '/images/pattachitra1.jpg.jpeg', count: '4+' },
              { name: 'Sarees', image: '/images/handcraftedwoodenBowl2.jpg', count: '2+' },
              { name: 'Wooden Crafts', image: '/images/HandcraftedWoodenBowl.webp', count: '5+' },
            ].map((category, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
                <Link to={`/products?category=${category.name}`} className="category-card">
                  <Card className="category-card-inner">
                    <div className="category-image-wrapper">
                      <Card.Img variant="top" src={category.image} alt={category.name} />
                      <div className="category-overlay">
                        <h3>{category.name}</h3>
                        <p>{category.count} Products</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Featured Products Section */}
      <section className="featured-section py-5 bg-light">
        <Container>
          <div className="section-header text-center mb-5">
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Handpicked treasures from our artisans</p>
          </div>
          <Row>
            {[
              { id: 1, name: 'Pattachitra Wall Art - Lord Jagannath', price: '₹3,500', image: '/images/pattachitra1.jpg.jpg', rating: 4.9, slug: 'pattachitra-lord-jagannath' },
              { id: 2, name: 'Palm Leaf Engraving - Radha Krishna', price: '₹2,800', image: '/images/pattachitra1.jpg.jpeg', rating: 4.8, slug: 'palm-leaf-radha-krishna' },
              { id: 3, name: 'Handpainted Saree - Pattachitra Border', price: '₹8,500', image: '/images/handcraftedwoodenBowl2.jpg', rating: 4.9, slug: 'handpainted-saree' },
              { id: 4, name: 'Handcrafted Wooden Bowl', price: '₹1,200', image: '/images/HandcraftedWoodenBowl.webp', rating: 4.9, slug: 'wooden-bowl' },
            ].map((product, index) => (
              <Col md={6} lg={3} key={index} className="mb-4">
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
                    <Link to="/products" className="btn btn-primary w-100">View Details</Link>
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

      {/* Why Choose Us Section */}
      <section className="features-section py-5">
        <Container>
          <div className="section-header text-center mb-5">
            <h2 className="section-title">Why Choose Us</h2>
            <p className="section-subtitle">What makes Handicraft Hub special</p>
          </div>
          <Row>
            {[
              { icon: <FaTruck />, title: 'Free Shipping', description: 'Free shipping on orders above ₹999' },
              { icon: <FaShieldAlt />, title: 'Secure Payment', description: '100% secure payment options' },
              { icon: <FaHeadset />, title: '24/7 Support', description: 'Dedicated customer support' },
              { icon: <FaLeaf />, title: 'Eco-Friendly', description: 'Sustainable and natural materials' },
              { icon: <FaAward />, title: 'Authentic Quality', description: 'Genuine handcrafted products' },
              { icon: <FaHeart />, title: 'Artisan Support', description: 'Directly supporting local artisans' },
            ].map((feature, index) => (
              <Col md={6} lg={4} key={index} className="mb-4">
                <Card className="feature-card h-100 text-center">
                  <Card.Body>
                    <div className="feature-icon">{feature.icon}</div>
                    <h4 className="feature-title">{feature.title}</h4>
                    <p className="feature-description">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
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
    </div>
  );
};

export default Home;
