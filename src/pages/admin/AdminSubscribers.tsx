/**
 * src/pages/admin/AdminSubscribers.tsx
 *
 * Admin Newsletter Subscribers page with server pagination,
 * subscriber search, and unsubscribe action.
 * Styled with Indian Artisan Theme (Maroon #6E1717, Gold #C99A4A, Terracotta #C85A2E).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FiSend,
  FiSearch,
  FiRefreshCw,
  FiUserMinus,
  FiCheckCircle,
  FiMail,
} from 'react-icons/fi';
import { http } from '../../services/apiClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';

export const AdminSubscribers: React.FC = () => {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchSubscribers = useCallback(async (page: number = currentPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const res = await http.get<any>(`/newsletter/subscribers?${params.toString()}`);
      if (res?.subscribers) {
        setSubscribers(res.subscribers);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalSubscribers(res.pagination?.total || res.subscribers.length);
      } else if (Array.isArray(res)) {
        setSubscribers(res);
        setTotalPages(1);
        setTotalSubscribers(res.length);
      } else {
        setSubscribers([]);
      }
    } catch (err: any) {
      console.error('Failed to load subscribers:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    fetchSubscribers(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSubscribers(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchSubscribers(page);
  };

  const handleUnsubscribe = async (email: string) => {
    if (!window.confirm(`Unsubscribe ${email} from the newsletter?`)) return;

    try {
      const res = await http.post<{ success: boolean; message: string }>('/newsletter/unsubscribe', {
        email,
      });
      if (res?.success) {
        showToast(`Unsubscribed ${email}`);
        fetchSubscribers(currentPage);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to unsubscribe user');
    }
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
          <h1 className="text-2xl font-bold font-serif text-[#292522]">Newsletter Subscribers</h1>
          <p className="text-xs text-gray-500 mt-1">
            Audience mailing list for marketing campaigns, artisan story updates, and seasonal sales.
          </p>
        </div>

        <button
          onClick={() => fetchSubscribers(currentPage)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EBD8BC] text-gray-700 text-xs font-semibold hover:bg-[#FFF8ED] transition-colors shadow-xs"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EBD8BC]/60 shadow-xs flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80 flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search subscriber email..."
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
          Total Subscribers: <span className="text-[#6E1717] font-bold">{totalSubscribers}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EBD8BC]/60 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center">
            <LoadingSpinner message="Loading mailing list subscribers..." />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-16 text-center">
            <FiSend className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No subscribers found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              No newsletter subscribers match your search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left border-collapse">
              <thead>
                <tr className="bg-[#FFFDF9] border-b border-gray-100 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  <th className="py-3 px-4">Subscriber Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Subscribed Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {subscribers.map((s: any) => (
                  <tr key={s._id || s.email} className="hover:bg-[#FFFDF9] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#FFF8ED] text-[#C85A2E] flex items-center justify-center">
                          <FiMail className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-gray-900">{s.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                      {s.subscribedAt || s.createdAt
                        ? new Date(s.subscribedAt || s.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleUnsubscribe(s.email)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-red-600 hover:bg-red-50 font-semibold transition-colors border border-transparent hover:border-red-100"
                        title="Unsubscribe user"
                      >
                        <FiUserMinus className="w-3.5 h-3.5" />
                        <span>Unsubscribe</span>
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
          totalItems={totalSubscribers}
          pageSize={10}
          itemName="subscribers"
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default AdminSubscribers;
