import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Form, Button, FormControl, Badge, Dropdown, Carousel } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaUserCircle, FaSignInAlt, FaSignOutAlt, FaSearch, FaBars } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Header.css";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartItemCount } = useCart();

  // State to manage search query
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get the number of items in the cart
  const cartItemCount = getCartItemCount();

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Artistic slider images
  const sliderImages = [
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1920&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&h=400&fit=crop',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1920&h=400&fit=crop'
  ];

  return (
    <>
      {/* Artistic Slider */}
      <div className="header-slider">
        <Carousel fade interval={5000} indicators={false} controls={false}>
          {sliderImages.map((image, index) => (
            <Carousel.Item key={index}>
              <div className="slider-image" style={{ backgroundImage: `url(${image})` }}>
                <div className="slider-overlay">
                  <Container>
                    <div className="slider-content">
                      <h1>Handcrafted with Love</h1>
                      <p>Discover authentic Indian handicrafts from skilled artisans</p>
                    </div>
                  </Container>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>

      {/* Navigation Bar */}
      <Navbar 
        className={`main-navbar ${isScrolled ? 'scrolled' : ''}`} 
        expand="lg"
        sticky="top"
      >
        <Container>
          {/* Logo Section */}
          <Navbar.Brand as={Link} to="/" className="brand-logo">
            <span className="logo-text">Handicraft Hub</span>
            <span className="logo-subtitle">Artisan Treasures</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav">
            <FaBars />
          </Navbar.Toggle>
          
          <Navbar.Collapse id="basic-navbar-nav">
            {/* Navigation Links */}
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/about">About</Nav.Link>
              <Nav.Link as={Link} to="/products">Products</Nav.Link>
              <Nav.Link as={Link} to="/contact">Contact</Nav.Link>

              {/* Categories Dropdown */}
              <Dropdown>
                <Dropdown.Toggle variant="link" className="nav-dropdown">
                  Categories
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/products?category=Paintings">Paintings</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/products?category=Palm Leaf">Palm Leaf</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/products?category=Sarees">Sarees</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/products?category=Wooden Crafts">Wooden Crafts</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>

            {/* Search Bar */}
            <Form className="search-form" onSubmit={handleSearchSubmit}>
              <div className="search-input-wrapper">
                <FormControl
                  type="search"
                  placeholder="Search products..."
                  className="search-input"
                  aria-label="Search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <Button variant="link" type="submit" className="search-btn">
                  <FaSearch />
                </Button>
              </div>
            </Form>

            {/* Shopping Cart & User Profile Icons */}
            <Nav className="nav-icons">
              {/* Shopping Cart with Dynamic Badge */}
              <Nav.Link as={Link} to="/cart" className="icon-link">
                <FaShoppingCart size={22} />
                {cartItemCount > 0 && (
                  <Badge pill bg="danger" className="cart-badge">
                    {cartItemCount}
                  </Badge>
                )}
              </Nav.Link>

              {/* User Authentication */}
              {isAuthenticated ? (
                <Dropdown>
                  <Dropdown.Toggle variant="link" className="user-dropdown">
                    <FaUserCircle size={22} />
                    <span className="user-name">{user?.name?.split(' ')[0]}</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end">
                    <Dropdown.Item as={Link} to="/profile">My Profile</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/orders">My Orders</Dropdown.Item>
                    {user?.role === 'admin' && (
                      <Dropdown.Item as={Link} to="/admin">Admin Dashboard</Dropdown.Item>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={logout}>
                      <FaSignOutAlt className="me-2" />
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login" className="icon-link">
                    <FaSignInAlt size={20} />
                    <span className="ms-2">Login</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to="/register" className="btn-register">
                    Register
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
