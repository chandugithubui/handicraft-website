/**
 * src/pages/admin/AdminOrders.tsx
 *
 * Admin Orders Management page with full server-side pagination,
 * status filtering, customer inspection modal, and order workflow transitions.
 * Styled with Indian Artisan Theme (Maroon #6E1717, Terracotta #C85A2E, Gold #C99A4A).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FiShoppingCart,
  FiSearch,
  FiFilter,
  FiEye,
  FiCheckCircle,
  FiRefreshCw,
  FiX,
  FiPackage,
  FiMapPin,
  FiPhone,
  FiMail,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { http } from '../../services/apiClient';
import { useUpdateOrderStatus } from '../../hooks/api/useAdmin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const AdminOrders: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const updateStatusMutation = useUpdateOrderStatus();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchOrders = useCallback(async (page: number = currentPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const res = await http.get<any>(`/admin/orders?${params.toString()}`);
      if (res?.orders) {
        setOrders(res.orders);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalOrders(res.pagination?.total || res.orders.length);
      } else if (Array.isArray(res)) {
        setOrders(res);
        setTotalPages(1);
        setTotalOrders(res.length);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchOrders(1);
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchOrders(page);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        orderStatus: newStatus as any,
        token: token || undefined,
      });
      showToast(`Order status updated to ${newStatus.toUpperCase()}`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update order status');
    }
  };

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#6E1717] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-slide-up border border-[#C99A4A]">
          <FiCheckCircle className="w-4 h-4 text-[#C99A4A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#292522]">Orders Management</h1>
          <p className="text-xs text-gray-500 mt-1">
            Track customer purchases, fulfill artisan orders, and update shipment progress.
          </p>
        </div>

        <button
          onClick={() => fetchOrders(currentPage)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EBD8BC] text-gray-700 text-xs font-semibold hover:bg-[#FFF8ED] transition-colors shadow-xs"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-[#EBD8BC]/60 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80 flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by customer, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FFFDF9] border border-[#EBD8BC] rounded-xl text-xs focus:outline-hidden focus:border-[#6E1717]"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-[#6E1717] text-white rounded-xl text-xs font-semibold hover:bg-[#4B0F0F] transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
            <FiFilter className="w-3.5 h-3.5" />
            Status:
          </span>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                statusFilter === opt.value
                  ? 'bg-[#6E1717] text-white border-[#6E1717] shadow-xs'
                  : 'bg-[#FFFDF9] text-gray-600 border-[#EBD8BC]/60 hover:bg-[#FFF8ED]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#EBD8BC]/60 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center">
            <LoadingSpinner message="Loading customer orders..." />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center">
            <FiShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No orders found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or clearing your status filter.'
                : 'There are currently no customer orders in the system.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFFDF9] border-b border-gray-100 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status & Workflow</th>
                  <th className="py-3 px-4">Date Placed</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {orders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-[#FFFDF9] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900">
                        {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {order.shippingAddress?.email || order.user?.email || '—'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {order.items?.length || order.orderItems?.length || 1} product(s)
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900 font-serif">
                      {formatCurrency(order.totalAmount || order.totalPrice || 0)}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={order.orderStatus || 'pending'}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updateStatusMutation.isPending}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border capitalize focus:outline-hidden cursor-pointer ${getStatusBadge(
                          order.orderStatus || 'pending'
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[#6E1717] hover:bg-[#FFF8ED] font-semibold transition-colors border border-transparent hover:border-[#EBD8BC]"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalOrders}
          pageSize={10}
          itemName="orders"
          onPageChange={handlePageChange}
        />
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#EBD8BC] p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold font-serif text-[#292522]">
                  Order Details #{selectedOrder._id.slice(-6).toUpperCase()}
                </h2>
                <p className="text-xs text-gray-400">
                  Placed on{' '}
                  {selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleString('en-IN')
                    : '—'}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Shipping details */}
            <div className="bg-[#FFFDF9] rounded-xl p-4 text-xs space-y-2 border border-[#EBD8BC]/50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FiMapPin className="text-[#6E1717] w-4 h-4" />
                Shipping Destination
              </h3>
              <p className="text-gray-800 font-semibold">
                {selectedOrder.shippingAddress?.fullName}
              </p>
              <p className="text-gray-600">
                {selectedOrder.shippingAddress?.address},{' '}
                {selectedOrder.shippingAddress?.city},{' '}
                {selectedOrder.shippingAddress?.postalCode}
              </p>
              <div className="flex gap-4 pt-1 text-gray-500">
                {selectedOrder.shippingAddress?.phone && (
                  <span className="flex items-center gap-1">
                    <FiPhone className="w-3 h-3" />
                    {selectedOrder.shippingAddress.phone}
                  </span>
                )}
                {selectedOrder.shippingAddress?.email && (
                  <span className="flex items-center gap-1">
                    <FiMail className="w-3 h-3" />
                    {selectedOrder.shippingAddress.email}
                  </span>
                )}
              </div>
            </div>

            {/* Products in this order */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
                Order Items ({selectedOrder.items?.length || selectedOrder.orderItems?.length || 0})
              </h3>
              <div className="space-y-2.5">
                {(selectedOrder.items || selectedOrder.orderItems || []).map(
                  (item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-[#FFFDF9]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                          {item.image || item.product?.imageUrl || item.product?.images?.[0] ? (
                            <img
                              src={
                                item.image || item.product?.imageUrl || item.product?.images?.[0]
                              }
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiPackage className="text-gray-400 w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            {item.name || item.product?.name || 'Handicraft Item'}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            Qty: {item.quantity || 1} × {formatCurrency(item.price || 0)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-900 font-serif">
                        {formatCurrency((item.price || 0) * (item.quantity || 1))}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Total summary */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">Total Charged:</span>
              <span className="text-lg font-bold text-[#6E1717] font-serif">
                {formatCurrency(selectedOrder.totalAmount || selectedOrder.totalPrice || 0)}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
