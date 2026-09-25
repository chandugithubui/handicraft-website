import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    // Check if product has stock
    if (product.stock !== undefined && product.stock <= 0) {
      alert('This product is out of stock');
      return;
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === product._id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        // Check if adding would exceed stock
        if (product.stock !== undefined && newQuantity > product.stock) {
          alert(`Only ${product.stock} items available in stock`);
          return prevItems;
        }
        return prevItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      
      // Check if initial quantity exceeds stock
      if (product.stock !== undefined && quantity > product.stock) {
        alert(`Only ${product.stock} items available in stock`);
        return prevItems;
      }
      
      return [...prevItems, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
