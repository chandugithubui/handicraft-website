/**
 * src/pages/admin/AdminLayout.tsx
 *
 * Admin shell: persistent sidebar on desktop (≥768px),
 * slide-in drawer on mobile (<768px).
 *
 * Mobile drawer stacking:
 *   main content  (no z-index)
 *   overlay       z-40
 *   sidebar       z-50
 *   X button      inside sidebar — inherits z-50, no overrides needed
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
  NavLink,
  Outlet,
  useNavigate,
  Link,
  useLocation,
} from 'react-router-dom';
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
import { useAuth }           from '../../context/AuthContext';
import RoleBadge             from '../../components/rbac/RoleBadge';
import { hasUserPermission } from '../../utils/authUtils';

interface NavItem {
  name:        string;
  path:        string;
  icon:        React.ComponentType<{ className?: string }>;
  permission?: string;
  exact?:      boolean;
}

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoggingOut,      setIsLoggingOut]      = useState(false);

  // ── Navigation items ──────────────────────────────────────────────────────
  const navItems: NavItem[] = [
    { name: 'Overview',           path: '/admin',             icon: FiGrid,         exact: true },
    { name: 'Orders',             path: '/admin/orders',      icon: FiShoppingCart, permission: 'orders:read' },
    { name: 'Products',           path: '/admin/products',    icon: FiBox,          permission: 'products:read' },
    { name: 'Coupons',            path: '/admin/coupons',     icon: FiTag,          permission: 'coupons:read' },
    { name: 'Users',              path: '/admin/users',       icon: FiUsers,        permission: 'users:read' },
    { name: 'Inquiries',          path: '/admin/contacts',    icon: FiMail,         permission: 'messages:read' },
    { name: 'Subscribers',        path: '/admin/subscribers', icon: FiSend,         permission: 'marketing:read' },
    { name: 'Roles & Permissions',path: '/admin/roles',       icon: FiShield,       permission: 'roles:read' },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.permission || hasUserPermission(user, item.permission)
  );

  const currentNavItem = navItems.find((item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path)
  );

  // ── Close helpers ─────────────────────────────────────────────────────────
  const openMobileSidebar  = () => setMobileSidebarOpen(true);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  // Close drawer on route change
  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname, closeMobileSidebar]);

  // Prevent body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileSidebarOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileSidebar();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileSidebarOpen, closeMobileSidebar]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ── Sidebar nav link — closes drawer on mobile tap ────────────────────────
  const handleNavClick = () => closeMobileSidebar();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-800 font-sans">

      {/* ── MOBILE HEADER ───────────────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#EBD8BC]/60 px-4 flex items-center justify-between z-30 shadow-sm">
        <Link to="/admin" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg bg-[#6E1717] flex items-center justify-center text-white font-bold text-sm">
            H
          </div>
          <span className="font-serif font-bold text-base text-[#6E1717]">
            Handicraft Admin
          </span>
        </Link>

        {/* Hamburger — only when drawer is closed */}
        <button
          type="button"
          onClick={openMobileSidebar}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-[#FFF8ED] transition-colors"
          aria-label="Open navigation"
          aria-expanded={mobileSidebarOpen}
          aria-controls="admin-mobile-sidebar"
        >
          <FiMenu className="w-5 h-5" />
        </button>
      </header>

      {/* ── MOBILE OVERLAY (z-40, below sidebar z-50) ───────────────────── */}
      {mobileSidebarOpen && (
        <div
          role="presentation"
          aria-hidden="true"
          onClick={closeMobileSidebar}
          className="md:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside
        id="admin-mobile-sidebar"
        aria-label="Admin navigation"
        data-open={mobileSidebarOpen}
        className={[
          'fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw]',
          'bg-white border-r border-[#EBD8BC]/70',
          'flex flex-col',
          'z-50',
          'transition-transform duration-300 ease-in-out',
          // desktop: always visible
          'md:!translate-x-0',
          // mobile: driven by data-open attribute via CSS below
          // (avoids Tailwind stylesheet-order conflict between
          //  translate-x-0 and -translate-x-full)
          'admin-sidebar',
        ].join(' ')}
      >
        {/* ── SIDEBAR HEADER (brand + X button) ──────────────────────── */}
        <div className="h-16 px-4 border-b border-gray-100 flex items-center justify-between shrink-0">

          {/* Brand link */}
          <Link
            to="/admin"
            onClick={handleNavClick}
            className="flex items-center gap-3 no-underline group min-w-0 flex-1"
          >
            <div className="w-9 h-9 shrink-0 rounded-xl bg-[#6E1717] flex items-center justify-center text-white shadow-sm">
              <FiShield className="w-4 h-4 text-[#C99A4A]" />
            </div>
            <div className="min-w-0">
              <h1 className="font-serif font-bold text-base text-[#292522] tracking-tight leading-tight truncate">
                Handicraft Hub
              </h1>
              <p className="text-[9px] font-semibold text-[#C85A2E] tracking-wider uppercase truncate">
                Admin Control Center
              </p>
            </div>
          </Link>

          {/*
           * X close button — mobile only.
           * Lives inside z-50 aside, so no extra z-index needed.
           * No pointer-events overrides — just a clean button.
           */}
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="md:hidden shrink-0 ml-3 flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-[#FFF8ED] hover:text-[#6E1717] transition-colors"
            aria-label="Close navigation"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* ── NAV LINKS ───────────────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Management
          </div>

          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={handleNavClick}
              className={({ isActive }) =>
                [
                  'flex items-center justify-between',
                  'px-3 py-2.5 rounded-xl',
                  'text-xs font-semibold',
                  'transition-all duration-150 no-underline',
                  isActive
                    ? 'bg-[#6E1717] text-white shadow-sm'
                    : 'text-gray-700 hover:text-[#6E1717] hover:bg-[#FFF8ED]',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5">
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-[#C99A4A]' : 'text-gray-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <FiChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── SIDEBAR FOOTER ──────────────────────────────────────────── */}
        <div className="p-3 border-t border-gray-100 bg-[#FFFDF9] shrink-0 space-y-2">

          {/* User info */}
          <div className="p-2.5 bg-white rounded-xl border border-[#EBD8BC]/60 shadow-sm flex items-center gap-2.5">
            {user?.avatar || user?.picture ? (
              <img
                src={user.avatar || user.picture}
                alt={user.name || 'User'}
                className="w-9 h-9 rounded-full object-cover border border-[#EBD8BC]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#6E1717] text-[#C99A4A] font-bold flex items-center justify-center text-xs">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || <FiUser />}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 truncate leading-tight">
                {user?.name || user?.displayName || user?.email?.split('@')[0]}
              </p>
              <div className="mt-1">
                <RoleBadge role={user?.role || 'user'} size="sm" />
              </div>
            </div>
          </div>

          {/* Store + Logout */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              onClick={handleNavClick}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-[11px] font-semibold text-gray-600 hover:text-[#6E1717] hover:bg-white rounded-lg border border-gray-200 transition-colors no-underline"
            >
              <FiHome className="w-3.5 h-3.5" />
              <span>Store</span>
              <FiExternalLink className="w-2.5 h-2.5" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-red-100 transition-colors bg-white disabled:opacity-60"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              <span>{isLoggingOut ? 'Leaving…' : 'Logout'}</span>
            </button>
          </div>

        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ───────────────────────────────────────────── */}
      <div className="md:ml-64 min-h-screen flex flex-col min-w-0">

        {/* Desktop top navbar */}
        <div className="hidden md:flex h-14 bg-white border-b border-[#EBD8BC]/60 px-8 items-center justify-between sticky top-0 z-30 shadow-sm">
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

        {/* Page content — pt-20 offsets the fixed mobile header */}
        <main className="flex-1 w-full pt-20 md:pt-0">
          <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
