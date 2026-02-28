import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaEye, FaStar } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i <= rating ? 'text-warning' : 'text-secondary'}
          style={{ fontSize: '12px' }}
        />
      );
    }
    return stars;
  };

  return (
    <Card className="h-100 product-card shadow-sm">
      <div className="position-relative">
        <Card.Img
          variant="top"
          src={product.image || '/images/placeholder-product.jpg'}
          alt={product.name}
          style={{ height: '200px', objectFit: 'cover' }}
          className="product-image"
        />
        {product.isNew && (
          <Badge bg="success" className="position-absolute top-0 start-0 m-2">
            New
          </Badge>
        )}
        {product.discount > 0 && (
          <Badge bg="danger" className="position-absolute top-0 end-0 m-2">
            -{product.discount}%
          </Badge>
        )}
      </div>
      
      <Card.Body className="d-flex flex-column">
        <Card.Title className="fs-6 fw-bold text-truncate" title={product.name}>
          {product.name}
        </Card.Title>
        
        <Card.Text className="text-muted small flex-grow-1">
          {product.description && product.description.length > 80
            ? `${product.description.substring(0, 80)}...`
            : product.description}
        </Card.Text>

        {product.rating && (
          <div className="mb-2">
            {renderStars(product.rating)}
            <span className="text-muted small ms-1">({product.reviews || 0})</span>
          </div>
        )}

        <div className="mb-3">
          <span className="fw-bold text-primary fs-5">₹{product.price}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-muted text-decoration-line-through ms-2">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        <div className="mt-auto d-flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddToCart}
            className="flex-fill d-flex align-items-center justify-content-center gap-1"
          >
            <FaShoppingCart size={12} />
            Add to Cart
          </Button>
          
          <Button
            as={Link}
            to={`/product/${product._id}`}
            variant="outline-secondary"
            size="sm"
            className="d-flex align-items-center justify-content-center"
          >
            <FaEye size={12} />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
