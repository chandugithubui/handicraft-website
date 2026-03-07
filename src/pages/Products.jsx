import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Carousel, Form, Modal } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';  // Import axios for HTTP requests

const Product = () => {
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);  // State to manage View Details modal visibility
  const [selectedProduct, setSelectedProduct] = useState(null); // State to manage selected related product
  const [selectedSaree, setSelectedSaree] = useState(null); // State to manage selected saree for details
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', imageUrl: '' }); // State for new product

  // Sample product data
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
    setSelectedProduct(product);  // Set the selected product for details
    setShowDetails(true);  // Show the product details modal
  };

  const handleViewDetailsSaree = () => {
    setSelectedSaree({
      name: 'Pattachitra Saree',
      artist: 'Susanta Moharana',
      price: '₹25,000',
      description: 'A traditional Pattachitra saree designed by Susanta Moharana, featuring intricate hand-painted motifs depicting mythological stories.',
    });
    setShowDetails(true);  // Show the saree details modal
  };

  const handleCloseDetails = () => {
    setShowDetails(false);  // Close the details modal
    setSelectedProduct(null);  // Clear selected product
    setSelectedSaree(null);  // Clear selected saree
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    try {
      // Send the product details to the backend API
      const response = await axios.post('http://localhost:5000/api/products', newProduct);
      console.log('Product added:', response.data);
      alert('Product added successfully!');
      // Optionally reset form
      setNewProduct({ name: '', price: '', description: '', imageUrl: '' });
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product!');
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
                  alt={`Product ${index + 1}`}
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
            <span style={{ textDecoration: 'line-through' }}>₹{product.price}</span>
          </p>
          <p style={{ color: '#28a745' }}>Rating: {product.rating} / 5 (Based on {product.reviews.length} reviews)</p>

          {/* Quantity Selection */}
          <Form.Group controlId="quantitySelect">
            <Form.Label style={{ fontWeight: 'bold' }}>Quantity</Form.Label>
            <Form.Control
              as="select"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            >
              {[...Array(10)].map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Button variant="primary" onClick={handleAddToCart} style={{ backgroundColor: '#007bff' }}>
            Add to Cart
          </Button>

          {/* Product Description */}
          <h4 className="mt-4" style={{ color: '#17a2b8' }}>Product Description</h4>
          <p>{product.description}</p>

          {/* Customer Reviews */}
          <h4 className="mt-4" style={{ color: '#17a2b8' }}>Customer Reviews</h4>
          {product.reviews.map((review, index) => (
            <div key={index} style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '10px' }}>
              <h5>{review.user}</h5>
              <p>Rating: {review.rating} / 5</p>
              <p>{review.text}</p>
            </div>
          ))}
        </Col>
      </Row>

      {/* Form to Add New Product */}
      <Row className="mt-5 bg-body-secondary">
  <Col md={6}>
    <h3>Add New Product</h3>
    <form onSubmit={handleSubmitProduct}>
      <div className="mb-3">
        <label htmlFor="productName" className="form-label">Product Name</label>
        <input
          type="text"
          className="form-control"
          id="productName"
          placeholder="Enter product name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="productPrice" className="form-label">Price</label>
        <input
          type="number"
          className="form-control"
          id="productPrice"
          placeholder="Enter product price"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="productDescription" className="form-label">Description</label>
        <textarea
          className="form-control"
          id="productDescription"
          rows="3"
          placeholder="Enter product description"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="productImageUrl" className="form-label">Image URL</label>
        <input
          type="text"
          className="form-control"
          id="productImageUrl"
          placeholder="Enter image URL"
          value={newProduct.imageUrl}
          onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
        />
      </div>

      <button type="submit" className="btn btn-success mt-3">
        Submit Product
      </button>
    </form>
  </Col>
</Row>


      {/* YouTube Video Section */}
      <Row className="mt-5">
        <Col>
          <h3 style={{ color: '#007bff' }}>Product Video</h3>
          <div className="video-container" style={{ textAlign: 'center', marginTop: '20px' }}>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/U6qEldqJjdk?si=god0gvB12Fi61FQb"
              title="YouTube video player 1"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
          <div className="video-container" style={{ textAlign: 'center', marginTop: '20px' }}>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/YMi64MBrBBM?si=zPbUSV4tRAm6-MDe"   // Replace with the second video ID
              title="YouTube video player 2"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </Col>
      </Row>

      {/* Pattachitra Saree Paintings Section */}
      <Row className="mt-5">
        <Col>
          <h3 style={{ color: '#6c757d' }}>Pattachitra Saree Paintings</h3>
          <p>
            Pattachitra is a traditional form of painting from Odisha, India, known for its intricate details and mythological narratives...
          </p>
        </Col>
      </Row>

      <Row className="mt-4">
        {pattachitraPaintings.map((image, index) => (
          <Col md={4} key={index} className="mb-4">
            <Card>
              <Card.Img variant="top" src={image} style={{ height: '300px', objectFit: 'cover' }} />
              <Card.Body>
                <Card.Title style={{ color: '#28a745' }}>Pattachitra Saree {index + 1}</Card.Title>
                <Button variant="outline-primary" onClick={handleViewDetailsSaree}>View Details</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Related Products Section */}
      <h3 className="mt-5" style={{ color: '#17a2b8' }}>Related Products</h3>
      <Row>
        {relatedProducts.map((product) => (
          <Col sm={6} md={4} lg={3} key={product.id} className="mb-4">
            <Card>
              <Card.Img variant="top" src={product.image} style={{ height: '200px', objectFit: 'cover' }} />
              <Card.Body>
                <Card.Title style={{ color: '#6c757d' }}>{product.name}</Card.Title>
                <Card.Text>₹{product.price}</Card.Text>
                <Button variant="outline-primary" onClick={() => handleViewDetailsProduct(product)}>View Details</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Product Details Modal */}
      <Modal show={showDetails} onHide={handleCloseDetails}>
        <Modal.Header closeButton>
          <Modal.Title>Product Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <>
              <h4>{selectedProduct.name}</h4>
              <p>Artist: {selectedProduct.artist}</p>
              <p>Price: ₹{selectedProduct.price}</p>
              <p>{selectedProduct.description}</p>
            </>
          )}
          {selectedSaree && (
            <>
              <h4>{selectedSaree.name}</h4>
              <p>Artist: {selectedSaree.artist}</p>
              <p>Price: {selectedSaree.price}</p>
              <p>{selectedSaree.description}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetails}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Product;
