import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import About from './pages/About';
import Home from './pages/Home'; 
import Contact from './pages/Contact';
import Product from './pages/Products';
import CategoryPage from './pages/CategoryPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Header />
          <Routes>
            {/* Home Route */}
            <Route path="/" element={<Home />} />

            {/* About Route */}
            <Route path="/about" element={<About />} />

            {/* Contact Route */}
            <Route path="/contact" element={<Contact />} />

            {/* Product Route */}
            <Route path="/products" element={<Product />} />

            {/* Category Page Route for individual categories */}
            <Route path="/category/:categoryId" element={<CategoryPage />} />

            {/* Cart Route */}
            <Route path="/cart" element={<Cart />} />

            {/* Checkout Routes */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/orders" element={<Orders />} />

            {/* Admin Route */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
          <Footer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
