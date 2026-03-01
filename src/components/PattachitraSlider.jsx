import React, { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';

const PattachitraSlider = () => {
  // Initial list of all products
  const allProducts = [
    { id: 1, title: 'Teapot Painting', category: 'Paintings', price: '₹800', image: '../images/teapot.webp' },
    { id: 2, title: 'Gift Items', category: 'Gift Items', price: '₹2000', image: '../images/GiftsItems.webp' },
    { id: 3, title: 'Glass Bottle', category: 'Home Decor', price: '₹1000', image: '../images/glassbottle.webp' },
    { id: 4, title: 'Elephant Painting', category: 'Paintings', price: '₹700', image: '../images/elephant.webp' },
    { id: 5, title: 'Handcrafted Vase', category: 'Home Decor', price: '₹1200', image: '../images/handmadevase.webp' },
    { id: 6, title: 'Wooden Toys', category: 'Gift Items', price: '₹600', image: '../images/toys.jpg' },
    { id: 7, title: 'Pattachitra Wall Art', category: 'Paintings', price: '₹2500', image: '../images/pattachitrawall.jpg' },
    { id: 8, title: 'Wooden Coasters', category: 'Home Decor', price: '₹350', image: '../images/woodentoys.jpg' },
    { id: 9, title: 'Decorative Plate', category: 'Home Decor', price: '₹900', image: '../images/decorativeplate.webp' },
    { id: 10, title: 'Carved Wooden Sculpture', category: 'Gift Items', price: '₹1800', image: '../images/carvedwooden.jpg' },
    { id: 11, title: 'Tiled Pattachitra Art', category: 'Paintings', price: '₹3500', image: '../images/tilledpattachitra.webp' },
    { id: 12, title: 'Handcrafted Wooden Box', category: 'Gift Items', price: '₹900', image: '../images/handcraftwooden.jpg' },
  ];

  // Featured Handicrafts data
  const featuredHandicrafts = [
    { id: 1, title: 'Handcrafted Wooden Bowl', price: '₹1200', image: '../images/HandcraftedWoodenBowl.webp' },
    { id: 2, title: 'Traditional Metal Lamp', price: '₹3500', image: '../images/metallamp.jpg' },
    { id: 3, title: 'Handpainted Wooden Tray', price: '₹2200', image: '../images/woodentray.jpg' },
    { id: 4, title: 'Decorative Clay Pot', price: '₹800', image: '../images/claypot.jpg' },
  ];

  // Featured Collection data
  const featuredCollection = [
    { id: 1, title: 'Handcrafted Vase', price: '₹1500', image: '../images/handcraftvase.jpg' , artist: 'Rajesh Kumar' },
    { id: 2, title: 'Pattachitra Wall Art', price: '₹5000', image: '../images/pattachitrawallpainting.webp',artist: 'Archita' },
    { id: 3, title: 'Handcrafted Wooden Box', price: '₹900', image: '../images/woodenhandcraft.jpg',artist: 'Twinkle ' },
    { id: 4, title: 'Carved Wooden Sculpture', price: '₹1000', image: '../images/sculpture.webp', artist: 'Sunil' },
  ];

  // State for category selection, modal visibility, cart items, and product details
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  // Filter products based on selected category
  const filteredProducts = selectedCategory === 'All' 
    ? allProducts 
    : allProducts.filter((product) => product.category === selectedCategory);

  // Handle opening the modal
  const viewDetails = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Handle adding product to cart
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const updatedCart = [...prevItems, product];
      // Show an alert when item is added
      alert(`${product.title} has been added to your cart.`);
      return updatedCart;
    });
  };

  // Close the modal
  const handleCloseModal = () => setShowModal(false);

  return (
    <Container>
    {/* PattachitraSlider Section */}
    <Carousel interval={3000}>
      <Carousel.Item>
        <img className="d-block w-100 mt-3" src="../images/pattachitra1.jpg.jpg" alt="First slide" style={{ height: '500px', objectFit: 'cover', }} />
        <Carousel.Caption>
          <h3>Pattachitra Art 1</h3>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img className="d-block w-100 mt-3" src="../images/pattachitra2.jpg.jpg" alt="Second slide" style={{ height: '500px', objectFit: 'cover',}} />
        <Carousel.Caption>
          <h3>Pattachitra Art 2</h3>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img className="d-block w-100 mt-3" src="../images/pattachitra3.jpg.jpg" alt="Third slide" style={{ height: '500px', objectFit: 'cover',}} />
        <Carousel.Caption>
          <h3>Pattachitra Art 3</h3>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>

      {/* Category Filter Section */}
      <Row className="my-5">
        <Col md={3}>
          <h4>Filter by Category</h4>
          <Button variant={selectedCategory === 'All' ? 'primary' : 'outline-primary'} onClick={() => setSelectedCategory('All')} className="mb-2" block>All</Button>
          <Button variant={selectedCategory === 'Paintings' ? 'primary' : 'outline-primary'} onClick={() => setSelectedCategory('Paintings')} className="mb-2" block>Paintings</Button>
          <Button variant={selectedCategory === 'Gift Items' ? 'primary' : 'outline-primary'} onClick={() => setSelectedCategory('Gift Items')} className="mb-2" block>Gift Items</Button>
          <Button variant={selectedCategory === 'Home Decor' ? 'primary' : 'outline-primary'} onClick={() => setSelectedCategory('Home Decor')} className="mb-2" block>Home Decor</Button>
        </Col>

        {/* Products Grid */}
        <Col md={9} className="bg-light p-4 rounded">
          <h2>Shop Our Pattachitra Art</h2>
          <Row className="my-4">
            {filteredProducts.map((product) => (
              <Col sm={6} md={4} lg={3} className="mb-4" key={product.id}>
                <Card>
                  <Card.Img variant="top" src={product.image} style={{ height: '300px', objectFit: 'cover' }} />
                  <Card.Body>
                    <Card.Title>{product.title}</Card.Title>
                    <Card.Text>{product.price}</Card.Text>
                    <Button variant="primary" onClick={() => addToCart(product)}>Add to Cart</Button>
                    <Button variant="link" onClick={() => viewDetails(product)}>View Details</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Featured Handicrafts Section */}
      <section className="my-5">
        <h2>Featured Handicrafts</h2>
        <Row className="my-4">
          {featuredHandicrafts.map((handicraft) => (
            <Col sm={6} md={4} lg={3} className="mb-4" key={handicraft.id}>
              <Card>
                <Card.Img variant="top" src={handicraft.image} style={{ height: '300px', objectFit: 'cover' }} />
                <Card.Body>
                  <Card.Title>{handicraft.title}</Card.Title>
                  <Card.Text>{handicraft.price}</Card.Text>
                  <Button variant="primary" onClick={() => addToCart(handicraft)}>Add to Cart</Button>
                  <Button variant="link" onClick={() => viewDetails(handicraft)}>View Details</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
       {/* Featured Collection Section */}
       <section className="my-5">
        <h2>Featured Collection</h2>
        <Row className="my-4">
          {featuredCollection.map((product) => (
            <Col sm={6} md={4} lg={3} className="mb-4" key={product.id}>
              <Card>
                <Card.Img variant="top" src={product.image} style={{ height: '300px', objectFit: 'cover' }} />
                <Card.Body>
                  <Card.Title>{product.title}</Card.Title>
                  <Card.Text>{product.price}</Card.Text>
                  <Card.Text><strong>Artist:</strong> {product.artist}</Card.Text> {/* Added artist info here */}
                  <Button variant="primary" onClick={() => addToCart(product)}>Add to Cart</Button>
                  <Button variant="link" onClick={() => viewDetails(product)}>View Details</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* Modal for Product Details */}
      {selectedProduct && (
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{selectedProduct.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <img src={selectedProduct.image} alt={selectedProduct.title} style={{ width: '100%', height: 'auto' }} />
            <p>Price: {selectedProduct.price}</p>
            <p>Description: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
            <Button variant="primary">Add to Cart</Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Cart Items Count */}
      <div className="my-3">
        <h4>Items in Cart: {cartItems.length}</h4>
      </div>
    </Container>
  );
};

export default PattachitraSlider;
