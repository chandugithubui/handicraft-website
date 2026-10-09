/**
 * src/pages/admin/AdminUsers.tsx
 *
 * Admin Users Directory page with server pagination,
 * role filtering, search, and direct link to assign roles.
 * Styled with Indian Artisan Theme (Maroon #6E1717, Gold #C99A4A, Terracotta #C85A2E).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiSearch,
  FiShield,
  FiRefreshCw,
  FiUser,
  FiFilter,
} from 'react-icons/fi';
import { http } from '../../services/apiClient';
import RoleBadge from '../../components/rbac/RoleBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = useCallback(async (page: number = currentPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (roleFilter !== 'ALL') {
        params.append('role', roleFilter);
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const res = await http.get<any>(`/admin/users?${params.toString()}`);
      if (res?.users) {
        setUsers(res.users);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalUsers(res.pagination?.total || res.users.length);
      } else if (Array.isArray(res)) {
        setUsers(res);
        setTotalPages(1);
        setTotalUsers(res.length);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, searchTerm, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchUsers(1);
  }, [roleFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#292522]">User Management</h1>
          <p className="text-xs text-gray-500 mt-1">
            Directory of registered shoppers, artisan accounts, and administrative personnel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchUsers(currentPage)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EBD8BC] text-gray-700 text-xs font-semibold hover:bg-[#FFF8ED] transition-colors shadow-xs"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admin/roles"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6E1717] text-white text-xs font-bold hover:bg-[#4B0F0F] transition-colors shadow-xs no-underline"
          >
            <FiShield className="w-4 h-4 text-[#C99A4A]" />
            <span>Assign Roles & Permissions</span>
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EBD8BC]/60 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80 flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or email..."
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

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
            <FiFilter className="w-3.5 h-3.5" />
            Role:
          </span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#EBD8BC] bg-[#FFFDF9] text-xs font-medium text-gray-700 focus:outline-hidden focus:border-[#6E1717]"
          >
            <option value="ALL">All Roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
            <option value="moderator">Moderator</option>
            <option value="artisan">Artisan</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#EBD8BC]/60 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center">
            <LoadingSpinner message="Loading user directory..." />
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center">
            <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No users found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              No registered user accounts match your search and filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
           <table className="w-full min-w-[950px] text-left border-collapse">
              <thead>
                <tr className="bg-[#FFFDF9] border-b border-gray-100 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4">Sign-in Method</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {users.map((u: any) => (
                  <tr key={u._id} className="hover:bg-[#FFFDF9] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {u.avatar || u.picture ? (
                          <img
                            src={u.avatar || u.picture}
                            alt={u.name || 'User'}
                            className="w-9 h-9 rounded-full object-cover border border-[#EBD8BC]"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#6E1717] text-[#C99A4A] font-bold flex items-center justify-center text-xs shadow-xs">
                            {u.name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || <FiUser />}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{u.name || u.displayName || 'User'}</p>
                          <p className="text-[10px] font-mono text-gray-400">ID: #{u._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 font-medium">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <RoleBadge role={u.role || 'customer'} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FFF8ED] text-gray-700 border border-[#EBD8BC]/50">
                        {u.provider === 'google' ? 'Google OAuth' : 'Email/Password'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/admin/roles"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[#6E1717] hover:bg-[#FFF8ED] font-semibold transition-colors no-underline border border-transparent hover:border-[#EBD8BC]"
                      >
                        <FiShield className="w-3.5 h-3.5 text-[#C99A4A]" />
                        <span className="whitespace-nowrap">Edit Role</span>
                      </Link>
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
          totalItems={totalUsers}
          pageSize={10}
          itemName="users"
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default AdminUsers;
