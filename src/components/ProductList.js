// src/components/ProductList.js
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { getProducts } from '../services/productService';
import ProductCard from './ProductCard';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productData = await getProducts();
        setProducts(productData);
        setError(null);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading products...</span>
        </Spinner>
        <p className="mt-3">Loading our beautiful handicrafts...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (products.length === 0) {
    return (
      <Container className="text-center py-5">
        <h3>No Products Available</h3>
        <p className="text-muted">We're adding new products soon. Please check back later!</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="text-center mb-4">
        <h2 className="fw-bold">Our Handicraft Collection</h2>
        <p className="text-muted">Discover authentic, handcrafted treasures from Raghurajpur artisans</p>
      </div>
      
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {products.map((product) => (
          <Col key={product._id} className="d-flex">
            <ProductCard product={product} className="w-100" />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ProductList;
