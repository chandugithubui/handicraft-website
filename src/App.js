import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import About from './pages/About';  // Import About component
import Home from './pages/Home'; 
import Contact from './pages/Contact';
import Product from './pages/Products';
import CategoryPage from './pages/CategoryPage';  // CategoryPage to show products of a specific category

const App = () => {
  return (
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
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
