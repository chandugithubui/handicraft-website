/**
 * src/context/WishlistContext.tsx
 *
 * Bridge Context powering Redux-backed Wishlist State with MongoDB Server Persistence.
 * Completely replaces localStorage with Redux and Database storage.
 */

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addToWishlist as reduxAddToWishlist,
  removeFromWishlist as reduxRemoveFromWishlist,
  clearWishlist as reduxClearWishlist,
  fetchWishlistFromServer,
  toggleWishlistOnServer,
  removeFromWishlistOnServer,
  WishlistItem,
} from '../store/slices/wishlistSlice';
import { useAuth } from './AuthContext';

interface WishlistContextValue {
  wishlistItems: WishlistItem[];
  addToWishlist: (product: any) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getWishlistCount: () => number;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { items: wishlistItems, loading } = useAppSelector((state) => state.wishlist);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const hasFetchedRef = useRef(false);

  // Wait for AuthContext to finish rehydrating before syncing with server
  useEffect(() => {
    if (authLoading) return; // don't act on stale isAuthenticated=false during load
    if (isAuthenticated) {
      if (!hasFetchedRef.current) {
        hasFetchedRef.current = true;
        dispatch(fetchWishlistFromServer());
      }
    } else {
      hasFetchedRef.current = false;
      if (wishlistItems.length > 0) {
        dispatch(reduxClearWishlist());
      }
    }
  }, [authLoading, isAuthenticated, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const addToWishlist = (product: any) => {
    dispatch(reduxAddToWishlist(product));
    if (isAuthenticated) {
      dispatch(toggleWishlistOnServer(product._id));
    }
  };

  const removeFromWishlist = (productId: string) => {
    dispatch(reduxRemoveFromWishlist(productId));
    if (isAuthenticated) {
      dispatch(removeFromWishlistOnServer(productId));
    }
  };

  const isInWishlist = (productId: string) => {
    if (!productId) return false;
    const targetId = String(productId);
    return wishlistItems.some((item) => String(item._id) === targetId);
  };

  const clearWishlist = () => {
    dispatch(reduxClearWishlist());
    if (isAuthenticated) {
      // Clear every item on the server so it doesn't come back on refresh
      wishlistItems.forEach((item) => {
        dispatch(removeFromWishlistOnServer(item._id));
      });
    }
  };

  const getWishlistCount = () => {
    if (!isAuthenticated) return 0;
    return wishlistItems.length;
  };

  const value: WishlistContextValue = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount,
    loading,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
