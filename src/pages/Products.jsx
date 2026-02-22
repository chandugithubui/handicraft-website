import React, { useState } from "react";
import { Container, Row, Col, Button, Carousel, Form } from "react-bootstrap";
import axios from "axios";

const Products = () => {

  const BACKEND_URL = "https://handicraft-website.onrender.com";

  const [quantity, setQuantity] = useState(1);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: ""
  });

  const product = {
  title: "Handcrafted Wooden Bowl",
  price: 1200,
  discountPrice: 1000,
  description: "This handcrafted wooden bowl is made from sustainable wood.",
  images: [
    "/images/HandcraftedWoodenBowl.webp",
    "/images/handcraftedwoodenBowl2.jpg",
    "/images/handcraftedwoodenBowl3.webp"
  ],
  rating: 4.5
};

  const handleAddToCart = () => {
    alert(`${quantity} item(s) added to the cart!`);
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
        name: "",
        price: "",
        description: "",
        imageUrl: ""
      });

    } catch (error) {
      console.error(error);
      alert("Error adding product!");
    }
  };

  return (
    <Container className="my-5">

      <Row>
        <Col md={6}>
          <Carousel>
            {product.images.map((image, index) => (
              <Carousel.Item key={index}>
                <img
                  className="d-block w-100"
                   src={image}
                  alt={`Product ${index + 1}`}
                  style={{ height: "400px", objectFit: "cover" }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>

        <Col md={6}>
          <h2>{product.title}</h2>

          <p>
            <span style={{ fontSize: "20px", color: "red" }}>
              ₹{product.discountPrice}
            </span>{" "}
            <span style={{ textDecoration: "line-through" }}>
              ₹{product.price}
            </span>
          </p>

          <p>Rating: {product.rating} / 5</p>

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

          <Button className="mt-3" onClick={handleAddToCart}>
            Add to Cart
          </Button>

          <h4 className="mt-4">Product Description</h4>
          <p>{product.description}</p>
        </Col>
      </Row>

      {/* Add Product Form */}
      <Row className="mt-5 bg-light p-4">
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

export default Products;