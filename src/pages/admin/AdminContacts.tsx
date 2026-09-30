/**
 * src/pages/admin/AdminContacts.tsx
 *
 * Admin Customer Inquiries / Contact Messages page with server pagination,
 * full-text search, and inquiry inspection modal.
 * Styled with Indian Artisan Theme (Maroon #6E1717, Gold #C99A4A, Terracotta #C85A2E).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FiMail,
  FiSearch,
  FiEye,
  FiRefreshCw,
  FiX,
  FiMessageSquare,
} from 'react-icons/fi';
import { http } from '../../services/apiClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';

export const AdminContacts: React.FC = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  const fetchContacts = useCallback(async (page: number = currentPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const res = await http.get<any>(`/admin/contacts?${params.toString()}`);
      if (res?.contacts) {
        setContacts(res.contacts);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalContacts(res.pagination?.total || res.contacts.length);
      } else if (Array.isArray(res)) {
        setContacts(res);
        setTotalPages(1);
        setTotalContacts(res.length);
      } else {
        setContacts([]);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    fetchContacts(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchContacts(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchContacts(page);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#292522]">Customer Inquiries</h1>
          <p className="text-xs text-gray-500 mt-1">
            Questions, artisan collaborations, and feedback received from the storefront contact form.
          </p>
        </div>

        <button
          onClick={() => fetchContacts(currentPage)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EBD8BC] text-gray-700 text-xs font-semibold hover:bg-[#FFF8ED] transition-colors shadow-xs"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Messages</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EBD8BC]/60 shadow-xs flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80 flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, subject..."
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
          Total Inquiries: <span className="text-[#6E1717] font-bold">{totalContacts}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EBD8BC]/60 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center">
            <LoadingSpinner message="Loading customer messages..." />
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-16 text-center">
            <FiMail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No inquiries found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              There are currently no customer inquiries matching your query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFFDF9] border-b border-gray-100 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Message Snippet</th>
                  <th className="py-3 px-4">Date Received</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {contacts.map((c: any) => (
                  <tr key={c._id} className="hover:bg-[#FFFDF9] transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{c.name || 'Anonymous'}</p>
                      <p className="text-[11px] text-gray-400">{c.email}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      {c.subject || 'General Inquiry'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate">
                      {c.message}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap text-[11px]">
                      {c.createdAt || c.date
                        ? new Date(c.createdAt || c.date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedMessage(c)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[#6E1717] hover:bg-[#FFF8ED] font-semibold transition-colors border border-transparent hover:border-[#EBD8BC]"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                        <span>Read</span>
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
          totalItems={totalContacts}
          pageSize={10}
          itemName="inquiries"
          onPageChange={handlePageChange}
        />
      </div>

      {/* Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EBD8BC] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold font-serif text-[#292522] flex items-center gap-2">
                <FiMessageSquare className="text-[#6E1717] w-5 h-5" />
                Customer Inquiry
              </h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FFFDF9] rounded-xl p-3.5 text-xs space-y-1.5 border border-[#EBD8BC]/50">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-500">From:</span> {selectedMessage.name} (
                <a href={`mailto:${selectedMessage.email}`} className="text-[#6E1717] font-semibold hover:underline">
                  {selectedMessage.email}
                </a>
                )
              </p>
              {selectedMessage.phone && (
                <p className="text-gray-800">
                  <span className="font-semibold text-gray-500">Phone:</span> {selectedMessage.phone}
                </p>
              )}
              <p className="text-gray-800">
                <span className="font-semibold text-gray-500">Subject:</span>{' '}
                <span className="font-bold text-gray-900">{selectedMessage.subject || 'General'}</span>
              </p>
              <p className="text-gray-500 text-[11px]">
                <span className="font-semibold">Received:</span>{' '}
                {selectedMessage.createdAt || selectedMessage.date
                  ? new Date(selectedMessage.createdAt || selectedMessage.date).toLocaleString('en-IN')
                  : '—'}
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Message Content</h4>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'Handicraft Hub Support')}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6E1717] text-white text-xs font-semibold hover:bg-[#4B0F0F] transition-colors no-underline shadow-xs"
              >
                <FiMail className="w-3.5 h-3.5 text-[#C99A4A]" />
                <span>Reply via Email</span>
              </a>
              <button
                onClick={() => setSelectedMessage(null)}
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

export default AdminContacts;
