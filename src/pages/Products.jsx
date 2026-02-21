import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Carousel, Form, Modal } from 'react-bootstrap';
import axios from 'axios';

const Product = () => {

  const BACKEND_URL = "https://handicraft-website.onrender.com";

  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSaree, setSelectedSaree] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: ''
  });

  const product = {
    id: 1,
    title: 'Handcrafted Wooden Bowl',
    price: 1200,
    discountPrice: 1000,
    description: 'This handcrafted wooden bowl is made from sustainable wood...',
    images: [
      '/images/HandcraftedwoodenBowl.webp',
      '/images/handcraftedwoodenBowl2.jpg',
      '/images/handcraftedwoodenBowl3.webp',
    ],
    rating: 4.5,
    reviews: [
      { user: 'John Doe', rating: 5, text: 'Excellent quality, very happy with it!' },
      { user: 'Jane Smith', rating: 4, text: 'Nice, but the finish could be better.' },
    ],
  };

  const pattachitraPaintings = [
    '/images/pattachitra1.jpg.jpeg',
    '/images/pattachitra2.jpg.jpeg',
    '/images/pattachitra3.jpg.jpeg',
  ];

  const relatedProducts = [
    { id: 1, name: 'Wooden Gifts', price: 1500, image: '/images/relatedProduct.webp', artist: 'Puspalata Jena', description: 'Beautiful handcrafted wooden gifts for all occasions.' },
    { id: 2, name: 'Handmade Bucket', price: 900, image: '/images/handmadevase.webp', artist: 'Bandana Mahapatra', description: 'Handcrafted bucket made from natural wood, perfect for storage.' },
    { id: 3, name: 'Hand Craft Vase', price: 1800, image: '/images/handcraftvase.jpg', artist: 'Prabhata Bariki', description: 'Exquisite hand-crafted vase with intricate designs.' },
  ];

  const handleAddToCart = () => {
    alert(`${quantity} item(s) added to the cart!`);
  };

  const handleViewDetailsProduct = (product) => {
    setSelectedProduct(product);
    setShowDetails(true);
  };

  const handleViewDetailsSaree = () => {
    setSelectedSaree({
      name: 'Pattachitra Saree',
      artist: 'Susanta Moharana',
      price: '₹25,000',
      description: 'A traditional Pattachitra saree designed by Susanta Moharana.'
    });
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedProduct(null);
    setSelectedSaree(null);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${BACKEND_URL}/api/products`,
        newProduct
      );

      alert("Product added successfully!");

      setNewProduct({
        name: '',
        price: '',
        description: '',
        imageUrl: ''
      });

    } catch (error) {
      console.error(error);
      alert("Error adding product!");
    }
  };

  return (
    <Container className="my-5" style={{ backgroundColor: '#f8f9fa' }}>
      <Row>
        <Col md={6}>
          <Carousel>
            {product.images.map((image, index) => (
              <Carousel.Item key={index}>
                <img
                  className="d-block w-100"
                  src={image}
                  alt={`Product slide ${index + 1}`}
                  style={{ height: '400px', objectFit: 'cover' }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>

        <Col md={6}>
          <h2 style={{ color: '#6c757d' }}>{product.title}</h2>

          <p>
            <span style={{ fontSize: '20px', color: 'red' }}>
              ₹{product.discountPrice}
            </span>{' '}
            <span style={{ textDecoration: 'line-through' }}>
              ₹{product.price}
            </span>
          </p>

          <p style={{ color: '#28a745' }}>
            Rating: {product.rating} / 5
          </p>

          <Form.Group>
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              as="select"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            >
              {[...Array(10)].map((_, index) => (
                <option key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Button
            variant="primary"
            className="mt-3"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>

          <h4 className="mt-4">Product Description</h4>
          <p>{product.description}</p>
        </Col>
      </Row>

      {/* Add Product Form */}
      <Row className="mt-5 bg-body-secondary p-4">
        <Col md={6}>
          <h3>Add New Product</h3>

          <form onSubmit={handleSubmitProduct}>

            <input
              className="form-control mb-3"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />

            <input
              className="form-control mb-3"
              type="number"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
            />

            <textarea
              className="form-control mb-3"
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
            />

            <input
              className="form-control mb-3"
              placeholder="Image URL"
              value={newProduct.imageUrl}
              onChange={(e) =>
                setNewProduct({ ...newProduct, imageUrl: e.target.value })
              }
            />

            <button className="btn btn-success">
              Submit Product
            </button>

          </form>
        </Col>
      </Row>

    </Container>
  );
};

export default Product;