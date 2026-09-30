/**
 * src/types/index.ts
 *
 * Shared TypeScript types for the Handicraft Hub frontend.
 */

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface User {
  _id?: string;
  id?: string;
  name?: string;
  displayName?: string;
  email: string;
  picture?: string;
  avatar?: string | null;
  role: string;
  permissions?: string[];
  /** Auth provider: local email/password or Google OAuth */
  provider?: 'local' | 'google';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token?: string, user?: User) => void;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
}

// ── Product ───────────────────────────────────────────────────────────────────

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  image?: string;
  imageUrl?: string;
  material?: string;
  sku?: string;
  category: string;
  subCategory?: string;
  stock: number;
  rating?: number;
  reviewCount?: number;
  numReviews?: number;
  artisan?: Artisan;
  artisanName?: string;
  dimensions?: string;
  tags?: string[];
  isFeatured?: boolean;
  featured?: boolean;
  createdAt?: string;
}

// ── Artisan ───────────────────────────────────────────────────────────────────

export interface Artisan {
  _id: string;
  name: string;
  bio?: string;
  location?: string;
  image?: string;
  specialization?: string;
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartContextValue {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartItemCount: () => number;
  getCartTotal: () => number;
}

// ── Wishlist ──────────────────────────────────────────────────────────────────

export interface WishlistContextValue {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
}

// ── Order ─────────────────────────────────────────────────────────────────────

export interface OrderItem {
  product?: Product | string;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  _id: string;
  user: string | User;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    updateTime: string;
  };
  itemsPrice?: number;
  shippingPrice?: number;
  taxPrice?: number;
  totalPrice?: number;
  totalAmount?: number;
  isPaid?: boolean;
  isDelivered?: boolean;
  paidAt?: string;
  deliveredAt?: string;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string;
  orderStatus?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string;
  createdAt: string;
}

// ── Review ────────────────────────────────────────────────────────────────────

export interface Review {
  _id: string;
  user: string | User;
  product: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
}

// ── API Response ──────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pages: number;
}

// ── Forms ─────────────────────────────────────────────────────────────────────

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}
