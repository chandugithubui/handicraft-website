import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import About from './pages/About';  // Import About component
import Home from './pages/Home'; 
import Contact from './pages/Contact';
import Product from './pages/Products';
import CategoryPage from './pages/CategoryPage';  // CategoryPage to show products of a specific category
import Cart from './pages/Cart';  // Import Cart page
import ProductDetail from './pages/ProductDetail';  // Import ProductDetail page
import Checkout from './pages/Checkout';  // Import Checkout page
import OrderConfirmation from './pages/OrderConfirmation';  // Import OrderConfirmation page
import './css/mobile-responsive.css';  // Import mobile responsive styles

const App = () => {
  return (
    <CartProvider>
      <Router>
        <Header />
        <Routes>
          {/* Home Route */}
          <Route path="/" element={<Home />} />

          {/* About Route */}
          <Route path="/about" element={<About />} />  {/* Render the About page here */}

          {/* Contact Route */}
          <Route path="/contact" element={<Contact />} />

          {/* Product Route */}
          <Route path="/products" element={<Product />} />

          {/* Category Page Route for individual categories */}
          <Route path="/category/:categoryId" element={<CategoryPage />} />  {/* Dynamic route for CategoryPage */}

          {/* Cart Route */}
          <Route path="/cart" element={<Cart />} />

          {/* Product Detail Route */}
          <Route path="/product/:productId" element={<ProductDetail />} />

          {/* Checkout Route */}
          <Route path="/checkout" element={<Checkout />} />

          {/* Order Confirmation Route */}
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
        </Routes>
        <Footer />
      </Router>
    </CartProvider>
  );
};

export default App;
