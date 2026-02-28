import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Form, Button, FormControl, Badge, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa"; // For cart and user icons
import { useCart } from "../context/CartContext"; // Import cart context
import axios from "axios"; // To fetch categories from the backend

const Header = () => {
  // State to manage categories and search query
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Use cart context
  const { itemCount } = useCart();

  // Fetch categories from the backend API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("https://handicraft-website.onrender.com/api/categories"); // Updated backend URL
        setCategories(response.data); // Store the categories in state
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []); // Only run once on mount

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    console.log("Searching for:", searchQuery);
    // Implement search logic here (perhaps redirect or filter products)
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        {/* Logo Section */}
        <Navbar.Brand as={Link} to="/">
          <img
            src="/images/logo.jpg" // Replace with the path to your logo
            alt="Handicraft Hub Logo"
            style={{ width: "150px", height: "50px", marginRight: "10px" }}
          />
          Handicraft Hub
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {/* Navigation Links */}
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
            <Nav.Link as={Link} to="/products">Products</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contact</Nav.Link>

            {/* Categories Dropdown */}
            <Dropdown>
              <Dropdown.Toggle variant="success" id="categories-dropdown">
                Categories
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {categories.map((category) => (
                  <Dropdown.Item key={category._id} as={Link} to={`/category/${category._id}`}>
                    {category.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Nav>

          {/* Search Bar */}
          <Form className="d-flex" onSubmit={handleSearchSubmit}>
            <FormControl
              type="search"
              placeholder="Search for products"
              className="me-2"
              aria-label="Search"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Button variant="outline-success" type="submit">Search</Button>
          </Form>

          {/* Shopping Cart & User Profile Icons */}
          <Nav>
            {/* Shopping Cart with Dynamic Badge */}
            <Nav.Link as={Link} to="/cart" className="d-flex align-items-center">
              <FaShoppingCart size={24} />
              {itemCount > 0 && (
                <Badge pill bg="danger" style={{ marginLeft: "5px" }}>
                  {itemCount}
                </Badge>
              )}
            </Nav.Link>

            {/* User Profile Icon */}
            <Nav.Link as={Link} to="/profile" className="d-flex align-items-center">
              <FaUserCircle size={24} />
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
