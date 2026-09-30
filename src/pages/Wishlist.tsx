import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiTrash2, FiShoppingCart, FiCheck } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart }     from '../context/CartContext';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, cartItems, getCartItemCount }           = useCart();
  const navigate = useNavigate();

  // Per-item notice: null | 'added' | error string
  const [notices, setNotices] = useState<Record<string, string | null>>({});

  const setNotice = (id: string, msg: string | null) => {
    setNotices((prev) => ({ ...prev, [id]: msg }));
    if (msg) setTimeout(() => setNotices((prev) => ({ ...prev, [id]: null })), 3000);
  };

  /**
   * Returns the quantity of this product currently in the cart.
   * Uses the same _id comparison pattern as CartContext.
   */
  const qtyInCart = (productId: string): number => {
    const item = cartItems.find((i) => String(i._id) === String(productId));
    return item ? item.quantity : 0;
  };

  /** Total items across the whole cart (for the Go-to-Cart badge). */
  const totalCartCount = getCartItemCount();

  const handleAddToCart = (product: any) => {
    const res = addToCart(product, 1);
    if (!res.success) {
      setNotice(product._id, res.message || 'Could not add to cart.');
    } else {
      setNotice(product._id, 'added');
    }
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId);
  };

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <div className="empty-wishlist">
            <FiHeart className="empty-icon" />
            <h2>Your wishlist is empty</h2>
            <p>Save your favourite handicrafts for later</p>
            <Link to="/products" className="btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Wishlist grid ────────────────────────────────────────────────────────────
  return (
    <div className="wishlist-page">
      <div className="container">

        {/* Header */}
        <div className="wishlist-header">
          <h1>My Wishlist</h1>
          <p>{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}</p>

          <div className="wishlist-header-actions">
            {/* Go to Cart — visible whenever cart has items */}
            {totalCartCount > 0 && (
              <button
                className="btn-go-to-cart-header"
                onClick={() => navigate('/cart')}
              >
                <FiShoppingCart />
                Cart ({totalCartCount})
              </button>
            )}

            {wishlistItems.length > 0 && (
              <button className="clear-wishlist-btn" onClick={clearWishlist}>
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="wishlist-grid">
          {wishlistItems.map((product) => {
            const rawImg = product.image || product.imageUrl || '/images/HandcraftedWoodenBowl.webp';
            const imgSrc = rawImg.startsWith('http') || rawImg.startsWith('/') ? rawImg : `/${rawImg}`;

            const qty      = qtyInCart(product._id);
            const inCart   = qty > 0;
            const notice   = notices[product._id];
            const isAdded  = notice === 'added' || inCart;
            const isError  = notice && notice !== 'added';

            return (
              <div key={product._id} className="wishlist-item">

                {/* Product image */}
                <Link to={`/product/${product._id}`} className="wishlist-item-image-link">
                  <div className="wishlist-item-image">
                    <img
                      src={imgSrc}
                      alt={product.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/HandcraftedWoodenBowl.webp';
                      }}
                    />
                    {/* Qty badge on image */}
                    {inCart && (
                      <span className="wishlist-cart-badge">{qty} in cart</span>
                    )}
                  </div>
                </Link>

                {/* Details */}
                <div className="wishlist-item-details">
                  <h3>
                    <Link to={`/product/${product._id}`} className="wishlist-item-name-link">
                      {product.name}
                    </Link>
                  </h3>

                  {product.description && (
                    <p className="wishlist-item-description">{product.description}</p>
                  )}

                  <p className="wishlist-item-price">₹{product.price.toLocaleString()}</p>

                  {/* ── Action buttons ── */}
                  <div className="wishlist-item-actions">
                    <button
                      className={`btn-add-to-cart ${isAdded ? 'btn-add-to-cart--added' : ''}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock !== undefined && product.stock <= 0}
                    >
                      {isAdded ? <FiCheck /> : <FiShoppingBag />}
                      {product.stock !== undefined && product.stock <= 0
                        ? 'Out of Stock'
                        : isAdded
                          ? `Added (${qty})`
                          : 'Add to Cart'}
                    </button>

                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveFromWishlist(product._id)}
                    >
                      <FiTrash2 />
                      Remove
                    </button>
                  </div>

                  {/* ── Error notice ── */}
                  {isError && (
                    <p className="wishlist-stock-notice wishlist-stock-notice--error">
                      {notice}
                    </p>
                  )}

                  {/* ── Go to Cart — appears below buttons once item is in cart ── */}
                  {inCart && (
                    <Link to="/cart" className="btn-go-to-cart">
                      <FiShoppingCart />
                      Go to Cart · {qty} item{qty !== 1 ? 's' : ''}
                    </Link>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Wishlist;
