/**
 * src/components/rbac/RoleBadge.tsx
 *
 * Reusable Tailwind CSS badge for displaying role identifiers with consistent color coding.
 */

import React from 'react';

export interface RoleBadgeProps {
  role: string;
  isSystem?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const roleStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
  super_admin: {
    bg: 'bg-purple-100 dark:bg-purple-950/60',
    text: 'text-purple-800 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-800',
    label: 'Super Admin',
  },
  admin: {
    bg: 'bg-indigo-100 dark:bg-indigo-950/60',
    text: 'text-indigo-800 dark:text-indigo-300',
    border: 'border-indigo-300 dark:border-indigo-800',
    label: 'Admin',
  },
  artisan: {
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-800',
    label: 'Artisan',
  },
  customer: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-800',
    label: 'Customer',
  },
};

const defaultStyle = {
  bg: 'bg-slate-100 dark:bg-slate-800',
  text: 'text-slate-800 dark:text-slate-300',
  border: 'border-slate-300 dark:border-slate-700',
  label: '',
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, isSystem, size = 'md' }) => {
  const normalizedKey = role.toLowerCase().replace(/\s+/g, '_');
  const style = roleStyles[normalizedKey] || {
    ...defaultStyle,
    label: role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-sm transition-colors ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      <span>{style.label || role}</span>
      {isSystem && (
        <span className="text-[10px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 ml-0.5">
          Sys
        </span>
      )}
    </span>
  );
};

export default RoleBadge;
