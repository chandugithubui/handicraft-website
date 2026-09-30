/**
 * src/store/slices/wishlistSlice.ts
 *
 * Redux Toolkit Slice for Wishlist.
 * Includes instant client-cache hydration so wishlist counts NEVER reset to 0 on page refresh,
 * combined with automatic MongoDB synchronization for authenticated users.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { http } from '../../services/apiClient';

export interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  imageUrl?: string;
  category?: string;
  stock?: number;
  rating?: number;
  numReviews?: number;
  description?: string;
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
}

const loadInitialWishlist = (): WishlistItem[] => {
  try {
    const hasUser = localStorage.getItem('token') || localStorage.getItem('user');
    if (!hasUser) return [];
    const cached = localStorage.getItem('wishlist_cache') || localStorage.getItem('wishlist');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
};

const persistWishlist = (items: WishlistItem[]) => {
  try {
    localStorage.setItem('wishlist_cache', JSON.stringify(items));
    localStorage.setItem('wishlist', JSON.stringify(items));
  } catch (e) {}
};

const initialState: WishlistState = {
  items: loadInitialWishlist(),
  loading: false,
  error: null,
};

// Async thunk: Fetch user's wishlist from MongoDB
export const fetchWishlistFromServer = createAsyncThunk(
  'wishlist/fetchWishlistFromServer',
  async (_, { rejectWithValue }) => {
    try {
      const res = await http.get<{ success: boolean; items: WishlistItem[] }>('/user/wishlist');
      return res.items || [];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch wishlist from server');
    }
  }
);

// Async thunk: Toggle product in server wishlist
export const toggleWishlistOnServer = createAsyncThunk(
  'wishlist/toggleWishlistOnServer',
  async (productId: string, { rejectWithValue }) => {
    try {
      const res = await http.post<{ success: boolean; added: boolean; message: string }>(
        `/user/wishlist/${productId}`
      );
      return { productId, added: res.added };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk: Remove product from server wishlist
export const removeFromWishlistOnServer = createAsyncThunk(
  'wishlist/removeFromWishlistOnServer',
  async (productId: string, { rejectWithValue }) => {
    try {
      await http.delete(`/user/wishlist/${productId}`);
      return productId;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<any>) => {
      const product = action.payload;
      const targetId = String(product._id);
      const exists = state.items.some((item) => String(item._id) === targetId);
      if (exists) {
        state.items = state.items.filter((item) => String(item._id) !== targetId);
      } else {
        state.items.push({
          _id: targetId,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image || product.imageUrl,
          imageUrl: product.imageUrl || product.image,
          category: product.category,
          stock: product.stock,
          rating: product.rating,
          numReviews: product.numReviews,
          description: product.description,
        });
      }
      persistWishlist(state.items);
    },

    removeFromWishlist: (state, action: PayloadAction<string>) => {
      const targetId = String(action.payload);
      state.items = state.items.filter((item) => String(item._id) !== targetId);
      persistWishlist(state.items);
    },

    clearWishlist: (state) => {
      state.items = [];
      try {
        localStorage.removeItem('wishlist_cache');
        localStorage.removeItem('wishlist');
      } catch (e) {}
    },

    setWishlistItems: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
      persistWishlist(state.items);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWishlistFromServer.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchWishlistFromServer.fulfilled, (state, action) => {
      state.loading = false;
      if (Array.isArray(action.payload)) {
        state.items = action.payload;
        persistWishlist(state.items);
      }
    });
    builder.addCase(fetchWishlistFromServer.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  setWishlistItems,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
