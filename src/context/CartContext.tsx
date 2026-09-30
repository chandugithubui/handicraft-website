/**
 * src/context/CartContext.tsx
 *
 * Bridge Context powering Redux-backed Cart State with MongoDB Server Persistence.
 * Completely replaces localStorage with Redux and Database storage.
 */

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addToCart as reduxAddToCart,
  removeFromCart as reduxRemoveFromCart,
  updateQuantity as reduxUpdateQuantity,
  clearCart as reduxClearCart,
  clearStockAlert as reduxClearStockAlert,
  fetchCartFromServer,
  saveItemToServer,
  removeItemFromServer,
  clearServerCart,
  syncCartWithServer,
  CartItem,
} from '../store/slices/cartSlice';
import { useAuth } from './AuthContext';

interface CartContextValue {
  cartItems: CartItem[];
  addToCart: (product: any, quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  stockAlert: string | null;
  clearStockAlert: () => void;
  loading: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { items: cartItems, stockAlert, loading } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAuth();
  const hasSyncedRef = useRef(false);

  // Sync / fetch cart from MongoDB when user logs in, or clear when logged out
  useEffect(() => {
    if (isAuthenticated) {
      if (!hasSyncedRef.current) {
        hasSyncedRef.current = true;
        if (cartItems.length > 0) {
          // Sync any offline items to MongoDB
          dispatch(syncCartWithServer(cartItems));
        } else {
          // Fetch existing cart from MongoDB
          dispatch(fetchCartFromServer());
        }
      }
    } else {
      hasSyncedRef.current = false;
      if (cartItems.length > 0) {
        dispatch(reduxClearCart());
      }
    }
  }, [isAuthenticated, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const addToCart = (product: any, quantity: number = 1) => {
    const stock = product.stock !== undefined ? product.stock : 999;

    if (stock <= 0) {
      return { success: false, message: 'This product is out of stock' };
    }

    const existing = cartItems.find((i) => i._id === product._id);
    const existingQty = existing ? existing.quantity : 0;

    if (existingQty >= stock) {
      return {
        success: false,
        message: `Maximum stock limit reached (${stock} items)`,
      };
    }

    const addedQty = Math.min(quantity, stock - existingQty);

    // 1. Optimistic Update in Redux
    dispatch(reduxAddToCart({ product, quantity: addedQty }));

    // 2. Persist to MongoDB if authenticated
    if (isAuthenticated) {
      dispatch(saveItemToServer({ productId: product._id, quantity: existingQty + addedQty }));
    }

    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    dispatch(reduxRemoveFromCart(productId));
    if (isAuthenticated) {
      dispatch(removeItemFromServer(productId));
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch(reduxUpdateQuantity({ productId, quantity }));
    if (isAuthenticated) {
      if (quantity <= 0) {
        dispatch(removeItemFromServer(productId));
      } else {
        dispatch(saveItemToServer({ productId, quantity }));
      }
    }
  };

  const clearCart = () => {
    dispatch(reduxClearCart());
    if (isAuthenticated) {
      dispatch(clearServerCart());
    }
  };

  const getCartTotal = () => {
    if (!isAuthenticated) return 0;
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    if (!isAuthenticated) return 0;
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const clearStockAlert = () => {
    dispatch(reduxClearStockAlert());
  };

  const value: CartContextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    stockAlert,
    clearStockAlert,
    loading,
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

export default CartContext;
