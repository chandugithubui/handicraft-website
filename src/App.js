import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import AnnouncementBar from './components/AnnouncementBar';
import HeaderNew from './components/HeaderNew';
import FooterNew from './components/FooterNew';
import About from './pages/About';
import Home from './pages/Home'; 
import Contact from './pages/Contact';
import Product from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import CategoryPage from './pages/CategoryPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import ArtisanProfile from './pages/ArtisanProfile';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <ScrollToTop />
            <AnnouncementBar />
            <HeaderNew />
            <main className="main-content">
              <Routes>
                {/* Home Route */}
                <Route path="/" element={<Home />} />

                {/* About Route */}
                <Route path="/about" element={<About />} />

                {/* Contact Route */}
                <Route path="/contact" element={<Contact />} />

                {/* Product Route */}
                <Route path="/products" element={<Product />} />
                <Route path="/product/:id" element={<ProductDetail />} />

                {/* Category Page Route for individual categories */}
                <Route path="/category/:categoryId" element={<CategoryPage />} />

                {/* Cart Route */}
                <Route path="/cart" element={<Cart />} />

                {/* Wishlist Route */}
                <Route path="/wishlist" element={<Wishlist />} />

                {/* Profile Route */}
                <Route path="/profile" element={<Profile />} />

                {/* Checkout Routes */}
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/orders" element={<Orders />} />

                {/* Admin Route */}
                <Route path="/admin" element={<AdminDashboard />} />

                {/* Artisan Profile Route */}
                <Route path="/artisan/:slug" element={<ArtisanProfile />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </main>
            <FooterNew />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
