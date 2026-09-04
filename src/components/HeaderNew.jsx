import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiHeart, FiUser, FiShoppingBag, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './HeaderNew.css';

const HeaderNew = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const { getWishlistCount } = useWishlist();
  const { getCartItemCount } = useCart();
  
  const cartItemCount = getCartItemCount();
  const wishlistCount = getWishlistCount();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/category/all', label: 'Categories' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = isMobileMenuOpen ? 'auto' : 'hidden';
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleUserClick = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      <header className="header premium-header">
        <div className="header-background">
          <img src="/images/heropic.png" alt="Handicraft background" className="header-bg-image" />
          <div className="header-overlay"></div>
        </div>
        
        <div className="container">
          <div className="header-content">
            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-btn hide-desktop"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>

            {/* Logo */}
            <Link to="/" className="logo premium-logo">
              <div className="logo-icon">
                <span className="logo-text">Handicraft Hub</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="desktop-nav hide-mobile">
              <ul className="nav-list">
                {navLinks.map((link) => (
                  <li key={link.path} className="nav-item">
                    <Link 
                      to={link.path} 
                      className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right Actions */}
            <div className="header-actions">
              {/* Search */}
              <button 
                className="action-btn premium-action-btn"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Search"
              >
                <FiSearch />
              </button>

              {/* Wishlist */}
              <Link to="/wishlist" className="action-btn premium-action-btn" aria-label="Wishlist">
                <FiHeart />
                {wishlistCount > 0 && (
                  <span className="cart-count">{wishlistCount}</span>
                )}
              </Link>

              {/* Account */}
              <button 
                className="action-btn premium-action-btn" 
                aria-label="Account"
                onClick={handleUserClick}
              >
                <FiUser />
              </button>

              {/* Cart */}
              <Link to="/cart" className="action-btn cart-btn premium-action-btn" aria-label="Cart">
                <FiShoppingBag />
                {cartItemCount > 0 && (
                  <span className="cart-count">{cartItemCount}</span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="search-bar premium-search-bar">
            <div className="container">
              <form onSubmit={handleSearch} className="search-input-wrapper">
                <FiSearch className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search for handicrafts, artisans, categories..." 
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button 
                  type="button"
                  className="search-close"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <FiX />
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-content">
          <div className="mobile-nav-header">
            <div className="logo">
              <span className="logo-text">Handicraft Hub</span>
            </div>
            <button 
              className="mobile-close-btn"
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              <FiX />
            </button>
          </div>

          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              {navLinks.map((link) => (
                <li key={link.path} className="mobile-nav-item">
                  <Link 
                    to={link.path} 
                    className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="mobile-nav-item">
                <Link to="/track-order" className="mobile-nav-link" onClick={closeMobileMenu}>
                  Track Order
                </Link>
              </li>
              <li className="mobile-nav-item">
                {isAuthenticated ? (
                  <button className="mobile-nav-link auth-link" onClick={() => { logout(); closeMobileMenu(); }}>
                    Logout
                  </button>
                ) : (
                  <Link to="/login" className="mobile-nav-link auth-link" onClick={closeMobileMenu}>
                    Login / Register
                  </Link>
                )}
              </li>
            </ul>
          </nav>

          <div className="mobile-nav-footer">
            <p className="mobile-nav-text">Supporting Indian Artisans</p>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-overlay" onClick={closeMobileMenu}></div>
      )}
    </>
  );
};

export default HeaderNew;
