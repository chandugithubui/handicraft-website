/**
 * src/pages/admin/AdminLayout.tsx
 *
 * Modern, fixed Admin Layout matching Handicraft Hub's Indian Artisan theme
 * (Primary Maroon #6E1717, Terracotta #C85A2E, Gold #C99A4A, Cream #FDFBF7).
 *
 * Requirements satisfied:
 * - Sidebar is fixed and NEVER scrolls with page scroll.
 * - Super admin name and role are positioned at the BOTTOM of the sidebar alongside logout.
 * - Navigation links are positioned directly below the logo.
 * - Permission-based dynamic navigation item filtering.
 */

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  FiGrid,
  FiShoppingCart,
  FiBox,
  FiTag,
  FiUsers,
  FiMail,
  FiSend,
  FiShield,
  FiLogOut,
  FiMenu,
  FiX,
  FiExternalLink,
  FiChevronRight,
  FiUser,
  FiHome,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import RoleBadge from '../../components/rbac/RoleBadge';
import { hasUserPermission } from '../../utils/authUtils';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  exact?: boolean;
}

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems: NavItem[] = [
    {
      name: 'Overview',
      path: '/admin',
      icon: FiGrid,
      exact: true,
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: FiShoppingCart,
      permission: 'orders:read',
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: FiBox,
      permission: 'products:read',
    },
    {
      name: 'Coupons',
      path: '/admin/coupons',
      icon: FiTag,
      permission: 'coupons:read',
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: FiUsers,
      permission: 'users:read',
    },
    {
      name: 'Inquiries',
      path: '/admin/contacts',
      icon: FiMail,
      permission: 'messages:read',
    },
    {
      name: 'Subscribers',
      path: '/admin/subscribers',
      icon: FiSend,
      permission: 'marketing:read',
    },
    {
      name: 'Roles & Permissions',
      path: '/admin/roles',
      icon: FiShield,
      permission: 'roles:read',
    },
  ];

  // Filter navigation items by user permissions
  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return hasUserPermission(user, item.permission);
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const currentNavItem = navItems.find((item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-800 font-sans flex flex-col">
      {/* ── Mobile Header ────────────────────────────────────────── */}
      <header className="md:hidden bg-white border-b border-[#EBD8BC]/60 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#6E1717] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            H
          </div>
          <span className="font-serif font-bold text-base text-[#6E1717]">
            Handicraft Admin
          </span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-[#FFF8ED] transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileSidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>
      </header>

      {/* ── Mobile Drawer Overlay ────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── FIXED SIDEBAR (Never scrolls with page) ──────────────── */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-[#EBD8BC]/70 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } h-screen`}
      >
        {/* Top: Logo & Nav Links */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Brand Header */}
          <div className="p-4 px-5 border-b border-gray-100 flex items-center justify-between shrink-0">
            <Link to="/admin" className="flex items-center gap-3 no-underline group">
              <div className="w-9 h-9 rounded-xl bg-[#6E1717] flex items-center justify-center text-white shadow-sm shadow-[#6E1717]/20 group-hover:scale-105 transition-transform">
                <FiShield className="w-4 h-4 text-[#C99A4A]" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-base text-[#292522] tracking-tight leading-tight">
                  Handicraft Hub
                </h1>
                <p className="text-[10px] font-semibold text-[#C85A2E] tracking-wider uppercase">
                  Admin Control Center
                </p>
              </div>
            </Link>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-gray-700 p-1 rounded-lg"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links directly under logo */}
          <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
            <div className="px-3 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Management
            </div>
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 no-underline ${
                    isActive
                      ? 'bg-[#6E1717] text-white shadow-xs font-bold'
                      : 'text-gray-700 hover:text-[#6E1717] hover:bg-[#FFF8ED]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <item.icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-[#C99A4A]' : 'text-gray-400'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <FiChevronRight className="w-3.5 h-3.5 text-white/80" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* ── BOTTOM OF SIDEBAR: Super Admin Profile & Logout ─────── */}
        <div className="p-3 border-t border-gray-100 bg-[#FFFDF9] shrink-0 space-y-2">
          {/* User profile card */}
          <div className="p-2.5 bg-white rounded-xl border border-[#EBD8BC]/60 shadow-xs flex items-center gap-2.5">
            {user?.avatar || user?.picture ? (
              <img
                src={user.avatar || user.picture}
                alt={user.name || 'User'}
                className="w-9 h-9 rounded-full object-cover border border-[#EBD8BC]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#6E1717] text-[#C99A4A] font-bold flex items-center justify-center text-xs shadow-xs">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || <FiUser />}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 truncate leading-tight">
                {user?.name || user?.displayName || user?.email?.split('@')[0]}
              </p>
              <div className="mt-0.5">
                <RoleBadge role={user?.role || 'user'} size="sm" />
              </div>
            </div>
          </div>

          {/* Quick Actions (Storefront & Logout) */}
          <div className="flex items-center gap-1.5 pt-1">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-semibold text-gray-600 hover:text-[#6E1717] hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-colors no-underline"
              title="Return to Public Store"
            >
              <FiHome className="w-3.5 h-3.5 text-gray-400" />
              <span>Store</span>
              <FiExternalLink className="w-2.5 h-2.5 text-gray-400" />
            </Link>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors cursor-pointer bg-transparent"
              title="Sign Out"
            >
              <FiLogOut className="w-3.5 h-3.5 text-red-500" />
              <span>{isLoggingOut ? 'Leaving…' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area (Offset by fixed sidebar width) ────── */}
      <div className="md:ml-64 flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <div className="hidden md:flex h-14 bg-white border-b border-[#EBD8BC]/60 px-8 items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-semibold text-gray-400">Admin</span>
            <span>/</span>
            <span className="font-bold text-[#6E1717]">
              {currentNavItem ? currentNavItem.name : 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-[#FFF8ED] hover:bg-[#F4E5D0] hover:text-[#6E1717] transition-colors no-underline border border-[#EBD8BC]/50"
            >
              <FiHome className="w-3.5 h-3.5" />
              <span>View Public Store</span>
            </Link>

            <div className="h-4 w-px bg-gray-200" />

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">Active Session:</span>
              <span className="font-semibold text-gray-800">{user?.name || user?.email}</span>
              <RoleBadge role={user?.role || 'user'} size="sm" />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
