/**
 * src/types/api.ts
 * Type-safe Request and Response definitions for all API endpoints.
 */

import { Product, Artisan, Order, Review, User } from './index';

// ── Generic API Responses ───────────────────────────────────────────────────

export interface StandardApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalProducts?: number;
  totalItems?: number;
  limit: number;
}

// ── Products API Types ──────────────────────────────────────────────────────

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  category?: string;
  material?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
}

export interface PaginatedProductsResponse {
  products: Product[];
  pagination: PaginationMeta;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images?: string[];
  imageUrl?: string;
  artisan?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  _id?: string;
}

// ── Categories API Types ────────────────────────────────────────────────────

export interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
  itemCount?: number;
  createdAt?: string;
}

export interface CreateCategoryInput {
  name: string;
  description: string;
}

export interface CraftProcessStep {
  step: number | string;
  image?: string;
  title: string;
  description: string;
}

export interface ArtisanProfileData extends Artisan {
  slug?: string;
  craft?: string;
  experience?: string | number;
  years?: number | string;
  specialty?: string;
  craftProcess?: CraftProcessStep[];
  rating?: number;
  story?: string;
  bannerImage?: string;
  stats?: {
    productsCount?: number;
    rating?: number;
    reviewsCount?: number;
  };
}

export interface ArtisanWithProductsResponse {
  artisan: ArtisanProfileData;
  products: Product[];
}

// ── Orders API Types ────────────────────────────────────────────────────────

export interface CreateOrderItemInput {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface CreateOrderInput {
  orderItems: CreateOrderItemInput[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  couponCode?: string;
  discountAmount?: number;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

// ── Contact API Types ───────────────────────────────────────────────────────

export interface ContactInput {
  name: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

// ── Newsletter API Types ────────────────────────────────────────────────────

export interface NewsletterSubscribeInput {
  email: string;
}

export interface NewsletterResponse {
  success: boolean;
  message: string;
}

export interface NewsletterSubscriber {
  _id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  subscribedAt: string;
}

export interface NewsletterSubscribersResponse {
  success: boolean;
  subscribers: NewsletterSubscriber[];
}

// ── Reviews API Types ───────────────────────────────────────────────────────

export interface CreateReviewInput {
  product: string;
  rating: number;
  title?: string;
  comment: string;
}

export interface ProductReviewsSummaryResponse {
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
}

// ── Coupons API Types ───────────────────────────────────────────────────────

export interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  maxDiscount?: number;
  minPurchase?: number;
  validUntil: string;
  isActive: boolean;
}

export interface ValidateCouponInput {
  code: string;
  cartTotal: number;
}

export interface ValidateCouponResponse {
  isValid: boolean;
  message?: string;
  discountAmount?: number;
  coupon?: Coupon;
}

// ── Testimonials API Types ──────────────────────────────────────────────────

export interface Testimonial {
  _id: string;
  name: string;
  role?: string;
  avatar?: string;
  comment?: string;
  text?: string;
  location?: string;
  rating: number;
}

// ── Admin API Types ─────────────────────────────────────────────────────────

export interface AdminStatsResponse {
  totalOrders: number;
  totalSales: number;
  totalRevenue?: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders?: Order[];
}

// ── RBAC API Types ─────────────────────────────────────────────────────────

export interface PermissionItem {
  key: string;
  name: string;
  description: string;
}

export interface PermissionModule {
  id: string;
  name: string;
  description: string;
  permissions: PermissionItem[];
}

export interface PermissionsManifest {
  modules: PermissionModule[];
}

export interface RoleResponse {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRoleResponse {
  userId: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
}

export interface CreateRoleInput {
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleInput {
  displayName?: string;
  description?: string;
  permissions?: string[];
}

export interface AssignUserRoleInput {
  userId: string;
  roleName: string;
}
