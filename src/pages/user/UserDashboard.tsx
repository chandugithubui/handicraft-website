/**
 * src/pages/user/UserDashboard.tsx
 *
 * Dedicated Customer User Dashboard.
 * Replaces the old simplistic Profile section with a comprehensive,
 * multi-tab portal: Overview, Orders, Wishlist, Cart, and Account Settings.
 * Styled with the project's signature Indian Artisan palette (Maroon, Terracotta, Gold, Cream).
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiUser,
  FiPackage,
  FiHeart,
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiXCircle,
  FiMapPin,
  FiPhone,
  FiMail,
  FiEdit3,
  FiSave,
  FiArrowRight,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiLogOut,
  FiEye,
  FiChevronUp,
  FiShield,
  FiRefreshCw,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useMyOrders } from '../../hooks/api';
import { http } from '../../services/apiClient';

type TabKey = 'overview' | 'orders' | 'wishlist' | 'cart' | 'settings';

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, token, logout, updateUser } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { wishlistItems, removeFromWishlist, addToWishlist } = useWishlist();

  // Active Tab from query param or default to 'overview'
  const initialTab = (searchParams.get('tab') as TabKey) || 'overview';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Expanded order in Orders tab
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Profile Form state
  const [editProfile, setEditProfile] = useState({
    name: user?.name || user?.displayName || '',
    phone: (user as any)?.phone || '',
    address: (user as any)?.address || '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Dashboard statistics from server
  const [dashboardStats, setDashboardStats] = useState<{
    totalOrders: number;
    pendingOrders: number;
    deliveredOrders: number;
    totalSpent: number;
  }>({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch orders using existing TanStack Query hook
  const {
    data: orders = [],
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useMyOrders(token, isAuthenticated);

  // Sync tab with URL
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Fetch dashboard summary stats
  useEffect(() => {
    if (isAuthenticated && token) {
      setStatsLoading(true);
      http
        .get<{ success: boolean; data: any }>('/user/dashboard-summary')
        .then((res) => {
          if (res?.data?.stats) {
            setDashboardStats({
              totalOrders: res.data.stats.totalOrders || 0,
              pendingOrders: res.data.stats.pendingOrders || 0,
              deliveredOrders: res.data.stats.deliveredOrders || 0,
              totalSpent: res.data.stats.totalSpent || 0,
            });
          }
          if (res?.data?.user) {
            setEditProfile({
              name: res.data.user.name || '',
              phone: res.data.user.phone || '',
              address: res.data.user.address || '',
            });
          }
        })
        .catch((err) => {
          console.error('Failed to load dashboard summary:', err);
        })
        .finally(() => {
          setStatsLoading(false);
        });
    }
  }, [isAuthenticated, token]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');
    setIsSavingProfile(true);

    try {
      const res = await http.put<{ success: boolean; message: string; user: any }>(
        '/user/profile',
        editProfile
      );
      if (res.success) {
        setProfileSuccessMsg('Profile updated successfully!');
        if (updateUser) {
          updateUser({
            name: editProfile.name,
            phone: editProfile.phone,
            address: editProfile.address,
          } as any);
        }
        setTimeout(() => setProfileSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      setProfileErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Helper: Status badge generator
  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <FiCheckCircle className="w-3.5 h-3.5" /> Delivered
        </span>
      );
    }
    if (s === 'shipped') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
          <FiTruck className="w-3.5 h-3.5" /> Shipped
        </span>
      );
    }
    if (s === 'processing') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          <FiClock className="w-3.5 h-3.5" /> Processing
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
          <FiXCircle className="w-3.5 h-3.5" /> Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
        <FiClock className="w-3.5 h-3.5" /> Pending
      </span>
    );
  };

  // Helper: Image normalizer
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return '/images/HandcraftedWoodenBowl.webp';
    if (imagePath.startsWith('http')) return imagePath;
    let fixedPath = imagePath.replace('.jpg.jpg', '.jpg').replace('.jpeg.jpeg', '.jpeg');
    if (fixedPath.startsWith('/images/')) return fixedPath;
    if (fixedPath.startsWith('/')) return fixedPath;
    return `/images/${fixedPath}`;
  };

  // Guard: If not logged in, prompt sign in
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] bg-[#FFF8ED] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#e8d5c0] rounded-3xl p-8 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#6E1717]/10 text-[#6E1717] flex items-center justify-center mx-auto border border-[#6E1717]/20">
            <FiUser className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#6E1717]">Sign In to Your Dashboard</h2>
            <p className="text-sm text-gray-500">
              Access your personal artisan orders, saved wishlist items, active cart, and profile settings.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              to="/login?redirect=/user/dashboard"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#6E1717] to-[#C85A2E] hover:from-[#4B0F0F] hover:to-[#6E1717] text-white font-semibold text-sm shadow-md shadow-[#6E1717]/20 transition text-center"
            >
              Sign In to Your Account
            </Link>
            <Link
              to="/register"
              className="w-full py-2.5 px-4 rounded-xl border border-[#e8d5c0] bg-[#FFF8ED] hover:bg-white text-[#6E1717] font-medium text-sm transition text-center"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shippingFee = subtotal >= 999 ? 0 : subtotal > 0 ? 99 : 0;
  const grandTotal = subtotal + shippingFee;

  return (
    <div className="min-h-screen bg-[#FFF8ED] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Top Header Banner ──────────────────────────────────────────────── */}
        <div className="bg-white border border-[#e8d5c0] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          {/* Decorative accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6E1717] via-[#C85A2E] to-[#C99A4A]" />

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6E1717] to-[#C85A2E] text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-[#6E1717]/20 shrink-0">
              {user?.picture ? (
                <img src={user.picture} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                (user?.name || user?.displayName || user?.email || 'U').charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#6E1717]">
                  Welcome back, {user?.name || user?.displayName || 'Artisan Lover'}!
                </h1>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#C99A4A]/20 text-[#6E1717] border border-[#C99A4A]/40">
                  Customer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {user?.role === 'admin' || user?.role === 'super_admin' ? (
              <Link
                to="/admin"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6E1717]/10 text-[#6E1717] border border-[#6E1717]/20 hover:bg-[#6E1717]/20 font-semibold text-xs transition"
              >
                <FiShield className="w-4 h-4" /> Admin Portal
              </Link>
            ) : null}
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs transition"
            >
              <FiLogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* ── Navigation Tabs ────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 border-b border-[#e8d5c0] pb-3">
          {[
            { id: 'overview', icon: FiUser, label: 'Overview' },
            { id: 'orders', icon: FiPackage, label: 'My Orders', badge: orders.length },
            { id: 'wishlist', icon: FiHeart, label: 'Wishlist', badge: wishlistItems.length },
            { id: 'cart', icon: FiShoppingBag, label: 'My Cart', badge: cartItems.length },
            { id: 'settings', icon: FiEdit3, label: 'Account Settings' },
          ].map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id as TabKey)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition border ${
                activeTab === id
                  ? 'bg-[#6E1717] text-white border-[#6E1717] shadow-md shadow-[#6E1717]/20'
                  : 'bg-white text-gray-600 hover:text-[#6E1717] hover:bg-[#FFF8ED] border-[#e8d5c0]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {badge !== undefined && badge > 0 && (
                <span
                  className={`text-xs px-2 py-0.2 rounded-full font-bold ${
                    activeTab === id ? 'bg-white text-[#6E1717]' : 'bg-[#C99A4A]/20 text-[#6E1717]'
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB 1: OVERVIEW ────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#e8d5c0] rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#6E1717]/10 text-[#6E1717] flex items-center justify-center shrink-0">
                  <FiPackage className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Total Orders</p>
                  <h3 className="text-2xl font-bold text-[#6E1717]">{orders.length}</h3>
                </div>
              </div>

              <div className="bg-white border border-[#e8d5c0] rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <FiClock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Active / Pending</p>
                  <h3 className="text-2xl font-bold text-amber-700">
                    {orders.filter((o: any) => o.orderStatus === 'pending' || o.orderStatus === 'processing').length}
                  </h3>
                </div>
              </div>

              <div className="bg-white border border-[#e8d5c0] rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                  <FiHeart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Saved in Wishlist</p>
                  <h3 className="text-2xl font-bold text-pink-700">{wishlistItems.length}</h3>
                </div>
              </div>

              <div className="bg-white border border-[#e8d5c0] rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#C85A2E]/10 text-[#C85A2E] flex items-center justify-center shrink-0">
                  <FiShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Items in Cart</p>
                  <h3 className="text-2xl font-bold text-[#C85A2E]">{cartItems.length}</h3>
                </div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white border border-[#e8d5c0] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e8d5c0]">
                <div>
                  <h3 className="text-lg font-bold text-[#6E1717]">Recent Orders</h3>
                  <p className="text-xs text-gray-500">Track and manage your latest purchases</p>
                </div>
                <button
                  onClick={() => handleTabChange('orders')}
                  className="text-xs font-semibold text-[#C85A2E] hover:text-[#6E1717] flex items-center gap-1 transition"
                >
                  View All Orders <FiArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {ordersLoading ? (
                <div className="py-12 text-center text-gray-400">
                  <FiRefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#C85A2E]" />
                  <p className="text-xs">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <FiPackage className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-sm text-gray-500">You haven't placed any orders yet.</p>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6E1717] text-white text-xs font-semibold shadow hover:bg-[#4B0F0F] transition"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#e8d5c0]">
                  {orders.slice(0, 3).map((order: any) => (
                    <div key={order._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#FFF8ED] border border-[#e8d5c0] overflow-hidden shrink-0">
                          <img
                            src={getImageUrl(order.items?.[0]?.image)}
                            alt="Order item"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-800">
                              Order #{order._id.slice(-8)}
                            </span>
                            {getStatusBadge(order.orderStatus)}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}{' '}
                            • {order.items?.length || 0} items
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <span className="font-bold text-sm text-[#6E1717]">
                          ₹{(order.totalAmount || 0).toLocaleString()}
                        </span>
                        <button
                          onClick={() => {
                            setExpandedOrderId(order._id);
                            handleTabChange('orders');
                          }}
                          className="px-3 py-1.5 rounded-lg border border-[#e8d5c0] hover:border-[#6E1717] text-xs font-semibold text-[#6E1717] hover:bg-[#FFF8ED] transition"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: MY ORDERS ───────────────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#e8d5c0] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e8d5c0]">
                <div>
                  <h3 className="text-lg font-bold text-[#6E1717]">My Orders History</h3>
                  <p className="text-xs text-gray-500">All your verified orders with delivery updates</p>
                </div>
                <button
                  onClick={() => refetchOrders()}
                  className="p-2 rounded-xl border border-[#e8d5c0] hover:bg-[#FFF8ED] text-[#6E1717] transition text-xs flex items-center gap-1 font-semibold"
                >
                  <FiRefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>

              {ordersLoading ? (
                <div className="py-16 text-center text-gray-400">
                  <FiRefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-[#C85A2E]" />
                  <p className="text-sm">Fetching your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <FiPackage className="w-12 h-12 text-gray-300 mx-auto" />
                  <h4 className="text-base font-bold text-gray-700">No orders placed yet</h4>
                  <p className="text-xs text-gray-400">Explore traditional Indian handicrafts and place your first order!</p>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6E1717] text-white text-xs font-bold hover:bg-[#4B0F0F] transition shadow-md"
                  >
                    Browse Collections
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: any) => {
                    const isExpanded = expandedOrderId === order._id;
                    return (
                      <div
                        key={order._id}
                        className="border border-[#e8d5c0] rounded-2xl overflow-hidden bg-white hover:border-[#C85A2E]/50 transition shadow-sm"
                      >
                        {/* Order Summary Bar */}
                        <div className="p-4 sm:p-5 bg-[#FFF8ED]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e8d5c0]">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-900">
                                Order #{order._id.slice(-8)}
                              </span>
                              {getStatusBadge(order.orderStatus)}
                            </div>
                            <p className="text-xs text-gray-500">
                              Placed on{' '}
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <div className="text-right">
                              <span className="text-xs text-gray-400 block">Total</span>
                              <span className="font-extrabold text-base text-[#6E1717]">
                                ₹{(order.totalAmount || 0).toLocaleString()}
                              </span>
                            </div>
                            <button
                              onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e8d5c0] bg-white hover:bg-[#FFF8ED] text-xs font-semibold text-[#6E1717] transition"
                            >
                              {isExpanded ? (
                                <>
                                  <FiChevronUp className="w-3.5 h-3.5" /> Less
                                </>
                              ) : (
                                <>
                                  <FiEye className="w-3.5 h-3.5" /> Details
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="p-4 sm:p-5 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {order.items?.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-2.5 rounded-xl border border-[#e8d5c0] bg-[#FFF8ED]/30"
                              >
                                <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-[#e8d5c0]">
                                  <img
                                    src={getImageUrl(item.image)}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-bold text-gray-800 truncate">{item.name}</h4>
                                  <div className="flex items-center justify-between text-xs text-gray-500 mt-0.5">
                                    <span>Qty: {item.quantity || 1}</span>
                                    <span className="font-semibold text-[#6E1717]">
                                      ₹{(item.price || 0).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="pt-4 mt-4 border-t border-[#e8d5c0] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-1.5 p-3 rounded-xl bg-gray-50 border border-gray-200">
                                <h5 className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                                  Delivery Address
                                </h5>
                                <p className="font-semibold text-gray-800">
                                  {order.shippingAddress?.fullName}
                                </p>
                                <p className="text-gray-500">{order.shippingAddress?.address}</p>
                                <p className="text-gray-500">
                                  {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                                  {order.shippingAddress?.postalCode}
                                </p>
                                <p className="text-gray-500">Phone: {order.shippingAddress?.phone}</p>
                              </div>

                              <div className="space-y-1.5 p-3 rounded-xl bg-gray-50 border border-gray-200">
                                <h5 className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                                  Payment Information
                                </h5>
                                <div className="flex items-center justify-between text-gray-600">
                                  <span>Method:</span>
                                  <span className="font-semibold uppercase">{order.paymentMethod || 'COD'}</span>
                                </div>
                                <div className="flex items-center justify-between text-gray-600">
                                  <span>Payment Status:</span>
                                  <span className="font-semibold uppercase text-emerald-700">
                                    {order.paymentStatus || 'Pending'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-gray-600">
                                  <span>Subtotal:</span>
                                  <span>₹{(order.subtotal || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-gray-600">
                                  <span>Shipping:</span>
                                  <span>₹{(order.shippingAmount || 0).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: WISHLIST ────────────────────────────────────────────────── */}
        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#e8d5c0] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e8d5c0]">
                <div>
                  <h3 className="text-lg font-bold text-[#6E1717]">My Saved Wishlist</h3>
                  <p className="text-xs text-gray-500">
                    Handicrafts saved directly in your personal database
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#6E1717] px-3 py-1 rounded-full bg-[#C99A4A]/20">
                  {wishlistItems.length} items
                </span>
              </div>

              {wishlistItems.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <FiHeart className="w-12 h-12 text-gray-300 mx-auto" />
                  <h4 className="text-base font-bold text-gray-700">Your wishlist is empty</h4>
                  <p className="text-xs text-gray-400">Save handcrafted items you love for easy ordering later.</p>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6E1717] text-white text-xs font-bold hover:bg-[#4B0F0F] transition shadow-md"
                  >
                    Explore Handicrafts
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {wishlistItems.map((product) => {
                    const imgSrc = product.image || product.imageUrl || '/images/HandcraftedWoodenBowl.webp';
                    return (
                      <div
                        key={product._id}
                        className="border border-[#e8d5c0] rounded-2xl overflow-hidden bg-white hover:border-[#C85A2E]/50 transition shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-44 bg-[#FFF8ED] overflow-hidden relative">
                            <img src={getImageUrl(imgSrc)} alt={product.name} className="w-full h-full object-cover" />
                            <button
                              onClick={() => removeFromWishlist(product._id)}
                              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 text-red-500 hover:bg-white flex items-center justify-center shadow transition"
                              title="Remove from wishlist"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="p-4 space-y-1">
                            <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{product.name}</h4>
                            <p className="text-xs text-gray-400">{product.category || 'Handicraft'}</p>
                            <div className="flex items-center gap-2 pt-1">
                              <span className="font-extrabold text-base text-[#6E1717]">
                                ₹{(product.price || 0).toLocaleString()}
                              </span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{product.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-4 pt-0">
                          <button
                            onClick={() => {
                              addToWishlist(product); // removes from wishlist
                              updateQuantity(product._id, 1);
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-[#6E1717] hover:bg-[#4B0F0F] text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow"
                          >
                            <FiShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: MY CART ─────────────────────────────────────────────────── */}
        {activeTab === 'cart' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#e8d5c0] rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#e8d5c0]">
                <div>
                  <h3 className="text-lg font-bold text-[#6E1717]">My Shopping Cart</h3>
                  <p className="text-xs text-gray-500">
                    Real-time database-synced cart with stock control
                  </p>
                </div>
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold underline"
                  >
                    Clear Cart
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <FiShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
                  <h4 className="text-base font-bold text-gray-700">Your cart is currently empty</h4>
                  <p className="text-xs text-gray-400">Discover handpicked creations crafted by master artisans.</p>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6E1717] text-white text-xs font-bold hover:bg-[#4B0F0F] transition shadow-md"
                  >
                    Explore Products
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Cart Items List */}
                  <div className="lg:col-span-2 space-y-3 divide-y divide-[#e8d5c0]">
                    {cartItems.map((item) => (
                      <div key={item._id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-xl bg-[#FFF8ED] border border-[#e8d5c0] overflow-hidden shrink-0">
                            <img
                              src={getImageUrl(item.imageUrl || item.image)}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{item.name}</h4>
                            <p className="text-xs text-[#6E1717] font-semibold mt-0.5">
                              ₹{item.price.toLocaleString()}
                            </p>
                            {item.stock !== undefined && (
                              <p className="text-[10px] text-gray-400">Stock available: {item.stock}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Quantity selector with stock control */}
                          <div className="flex items-center border border-[#e8d5c0] rounded-xl bg-[#FFF8ED] overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="px-2.5 py-1 text-gray-600 hover:text-[#6E1717] transition"
                              title="Decrease quantity"
                            >
                              <FiMinus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              disabled={item.stock !== undefined && item.quantity >= item.stock}
                              className="px-2.5 py-1 text-gray-600 hover:text-[#6E1717] disabled:opacity-30 transition"
                              title="Increase quantity"
                            >
                              <FiPlus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-bold text-sm text-[#6E1717] min-w-[4rem] text-right">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>

                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-gray-400 hover:text-red-600 transition p-1"
                            title="Remove"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Card */}
                  <div className="bg-[#FFF8ED] border border-[#e8d5c0] rounded-2xl p-5 space-y-4 h-fit">
                    <h4 className="font-bold text-sm text-[#6E1717] uppercase tracking-wider">Order Summary</h4>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Subtotal ({cartItems.length} items):</span>
                        <span className="font-semibold text-gray-800">₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span className="font-semibold text-gray-800">
                          {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-[#e8d5c0] flex justify-between text-sm font-bold text-[#6E1717]">
                        <span>Grand Total:</span>
                        <span>₹{grandTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <Link
                      to="/checkout"
                      className="w-full py-3 px-4 rounded-xl bg-[#6E1717] hover:bg-[#4B0F0F] text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow"
                    >
                      Proceed to Checkout <FiArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 5: ACCOUNT SETTINGS ────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-[#e8d5c0] rounded-3xl p-6 shadow-sm space-y-6 max-w-2xl">
            <div className="pb-3 border-b border-[#e8d5c0]">
              <h3 className="text-lg font-bold text-[#6E1717]">Account Settings</h3>
              <p className="text-xs text-gray-500">Update your delivery address, phone, and profile information</p>
            </div>

            {profileSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
                <FiCheck className="w-4 h-4 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {profileErrorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    required
                    value={editProfile.name}
                    onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-[#e8d5c0] bg-[#FFF8ED]/40 focus:outline-none focus:border-[#6E1717] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Email address cannot be changed.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    placeholder="e.g. +91 9876543210"
                    value={editProfile.phone}
                    onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-[#e8d5c0] bg-[#FFF8ED]/40 focus:outline-none focus:border-[#6E1717] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Default Delivery Address
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    rows={3}
                    placeholder="House/Flat number, Street, Landmark, City, State, PIN code"
                    value={editProfile.address}
                    onChange={(e) => setEditProfile({ ...editProfile, address: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-[#e8d5c0] bg-[#FFF8ED]/40 focus:outline-none focus:border-[#6E1717] transition resize-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6E1717] to-[#C85A2E] hover:from-[#4B0F0F] hover:to-[#6E1717] text-white font-semibold text-xs shadow-md shadow-[#6E1717]/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserDashboard;
