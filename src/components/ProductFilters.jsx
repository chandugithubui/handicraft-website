import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Accordion } from 'react-bootstrap';
import { FaFilter, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import './ProductFilters.css';

const ProductFilters = ({ onFilterChange, activeFilters }) => {
  const [categories, setCategories] = useState([]);
  const materials = ['Wood', 'Metal', 'Clay', 'Fabric', 'Stone', 'Bamboo'];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const getApiUrl = () => {
        if (window.location.hostname === 'handicraft-website-fyao.vercel.app' ||
            window.location.hostname.includes('vercel.app')) {
          return 'https://handicraft-website.onrender.com/api';
        }
        return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      };
      const API_URL = getApiUrl();
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilterChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  const clearFilters = () => {
    onFilterChange('clear', null);
  };

  const hasActiveFilters = Object.keys(activeFilters).some(
    key => activeFilters[key] && activeFilters[key] !== ''
  );

  return (
    <Card className="product-filters">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span><FaFilter className="me-2" />Filters</span>
        {hasActiveFilters && (
          <Button variant="link" size="sm" onClick={clearFilters}>
            <FaTimes className="me-1" />Clear All
          </Button>
        )}
      </Card.Header>
      <Card.Body>
        <Accordion defaultActiveKey="0">
          {/* Category Filter */}
          <Accordion.Item eventKey="0">
            <Accordion.Header>Category</Accordion.Header>
            <Accordion.Body>
              <Form.Check
                type="radio"
                label="All Categories"
                name="category"
                id="category-all"
                checked={!activeFilters.category}
                onChange={() => handleFilterChange('category', '')}
                className="mb-2"
              />
              {categories.map((category) => (
                <Form.Check
                  key={category._id}
                  type="radio"
                  label={category.name}
                  name="category"
                  id={`category-${category._id}`}
                  checked={activeFilters.category === category.name}
                  onChange={() => handleFilterChange('category', category.name)}
                  className="mb-2"
                />
              ))}
            </Accordion.Body>
          </Accordion.Item>

          {/* Material Filter */}
          <Accordion.Item eventKey="1">
            <Accordion.Header>Material</Accordion.Header>
            <Accordion.Body>
              <Form.Check
                type="radio"
                label="All Materials"
                name="material"
                id="material-all"
                checked={!activeFilters.material}
                onChange={() => handleFilterChange('material', '')}
                className="mb-2"
              />
              {materials.map((material) => (
                <Form.Check
                  key={material}
                  type="radio"
                  label={material}
                  name="material"
                  id={`material-${material}`}
                  checked={activeFilters.material === material}
                  onChange={() => handleFilterChange('material', material)}
                  className="mb-2"
                />
              ))}
            </Accordion.Body>
          </Accordion.Item>

          {/* Price Range Filter */}
          <Accordion.Item eventKey="2">
            <Accordion.Header>Price Range</Accordion.Header>
            <Accordion.Body>
              <Row>
                <Col md={6}>
                  <Form.Label>Min Price</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="₹0"
                    value={activeFilters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Max Price</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="₹10000"
                    value={activeFilters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Card.Body>
    </Card>
  );
};

export default ProductFilters;
