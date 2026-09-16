import { getTestimonials } from '../services/testimonialService';
import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import BenefitsStrip from '../components/BenefitsStrip';
import CategorySection from '../components/CategorySection';
import ArtisanStorySection from '../components/ArtisanStorySection';
import ProductModal from '../components/ProductModal';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaShoppingBag, FaHeart, FaStar, FaAward, FaLeaf, FaShieldAlt, FaTruck, FaHeadset } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getProducts } from '../services/productService';
import './Home.css';

const Home = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  const [bestSellers, setBestSellers] = useState([]);
  const [bestSellersLoading, setBestSellersLoading] = useState(true);
  const [bestSellersError, setBestSellersError] = useState('');
  
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState('');

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
   
   // Fetch Best Sellers from database
  // 1. Fetch Best Sellers
useEffect(() => {
  const fetchBestSellers = async () => {
    try {
      setBestSellersLoading(true);
      setBestSellersError('');

      const products = await getProducts('?limit=100');

      const featuredProducts = products.filter(
        (product) => product.featured === true
      );

      const productsToShow =
        featuredProducts.length > 0
          ? featuredProducts.slice(0, 8)
          : products.slice(0, 8);

      setBestSellers(productsToShow);
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      setBestSellersError('Unable to load best sellers.');
    } finally {
      setBestSellersLoading(false);
    }
  };

  fetchBestSellers();
}, []);


// 2. Fetch Testimonials
useEffect(() => {
  const fetchTestimonials = async () => {
    try {
      setTestimonialsLoading(true);
      setTestimonialsError('');

      const data = await getTestimonials();

      setTestimonials(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setTestimonialsError('Unable to load testimonials.');
    } finally {
      setTestimonialsLoading(false);
    }
  };

  fetchTestimonials();
}, []);


  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = (product) => {
  const productWithId = {
    ...product,
    _id: product._id,
    price: Number(product.price)
  };

  addToCart(productWithId);
};

  const handleWishlist = (product) => {
  const productWithId = {
    ...product,
    _id: product._id,
    price: Number(product.price)
  };

  addToWishlist(productWithId);
};

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    
    // Email validation - more permissive regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newsletterEmail || !emailRegex.test(newsletterEmail)) {
      setNewsletterStatus('error');
      setNewsletterMessage('Please enter a valid email address');
      return;
    }

    try {
      const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api/newsletter/subscribe'
        : 'https://handicraft-website.onrender.com/api/newsletter/subscribe';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setNewsletterStatus('success');
        setNewsletterMessage(data.message);
        setNewsletterEmail('');
      } else {
        setNewsletterStatus('error');
        setNewsletterMessage(data.message || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setNewsletterStatus('error');
      setNewsletterMessage('An error occurred. Please try again later.');
    }
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
                {bestSellersLoading && (
                   <Col xs={12} className="text-center">
                        <p>Loading best sellers...</p>
                   </Col>
                 )}

                 {bestSellersError && (
                    <Col xs={12} className="text-center">
                        <p>{bestSellersError}</p>
                    </Col>
                  )}

                 {!bestSellersLoading && !bestSellersError && bestSellers.map((product) => (
              <Col xs={6} sm={6} md={4} lg={3} key={product._id} className="mb-4">
                <Card className="product-card h-100">
                  <div className="product-image-wrapper">
                    <Card.Img variant="top" src={product.image} alt={product.name} />
                    <div className="product-actions">
                      <Button 
                        variant="light" 
                        className="action-btn"
                        onClick={() => handleWishlist(product)}
                      >
                        <FaHeart className={isInWishlist(product._id) ? 'text-danger' : ''} />
                      </Button>
                      <Button 
                        variant="light" 
                        className="action-btn"
                        onClick={() => handleAddToCart(product)}
                      >
                        <FaShoppingBag />
                      </Button>
                    </div>
                  </div>
                  <Card.Body>
                    <Card.Title className="product-title">{product.name}</Card.Title>
                    
                    <Card.Text className="product-price">
                         ₹{Number(product.price).toLocaleString('en-IN')}
                    </Card.Text>
                    <Button onClick={() => handleViewDetails(product)} className="btn btn-primary w-100 view-details-btn">View Details</Button>
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
              {testimonialsLoading && (
                <Col xs={12} className="text-center">
                   <p>Loading testimonials...</p>
                </Col>
               )}

               {testimonialsError && (
                 <Col xs={12} className="text-center">
                   <p>{testimonialsError}</p>
                 </Col>
                )}

               {!testimonialsLoading &&
                   !testimonialsError &&
                    testimonials.map((testimonial) => (
               <Col md={4} key={testimonial._id} className="mb-4">
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
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="form-control newsletter-input"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                />
                <Button 
                  variant="primary" 
                  className="newsletter-btn"
                  onClick={handleNewsletterSubscribe}
                >
                  Subscribe
                </Button>
              </div>
              {newsletterMessage && (
                <div className={`newsletter-message ${newsletterStatus}`}>
                  {newsletterMessage}
                </div>
              )}
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
