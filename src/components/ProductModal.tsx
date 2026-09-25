import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaHeart, FaShoppingBag, FaTimes } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './ProductModal.css';

const ProductModal = ({ show, onHide, product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  const handleAddToCart = () => {
  const productWithId = {
    ...product,
    _id: product._id,
    price: Number(product.price)
  };

  addToCart(productWithId);
  onHide();
};

  const handleWishlist = () => {
  const productWithId = {
    ...product,
    _id: product._id,
    price: Number(product.price)
  };

  addToWishlist(productWithId);
};

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      size="lg"
      className="product-modal"
    >
      <Modal.Header className="modal-header-custom">
        <Button variant="link" className="close-btn" onClick={onHide}>
          <FaTimes />
        </Button>
      </Modal.Header>
      <Modal.Body className="modal-body-custom">
        <div className="modal-content-wrapper">
          <div className="modal-image-section">
            <img 
              src={product.image} 
              alt={product.name} 
              className="modal-product-image"
            />
          </div>
          <div className="modal-details-section">
            <h2 className="modal-product-title">{product.name}</h2>
            <div className="modal-product-rating">
              <FaHeart className="rating-icon" />
              <span>{product.rating}</span>
            </div>
            <p className="modal-product-price">
              ₹{Number(product.price).toLocaleString('en-IN')}
           </p>
            <p className="modal-product-description">
              Handcrafted with love by skilled artisans, this piece represents the rich cultural heritage of Indian craftsmanship. Each item is unique and tells a story of tradition and artistry.
            </p>
            <div className="modal-actions">
              <Button variant="primary" className="add-to-cart-btn" onClick={handleAddToCart}>
                <FaShoppingBag className="btn-icon" />
                Add to Cart
              </Button>
              <Button 
                    variant="outline" 
                    className={`wishlist-btn ${isInWishlist(product._id) ? 'active' : ''}`} 
                    onClick={handleWishlist}
                  >
                    <FaHeart className="btn-icon" />
                    {isInWishlist(product._id) ? 'In Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ProductModal;
