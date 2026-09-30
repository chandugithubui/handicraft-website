/**
 * src/pages/admin/AdminCoupons.tsx
 *
 * Admin Coupons & Promotions Management page with server pagination,
 * creation, editing, active toggle, and discount configuration.
 * Styled with Indian Artisan Theme (Maroon #6E1717, Gold #C99A4A, Terracotta #C85A2E).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FiTag,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiRefreshCw,
  FiX,
  FiSearch,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { http } from '../../services/apiClient';
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../../services/couponService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';

const EMPTY_COUPON = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  minimumOrderAmount: '0',
  maxDiscountAmount: '',
  expiryDate: '',
  usageLimit: '',
  isActive: true,
};

export const AdminCoupons: React.FC = () => {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);

  // Modal & form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<any | null>(null);
  const [formData, setFormData] = useState(EMPTY_COUPON);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchCoupons = useCallback(async (page: number = currentPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const res = await http.get<any>(`/coupons?${params.toString()}`);
      if (res?.coupons) {
        setCoupons(res.coupons);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCoupons(res.pagination?.total || res.coupons.length);
      } else if (Array.isArray(res)) {
        setCoupons(res);
        setTotalPages(1);
        setTotalCoupons(res.length);
      } else {
        setCoupons([]);
      }
    } catch (err: any) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    fetchCoupons(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCoupons(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCoupons(page);
  };

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setFormData(EMPTY_COUPON);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue?.toString() || '',
      minimumOrderAmount: coupon.minimumOrderAmount?.toString() || '0',
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || '',
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '',
      usageLimit: coupon.usageLimit?.toString() || '',
      isActive: coupon.isActive !== false,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.discountValue) {
      setFormError('Coupon code and discount value are required.');
      return;
    }

    try {
      setFormSaving(true);
      setFormError('');

      const payload = {
        code: formData.code.trim().toUpperCase(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minimumOrderAmount: parseFloat(formData.minimumOrderAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
        expiryDate: formData.expiryDate || undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : undefined,
        isActive: formData.isActive,
      };

      if (editingCoupon) {
        await updateCoupon(editingCoupon._id, payload, token);
        showToast('Coupon updated successfully');
      } else {
        await createCoupon(payload, token);
        showToast('New coupon created successfully');
      }

      setIsModalOpen(false);
      fetchCoupons(currentPage);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!deletingCoupon) return;
    try {
      await deleteCoupon(deletingCoupon._id, token);
      showToast('Coupon deleted');
      setDeletingCoupon(null);
      fetchCoupons(currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate).getTime() < Date.now();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#6E1717] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-slide-up border border-[#C99A4A]">
          <FiCheckCircle className="w-4 h-4 text-[#C99A4A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#292522]">Coupons & Promotions</h1>
          <p className="text-xs text-gray-500 mt-1">
            Create discount vouchers, configure percentage or fixed-amount savings, and track redemptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchCoupons(currentPage)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EBD8BC] text-gray-700 text-xs font-semibold hover:bg-[#FFF8ED] transition-colors shadow-xs"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6E1717] text-white text-xs font-bold hover:bg-[#4B0F0F] transition-colors shadow-xs"
          >
            <FiPlus className="w-4 h-4 text-[#C99A4A]" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EBD8BC]/60 shadow-xs flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80 flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search coupon code..."
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

        <div className="text-xs text-gray-500 font-semibold hidden sm:block">
          Total Vouchers: <span className="text-[#6E1717] font-bold">{totalCoupons}</span>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-[#EBD8BC]/60 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center">
            <LoadingSpinner message="Loading discount coupons..." />
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-16 text-center">
            <FiTag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No active coupons</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Create your first promotional discount coupon to boost artisan store sales.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFFDF9] border-b border-gray-100 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Min Order</th>
                  <th className="py-3 px-4">Max Discount</th>
                  <th className="py-3 px-4">Expiry</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {coupons.map((c) => {
                  const expired = isExpired(c.expiryDate);
                  return (
                    <tr key={c._id} className="hover:bg-[#FFFDF9] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#6E1717] tracking-wide text-xs">
                        {c.code}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {c.discountType === 'percentage'
                          ? `${c.discountValue}% OFF`
                          : `₹${c.discountValue} OFF`}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {c.minimumOrderAmount ? `₹${c.minimumOrderAmount}` : 'No minimum'}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {c.maxDiscountAmount ? `₹${c.maxDiscountAmount}` : 'No cap'}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                        {c.expiryDate
                          ? new Date(c.expiryDate).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Never'}
                      </td>
                      <td className="py-3.5 px-4">
                        {expired ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                            Expired
                          </span>
                        ) : c.isActive ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#6E1717] hover:bg-[#FFF8ED] transition-colors"
                            title="Edit Coupon"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingCoupon(c)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Coupon"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCoupons}
          pageSize={10}
          itemName="coupons"
          onPageChange={handlePageChange}
        />
      </div>

      {/* Add / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EBD8BC]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold font-serif text-[#292522]">
                {editingCoupon ? 'Edit Coupon' : 'Create Promotional Coupon'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FESTIVE20"
                  className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#EBD8BC] rounded-xl focus:outline-hidden focus:border-[#6E1717] font-mono font-bold uppercase text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#EBD8BC] rounded-xl focus:outline-hidden focus:border-[#6E1717] text-xs"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === 'percentage' ? '20' : '200'}
                    className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#EBD8BC] rounded-xl focus:outline-hidden focus:border-[#6E1717] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Minimum Order (₹)</label>
                  <input
                    type="number"
                    value={formData.minimumOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minimumOrderAmount: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#EBD8BC] rounded-xl focus:outline-hidden focus:border-[#6E1717] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#EBD8BC] rounded-xl focus:outline-hidden focus:border-[#6E1717] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#EBD8BC] rounded-xl focus:outline-hidden focus:border-[#6E1717] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 bg-[#FFFDF9] border border-[#EBD8BC] rounded-xl focus:outline-hidden focus:border-[#6E1717] text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="coupon-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#6E1717] rounded border-gray-300 focus:ring-[#6E1717]"
                />
                <label htmlFor="coupon-active" className="font-semibold text-gray-700 cursor-pointer">
                  Coupon is Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#6E1717] hover:bg-[#4B0F0F] rounded-xl transition-colors shadow-xs"
                >
                  {formSaving ? 'Saving…' : editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <FiTrash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 font-serif">Delete Coupon</h3>
            <p className="text-xs text-gray-500 mt-2">
              Are you sure you want to delete promo code{' '}
              <span className="font-bold text-[#6E1717]">{deletingCoupon.code}</span>?
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setDeletingCoupon(null)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCoupon}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
