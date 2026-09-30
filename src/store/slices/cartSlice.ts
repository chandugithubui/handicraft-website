/**
 * src/store/slices/cartSlice.ts
 *
 * Redux Toolkit Slice for Shopping Cart.
 * Includes instant client-cache hydration so cart counts NEVER reset to 0 on page refresh,
 * combined with automatic MongoDB synchronization for authenticated users.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { http } from '../../services/apiClient';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  imageUrl?: string;
  category?: string;
  stock?: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  syncing: boolean;
  error: string | null;
  stockAlert: string | null;
}

const loadInitialCart = (): CartItem[] => {
  try {
    const hasUser = localStorage.getItem('token') || localStorage.getItem('user');
    if (!hasUser) return [];
    const cached = localStorage.getItem('cart_cache') || localStorage.getItem('cart');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
};

const persistCart = (items: CartItem[]) => {
  try {
    localStorage.setItem('cart_cache', JSON.stringify(items));
    localStorage.setItem('cart', JSON.stringify(items));
  } catch (e) {}
};

const initialState: CartState = {
  items: loadInitialCart(),
  loading: false,
  syncing: false,
  error: null,
  stockAlert: null,
};

// Async thunk: Fetch user's cart from MongoDB
export const fetchCartFromServer = createAsyncThunk(
  'cart/fetchCartFromServer',
  async (_, { rejectWithValue }) => {
    try {
      const res = await http.get<{ success: boolean; items: CartItem[] }>('/user/cart');
      return res.items || [];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch cart from server');
    }
  }
);

// Async thunk: Save / update item in MongoDB
export const saveItemToServer = createAsyncThunk(
  'cart/saveItemToServer',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      await http.post('/user/cart', { productId, quantity });
      return { productId, quantity };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk: Sync all items to server on login
export const syncCartWithServer = createAsyncThunk(
  'cart/syncCartWithServer',
  async (items: CartItem[], { rejectWithValue }) => {
    try {
      const res = await http.put<{ success: boolean; items: CartItem[] }>('/user/cart/sync', { items });
      return res.items || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk: Remove item from server
export const removeItemFromServer = createAsyncThunk(
  'cart/removeItemFromServer',
  async (productId: string, { rejectWithValue }) => {
    try {
      await http.delete(`/user/cart/${productId}`);
      return productId;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk: Clear cart on server
export const clearServerCart = createAsyncThunk(
  'cart/clearServerCart',
  async (_, { rejectWithValue }) => {
    try {
      await http.delete('/user/cart');
      return true;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{ product: any; quantity?: number }>
    ) => {
      const { product, quantity = 1 } = action.payload;
      const stock = product.stock !== undefined ? product.stock : 999;

      if (stock <= 0) {
        state.stockAlert = `"${product.name}" is currently out of stock.`;
        return;
      }

      const existingIndex = state.items.findIndex((item) => item._id === product._id);

      if (existingIndex > -1) {
        const currentQty = state.items[existingIndex].quantity;
        const newQty = currentQty + quantity;

        if (newQty > stock) {
          state.items[existingIndex].quantity = stock;
          state.stockAlert = `Only ${stock} items available in stock for "${product.name}".`;
        } else {
          state.items[existingIndex].quantity = newQty;
          state.stockAlert = null;
        }
      } else {
        const finalQty = Math.min(quantity, stock);
        state.items.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image || product.imageUrl,
          imageUrl: product.imageUrl || product.image,
          category: product.category,
          stock: stock,
          quantity: finalQty,
        });
        if (quantity > stock) {
          state.stockAlert = `Only ${stock} items available in stock. Added maximum possible.`;
        } else {
          state.stockAlert = null;
        }
      }
      persistCart(state.items);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      state.stockAlert = null;
      persistCart(state.items);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const { productId, quantity } = action.payload;
      const itemIndex = state.items.findIndex((item) => item._id === productId);

      if (itemIndex > -1) {
        if (quantity <= 0) {
          state.items.splice(itemIndex, 1);
        } else {
          const item = state.items[itemIndex];
          const stock = item.stock !== undefined ? item.stock : 999;
          if (quantity > stock) {
            item.quantity = stock;
            state.stockAlert = `Cannot add more than ${stock} items (stock limit).`;
          } else {
            item.quantity = quantity;
            state.stockAlert = null;
          }
        }
      }
      persistCart(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      state.stockAlert = null;
      try {
        localStorage.removeItem('cart_cache');
        localStorage.removeItem('cart');
      } catch (e) {}
    },

    clearStockAlert: (state) => {
      state.stockAlert = null;
    },

    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      persistCart(state.items);
    },
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder.addCase(fetchCartFromServer.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCartFromServer.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload && action.payload.length > 0) {
        state.items = action.payload;
        persistCart(state.items);
      }
    });
    builder.addCase(fetchCartFromServer.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Sync cart
    builder.addCase(syncCartWithServer.pending, (state) => {
      state.syncing = true;
    });
    builder.addCase(syncCartWithServer.fulfilled, (state, action) => {
      state.syncing = false;
      if (action.payload && action.payload.length > 0) {
        state.items = action.payload;
        persistCart(state.items);
      }
    });
    builder.addCase(syncCartWithServer.rejected, (state) => {
      state.syncing = false;
    });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  clearStockAlert,
  setCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;
