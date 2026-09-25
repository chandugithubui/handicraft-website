import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiHeart, FiUser, FiShoppingBag, FiMenu, FiX, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './HeaderNew.css';

const HeaderNew = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isAuthenticated, user } = useAuth();
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

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
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
      setIsMobileMenuOpen(false);
      document.body.style.overflow = 'auto';
      setSearchQuery('');
    }
  };

  /** Handles logout: shows loading feedback, clears session, redirects to home */
  const handleLogout = async (closeMenu = false) => {
    setIsLoggingOut(true);
    if (closeMenu) closeMobileMenu();
    try {
      await logout();
      navigate('/');
    } finally {
      setIsLoggingOut(false);
      setIsUserMenuOpen(false);
    }
  };

  /** Render avatar: Google profile picture, initials, or generic icon */
  const getAvatarContent = () => {
    if (user?.picture) {
      return <img src={user.picture} alt="avatar" className="user-avatar-img" />;
    }
    const name = user?.displayName || user?.name || user?.email || '';
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
    return initials || <FiUser />;
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
              {/* Search – desktop only */}
              <button
                className="action-btn premium-action-btn hide-mobile"
                onClick={() => setIsSearchOpen((prev) => !prev)}
                aria-label="Search"
              >
                <FiSearch />
              </button>

              {/* Wishlist */}
              <Link to="/wishlist" className="action-btn premium-action-btn" aria-label="Wishlist">
                <FiHeart />
                {wishlistCount > 0 && <span className="cart-count">{wishlistCount}</span>}
              </Link>

              {/* Account – desktop: avatar dropdown if authenticated, icon-link otherwise */}
              <div className="user-menu-wrapper hide-mobile" ref={userMenuRef}>
                {isAuthenticated ? (
                  <>
                    <button
                      id="user-avatar-btn"
                      className={`action-btn premium-action-btn user-avatar-btn${isUserMenuOpen ? ' active' : ''}`}
                      aria-label="Account menu"
                      aria-expanded={isUserMenuOpen}
                      onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    >
                      <span className="user-avatar-circle">{getAvatarContent()}</span>
                    </button>

                    {isUserMenuOpen && (
                      <div className="user-dropdown" role="menu">
                        <div className="user-dropdown-header">
                          <span className="user-dropdown-name">
                            {user?.displayName || user?.name || user?.email?.split('@')[0] || 'User'}
                          </span>
                          <span className="user-dropdown-email">{user?.email}</span>
                        </div>
                        <div className="user-dropdown-divider" />
                        <Link
                          to="/profile"
                          className="user-dropdown-item"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FiSettings size={14} /> My Profile
                        </Link>
                        <button
                          id="logout-btn-desktop"
                          className="user-dropdown-item user-dropdown-logout"
                          role="menuitem"
                          onClick={() => handleLogout(false)}
                          disabled={isLoggingOut}
                        >
                          <FiLogOut size={14} />
                          {isLoggingOut ? 'Signing out…' : 'Sign Out'}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link to="/login" className="action-btn premium-action-btn" aria-label="Login">
                    <FiUser />
                  </Link>
                )}
              </div>

              {/* Cart */}
              <Link to="/cart" className="action-btn cart-btn premium-action-btn" aria-label="Cart">
                <FiShoppingBag />
                {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
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
                <button type="button" className="search-close" onClick={() => setIsSearchOpen(false)}>
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
            <button className="mobile-close-btn" onClick={closeMobileMenu} aria-label="Close menu">
              <FiX />
            </button>
          </div>

          {/* Mobile: user greeting when logged in */}
          {isAuthenticated && (
            <div className="mobile-user-greeting">
              <span className="mobile-user-avatar">
                {user?.picture
                  ? <img src={user.picture} alt="avatar" />
                  : (user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || <FiUser />)}
              </span>
              <div>
                <p className="mobile-user-name">{user?.displayName || user?.name || 'Welcome back!'}</p>
                <p className="mobile-user-email">{user?.email}</p>
              </div>
            </div>
          )}

          <div className="mobile-drawer-search">
            <form onSubmit={handleSearch} className="mobile-search-form">
              <FiSearch className="mobile-search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mobile-search-input"
              />
            </form>
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
                <Link to="/wishlist" className="mobile-nav-link" onClick={closeMobileMenu}>
                  Wishlist
                </Link>
              </li>
              <li className="mobile-nav-item">
                {isAuthenticated ? (
                  <Link to="/profile" className="mobile-nav-link" onClick={closeMobileMenu}>
                    My Account
                  </Link>
                ) : (
                  <Link to="/login" className="mobile-nav-link" onClick={closeMobileMenu}>
                    My Account
                  </Link>
                )}
              </li>
              <li className="mobile-nav-item">
                {isAuthenticated ? (
                  <button
                    id="logout-btn-mobile"
                    className="mobile-nav-link auth-link mobile-logout-btn"
                    onClick={() => handleLogout(true)}
                    disabled={isLoggingOut}
                  >
                    <FiLogOut size={16} />
                    {isLoggingOut ? 'Signing out…' : 'Sign Out'}
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
