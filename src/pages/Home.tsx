/**
 * src/pages/Home.tsx
 *
 * Performance strategy
 * ────────────────────
 * • API calls are deferred until their section scrolls into view (enabled flag
 *   on React Query hooks is controlled by IntersectionObserver via useInView).
 * • Above-the-fold sections (Hero, Benefits, Categories) have NO API call.
 * • Below-the-fold sections (Best Sellers, Testimonials) fire their fetch
 *   only once the user scrolls close to them — never on initial page load.
 *
 * Animation strategy
 * ──────────────────
 * • Pure CSS transitions driven by .animate-hidden / .animate-in classes.
 * • Each section gets a useInView ref; when inView flips true, the class
 *   switches and the CSS transition runs.
 * • Staggered children (product cards, feature cards) use .stagger-children
 *   so each card slides in slightly after the previous one.
 * • Respects prefers-reduced-motion (handled in Home.css).
 */

import React, { useState } from 'react';
import HeroSection        from '../components/HeroSection';
import BenefitsStrip      from '../components/BenefitsStrip';
import CategorySection    from '../components/CategorySection';
import CouponOffer        from '../components/CouponOffer';
import ArtisanStorySection from '../components/ArtisanStorySection';
import ProductModal       from '../components/ProductModal';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import {
  FaShoppingBag, FaHeart, FaStar,
  FaAward, FaLeaf, FaShieldAlt, FaTruck, FaHeadset,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useCart }    from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useProducts, useTestimonials, useSubscribeNewsletter } from '../hooks/api';
import useInView from '../hooks/useInView';
import './Home.css';

/* ─────────────────────────────────────────────────────────────────────────────
   Helper: section ref cast — IntersectionObserver needs HTMLElement,
   but JSX section / div accept RefObject<HTMLDivElement>.  This cast avoids
   the TypeScript mismatch without forcing every call site to cast.
───────────────────────────────────────────────────────────────────────────── */
type SectionRef = React.RefObject<HTMLElement | null>;
const asDiv = (ref: SectionRef) => ref as unknown as React.RefObject<HTMLDivElement>;

const Home = () => {
  // ── Cart / Wishlist ────────────────────────────────────────────────────────
  const { addToCart }               = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  // ── Modal ──────────────────────────────────────────────────────────────────
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showModal, setShowModal]             = useState(false);

  // ── Newsletter ─────────────────────────────────────────────────────────────
  const [newsletterEmail,   setNewsletterEmail]   = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterStatus,  setNewsletterStatus]  = useState('');
  const subscribeMutation = useSubscribeNewsletter();

  // ── IntersectionObserver refs for every below-the-fold section ─────────────
  //    triggerOnce:true  → animation fires once, API fetch fires once.
  //    threshold 0.10    → trigger when 10% of the section is visible.

  const [benefitsRef,    benefitsInView]    = useInView({ threshold: 0.10 });
  const [categoryRef,    categoryInView]    = useInView({ threshold: 0.10 });
  const [couponRef,      couponInView]      = useInView({ threshold: 0.10 });
  const [artisanRef,     artisanInView]     = useInView({ threshold: 0.10 });
  const [bestSellersRef, bestSellersInView] = useInView({ threshold: 0.08 });
  const [featuresRef,    featuresInView]    = useInView({ threshold: 0.08 });
  const [testimonialsRef, testimonialsInView] = useInView({ threshold: 0.08 });
  const [newsletterRef,  newsletterInView]  = useInView({ threshold: 0.10 });

  // ── API: Best Sellers — fires only when the section scrolls into view ──────
  const {
    data: allProducts = [],
    isLoading: bestSellersLoading,
    isError:   isProductsError,
  } = useProducts('?limit=100', { enabled: bestSellersInView });

  const bestSellersError = isProductsError ? 'Unable to load best sellers.' : '';

  const featuredProducts = allProducts.filter(
    (p: any) => p.featured === true || p.isFeatured === true
  );
  const bestSellers =
    featuredProducts.length > 0 ? featuredProducts.slice(0, 8) : allProducts.slice(0, 8);

  // ── API: Testimonials — fires only when the section scrolls into view ──────
  const {
    data: testimonials = [],
    isLoading: testimonialsLoading,
    isError:   isTestimonialsError,
  } = useTestimonials({ enabled: testimonialsInView });

  const testimonialsError = isTestimonialsError ? 'Unable to load testimonials.' : '';

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleViewDetails = (product: any) => { setSelectedProduct(product); setShowModal(true); };
  const handleCloseModal  = () => { setShowModal(false); setSelectedProduct(null); };

  const handleAddToCart = (product: any) =>
    addToCart({ ...product, _id: product._id, price: Number(product.price) });

  const handleWishlist = (product: any) =>
    addToWishlist({ ...product, _id: product._id, price: Number(product.price) });

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newsletterEmail || !emailRegex.test(newsletterEmail)) {
      setNewsletterStatus('error');
      setNewsletterMessage('Please enter a valid email address');
      return;
    }
    try {
      const data = await subscribeMutation.mutateAsync({ email: newsletterEmail });
      if (data.success) {
        setNewsletterStatus('success');
        setNewsletterMessage(data.message);
        setNewsletterEmail('');
      } else {
        setNewsletterStatus('error');
        setNewsletterMessage(data.message || 'Subscription failed. Please try again.');
      }
    } catch (error: any) {
      setNewsletterStatus('error');
      setNewsletterMessage(error?.message || 'An error occurred. Please try again later.');
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  /** Returns the combined animation class string for a section. */
  const anim = (inView: boolean, variant: string = 'animate-fade-up') =>
    `animate-hidden ${variant}${inView ? ' animate-in' : ''}`;

  // ── Features data ──────────────────────────────────────────────────────────
  const features = [
    { icon: <FaTruck />,     title: 'Free Shipping',    description: 'Free shipping on orders above ₹999' },
    { icon: <FaShieldAlt />, title: 'Secure Payment',   description: '100% secure payment options' },
    { icon: <FaHeadset />,   title: '24/7 Support',     description: 'Dedicated customer support' },
    { icon: <FaLeaf />,      title: 'Eco-Friendly',     description: 'Sustainable and natural materials' },
    { icon: <FaAward />,     title: 'Authentic Quality', description: 'Genuine handcrafted products' },
    { icon: <FaHeart />,     title: 'Artisan Support',  description: 'Directly supporting local artisans' },
  ];

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="home-page">

      {/* ── 1. Hero — above fold, no animation needed ───────────────────── */}
      <HeroSection />

      {/* ── 2. Benefits Strip ───────────────────────────────────────────── */}
      <div
        ref={asDiv(benefitsRef)}
        className={anim(benefitsInView, 'animate-fade-up')}
      >
        <BenefitsStrip />
      </div>

      {/* ── 3. Category Section ─────────────────────────────────────────── */}
      <div
        ref={asDiv(categoryRef)}
        className={anim(categoryInView, 'animate-fade-up')}
      >
        <CategorySection />
      </div>

      {/* ── 4. Coupon Offer ─────────────────────────────────────────────── */}
      <div
        ref={asDiv(couponRef)}
        className={anim(couponInView, 'animate-fade-right')}
      >
        <CouponOffer />
      </div>

      {/* ── 5. Artisan Story ────────────────────────────────────────────── */}
      <div
        ref={asDiv(artisanRef)}
        className={anim(artisanInView, 'animate-fade-left')}
      >
        <ArtisanStorySection />
      </div>

      {/* ── 6. Best Sellers — lazy API + stagger cards ──────────────────── */}
      <section
        ref={asDiv(bestSellersRef)}
        className={`featured-section py-5 ${anim(bestSellersInView, 'animate-fade-up')}`}
      >
        <Container>
          <div className={`section-header text-center mb-5 section-heading-animate${bestSellersInView ? ' animate-in' : ''}`}>
            <h2 className="section-title">Best Sellers</h2>
            <p className="section-subtitle">Handpicked treasures from our artisans</p>
          </div>

          <Row className={`stagger-children${bestSellersInView ? ' animate-in' : ''}`}>
            {bestSellersLoading && (
              <Col xs={12} className="text-center">
                <div className="home-skeleton-row">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="home-skeleton-card">
                      <div className="home-skeleton-img" />
                      <div className="home-skeleton-line" />
                      <div className="home-skeleton-line home-skeleton-line--short" />
                    </div>
                  ))}
                </div>
              </Col>
            )}

            {bestSellersError && (
              <Col xs={12} className="text-center">
                <p className="text-muted">{bestSellersError}</p>
              </Col>
            )}

            {!bestSellersLoading && !bestSellersError && bestSellers.map((product: any) => (
              <Col xs={6} sm={6} md={4} lg={3} key={product._id} className="mb-4">
                <Card className="product-card h-100">
                  <div className="product-image-wrapper">
                    <Card.Img
                      variant="top"
                      src={product.image || product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                    />
                    <div className="product-actions">
                      <Button
                        variant="light"
                        className="action-btn"
                        onClick={() => handleWishlist(product)}
                        aria-label="Add to wishlist"
                      >
                        <FaHeart className={isInWishlist(product._id) ? 'text-danger' : ''} />
                      </Button>
                      <Button
                        variant="light"
                        className="action-btn"
                        onClick={() => handleAddToCart(product)}
                        aria-label="Add to cart"
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
                    <Button
                      onClick={() => handleViewDetails(product)}
                      className="btn btn-primary w-100 view-details-btn"
                    >
                      View Details
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {!bestSellersLoading && (
            <div className="text-center mt-4">
              <Link to="/products" className="btn btn-outline-primary btn-lg">
                View All Products
              </Link>
            </div>
          )}
        </Container>
      </section>

      {/* ── 7. Why Choose Us — stagger feature cards ────────────────────── */}
      <section
        ref={asDiv(featuresRef)}
        className={`features-section py-5 ${anim(featuresInView, 'animate-fade-up')}`}
      >
        <div className={`features-header section-heading-animate${featuresInView ? ' animate-in' : ''}`}>
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-subtitle">Every purchase tells a story</p>
        </div>
        <div className={`features-grid stagger-children${featuresInView ? ' animate-in' : ''}`}>
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrapper">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. Testimonials — lazy API + fade ───────────────────────────── */}
      <section
        ref={asDiv(testimonialsRef)}
        className={`testimonials-section py-5 bg-light ${anim(testimonialsInView, 'animate-fade-up')}`}
      >
        <Container>
          <div className={`section-header text-center mb-5 section-heading-animate${testimonialsInView ? ' animate-in' : ''}`}>
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">Real reviews from our happy customers</p>
          </div>

          <Row className={`stagger-children${testimonialsInView ? ' animate-in' : ''}`}>
            {testimonialsLoading && (
              <Col xs={12} className="text-center">
                <p className="text-muted">Loading testimonials…</p>
              </Col>
            )}
            {testimonialsError && (
              <Col xs={12} className="text-center">
                <p className="text-muted">{testimonialsError}</p>
              </Col>
            )}
            {!testimonialsLoading && !testimonialsError && testimonials.map((t: any) => (
              <Col md={4} key={t._id} className="mb-4">
                <Card className="testimonial-card h-100">
                  <Card.Body>
                    <div className="testimonial-rating">
                      {[...Array(t.rating)].map((_, i) => (
                        <FaStar key={i} className="star-icon" />
                      ))}
                    </div>
                    <p className="testimonial-text">"{t.text}"</p>
                    <div className="testimonial-author">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="author-avatar"
                        loading="lazy"
                      />
                      <div>
                        <h5 className="author-name">{t.name}</h5>
                        <p className="author-location">{t.location}</p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── 9. Newsletter ────────────────────────────────────────────────── */}
      <section
        ref={asDiv(newsletterRef)}
        className={`newsletter-section py-5 ${anim(newsletterInView, 'animate-scale')}`}
      >
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <h2 className="newsletter-title">Subscribe to Our Newsletter</h2>
              <p className="newsletter-subtitle">
                Get updates on new arrivals, exclusive offers, and artisan stories
              </p>
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

      {/* ── Product Modal ────────────────────────────────────────────────── */}
      <ProductModal
        show={showModal}
        onHide={handleCloseModal}
        product={selectedProduct}
      />
    </div>
  );
};

export default Home;
