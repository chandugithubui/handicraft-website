/**
 * src/pages/admin/AdminOverview.tsx
 *
 * Admin Dashboard Overview styled with Handicraft Hub's Indian Artisan theme
 * (Maroon #6E1717, Burgundy #4B0F0F, Terracotta #C85A2E, Gold #C99A4A).
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiBox,
  FiArrowRight,
  FiPlus,
  FiShield,
  FiTag,
  FiRefreshCw,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useAdminStats, useAdminOrders } from '../../hooks/api/useAdmin';
import RoleBadge from '../../components/rbac/RoleBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const AdminOverview: React.FC = () => {
  const { user, token } = useAuth();

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
    isRefetching: statsRefetching,
  } = useAdminStats(token);

  const {
    data: orders = [],
    isLoading: ordersLoading,
  } = useAdminOrders(token);

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Extract recent orders (handles both raw array and paginated response)
  const ordersList = Array.isArray(orders) ? orders : (orders as any)?.orders || [];
  const recentOrders = ordersList.slice(0, 5);

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || 'pending';
    switch (s) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-orange-50 text-orange-700 border-orange-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Welcome Banner (Rich Deep Maroon & Gold) ─────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white shadow-md border border-[#4B0F0F]"
        style={{
          background: 'linear-gradient(135deg, #6E1717 0%, #4B0F0F 55%, #8A2A2A 100%)',
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[#E8C88A] text-xs font-bold tracking-wide backdrop-blur-xs border border-white/10">
              <FiShield className="w-3.5 h-3.5 text-[#C99A4A]" />
              <span>Admin Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white drop-shadow-sm">
              Welcome back, {user?.name || 'Super Admin'}!
            </h1>
            <p className="text-white/85 text-xs sm:text-sm max-w-xl leading-relaxed">
              Monitor store sales, fulfill orders, manage artisanal catalog items, configure promotional coupons, and manage team roles.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => refetchStats()}
              disabled={statsRefetching}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer border border-white/20 shadow-xs"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${statsRefetching ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C99A4A] text-[#292522] text-xs font-bold hover:bg-[#E8C88A] transition-colors shadow-sm no-underline"
            >
              <FiPlus className="w-4 h-4 text-[#292522]" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -bottom-16 w-60 h-60 bg-[#C99A4A]/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── KPI Stat Cards ────────────────────────────────────────── */}
      {statsLoading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner message="Loading dashboard statistics..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Revenue */}
          <div className="bg-white rounded-2xl p-5 border border-[#EBD8BC]/60 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Total Revenue
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <FiDollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight font-serif">
                {formatCurrency(stats?.totalRevenue ?? stats?.totalSales ?? 0)}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <FiTrendingUp className="w-3.5 h-3.5" />
                <span>All-time completed sales</span>
              </p>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-2xl p-5 border border-[#EBD8BC]/60 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Total Orders
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FiShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight font-serif">
                {stats?.totalOrders ?? 0}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium mt-1 flex items-center gap-1">
                <FiClock className="w-3.5 h-3.5" />
                <span>Purchases placed</span>
              </p>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-2xl p-5 border border-[#EBD8BC]/60 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Live Products
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FFF8ED] text-[#C85A2E] flex items-center justify-center">
                <FiBox className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight font-serif">
                {stats?.totalProducts ?? 0}
              </h3>
              <p className="text-[11px] text-[#C85A2E] font-medium mt-1 flex items-center gap-1">
                <FiCheckCircle className="w-3.5 h-3.5" />
                <span>Artisan catalog items</span>
              </p>
            </div>
          </div>

          {/* Users */}
          <div className="bg-white rounded-2xl p-5 border border-[#EBD8BC]/60 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Registered Users
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FiUsers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight font-serif">
                {stats?.totalUsers ?? 0}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium mt-1">
                Active customer accounts
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Action Shortcuts ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/admin/products"
          className="bg-white p-3.5 rounded-xl border border-[#EBD8BC]/60 shadow-xs hover:shadow-sm hover:border-[#6E1717]/40 transition-all flex items-center gap-3 group no-underline"
        >
          <div className="w-9 h-9 rounded-lg bg-[#FFF8ED] text-[#C85A2E] flex items-center justify-center group-hover:bg-[#6E1717] group-hover:text-white transition-colors">
            <FiBox className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">Manage Catalog</p>
            <p className="text-[10px] text-gray-400">Add / Edit Products</p>
          </div>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-white p-3.5 rounded-xl border border-[#EBD8BC]/60 shadow-xs hover:shadow-sm hover:border-[#6E1717]/40 transition-all flex items-center gap-3 group no-underline"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <FiShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">Process Orders</p>
            <p className="text-[10px] text-gray-400">Track shipments</p>
          </div>
        </Link>

        <Link
          to="/admin/coupons"
          className="bg-white p-3.5 rounded-xl border border-[#EBD8BC]/60 shadow-xs hover:shadow-sm hover:border-[#6E1717]/40 transition-all flex items-center gap-3 group no-underline"
        >
          <div className="w-9 h-9 rounded-lg bg-[#FFF8ED] text-[#C99A4A] flex items-center justify-center group-hover:bg-[#C99A4A] group-hover:text-white transition-colors">
            <FiTag className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">Coupons & Promo</p>
            <p className="text-[10px] text-gray-400">Configure discounts</p>
          </div>
        </Link>

        <Link
          to="/admin/roles"
          className="bg-white p-3.5 rounded-xl border border-[#EBD8BC]/60 shadow-xs hover:shadow-sm hover:border-[#6E1717]/40 transition-all flex items-center gap-3 group no-underline"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <FiShield className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">Roles & Access</p>
            <p className="text-[10px] text-gray-400">Manage permissions</p>
          </div>
        </Link>
      </div>

      {/* ── Recent Orders Table & Admin Identity ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EBD8BC]/60 shadow-xs overflow-hidden">
          <div className="p-4 px-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900 font-serif">Recent Orders</h2>
              <p className="text-[11px] text-gray-400">Latest transactions placed by customers</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-[#6E1717] hover:text-[#C85A2E] inline-flex items-center gap-1 no-underline"
            >
              <span>View All</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {ordersLoading ? (
            <div className="p-8 flex justify-center">
              <LoadingSpinner message="Loading recent orders..." />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-xs">
              No orders have been placed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FFFDF9] border-b border-gray-100 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    <th className="py-2.5 px-4">Order ID</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {recentOrders.map((order: any) => (
                    <tr key={order._id} className="hover:bg-[#FFFDF9] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {formatCurrency(order.totalAmount || order.totalPrice || 0)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getStatusBadge(
                            order.orderStatus || 'pending'
                          )}`}
                        >
                          {order.orderStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-[11px]">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Admin Identity & Security Card (1 col) */}
        <div className="bg-white rounded-2xl border border-[#EBD8BC]/60 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-11 h-11 rounded-xl bg-[#6E1717] text-[#C99A4A] flex items-center justify-center font-bold text-base shadow-xs">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">{user?.name || user?.email}</h3>
                <p className="text-[11px] text-gray-400">{user?.email}</p>
                <div className="mt-1">
                  <RoleBadge role={user?.role || 'user'} size="sm" />
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Security & RBAC Privileges
              </h4>
              <div className="p-3 rounded-xl bg-[#FFFDF9] border border-[#EBD8BC]/50 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Active Role</span>
                  <span className="font-bold text-gray-800 capitalize">
                    {user?.role?.replace('_', ' ') || 'Admin'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Access Level</span>
                  <span className="font-bold text-[#6E1717]">
                    {user?.role === 'super_admin' ? 'Full Authority (*)' : `${user?.permissions?.length || 0} permissions`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Auth Method</span>
                  <span className="font-medium text-gray-700 text-[11px]">
                    {user?.provider === 'google' ? 'Google OAuth 2.0' : 'Email & Password'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100">
            <Link
              to="/admin/roles"
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#FFF8ED] text-[#6E1717] hover:bg-[#F4E5D0] font-bold text-xs transition-colors no-underline border border-[#EBD8BC]/50"
            >
              <FiShield className="w-3.5 h-3.5 text-[#C99A4A]" />
              <span>Manage Roles & Permissions</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
