import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Cart Context
const CartContext = createContext();

// Initial state
const initialState = {
  cartItems: [],
  cartTotal: 0,
  itemCount: 0,
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.cartItems.find(
        item => item._id === action.payload._id
      );
      
      if (existingItem) {
        const updatedCart = state.cartItems.map(item =>
          item._id === action.payload._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          ...state,
          cartItems: updatedCart,
          itemCount: state.itemCount + 1,
          cartTotal: calculateTotal(updatedCart),
        };
      } else {
        const updatedCart = [...state.cartItems, { ...action.payload, quantity: 1 }];
        return {
          ...state,
          cartItems: updatedCart,
          itemCount: state.itemCount + 1,
          cartTotal: calculateTotal(updatedCart),
        };
      }

    case 'REMOVE_FROM_CART':
      const filteredCart = state.cartItems.filter(
        item => item._id !== action.payload
      );
      return {
        ...state,
        cartItems: filteredCart,
        itemCount: calculateItemCount(filteredCart),
        cartTotal: calculateTotal(filteredCart),
      };

    case 'UPDATE_QUANTITY':
      const updatedCartWithQuantity = state.cartItems.map(item =>
        item._id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        cartItems: updatedCartWithQuantity,
        itemCount: calculateItemCount(updatedCartWithQuantity),
        cartTotal: calculateTotal(updatedCartWithQuantity),
      };

    case 'CLEAR_CART':
      return initialState;

    case 'LOAD_CART':
      return {
        ...state,
        cartItems: action.payload.cartItems || [],
        itemCount: calculateItemCount(action.payload.cartItems || []),
        cartTotal: calculateTotal(action.payload.cartItems || []),
      };

    default:
      return state;
  }
};

// Helper functions
const calculateTotal = (cartItems) => {
  return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
};

const calculateItemCount = (cartItems) => {
  return cartItems.reduce((count, item) => count + item.quantity, 0);
};

// Cart Provider
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('handicraftCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: { cartItems: parsedCart } });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('handicraftCart', JSON.stringify(state.cartItems));
  }, [state.cartItems]);

  // Action creators
  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
