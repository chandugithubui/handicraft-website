/**
 * src/components/common/Pagination.tsx
 *
 * Reusable pagination component matching the project's Indian Artisan theme
 * (Deep Maroon, Terracotta, Warm Gold accents).
 */

import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  itemName?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  itemName = 'items',
}) => {
  if (totalPages <= 1 && (!totalItems || totalItems <= (pageSize || 10))) {
    return null;
  }

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // show 1 page before and after current

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const startItem = totalItems !== undefined && pageSize !== undefined
    ? Math.min((currentPage - 1) * pageSize + 1, totalItems)
    : undefined;
  const endItem = totalItems !== undefined && pageSize !== undefined
    ? Math.min(currentPage * pageSize, totalItems)
    : undefined;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 border-t border-gray-100 bg-white/80">
      {/* Items count summary */}
      <div className="text-xs text-gray-500 font-medium">
        {totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
          <span>
            Showing <strong className="font-semibold text-gray-800">{startItem}</strong> to{' '}
            <strong className="font-semibold text-gray-800">{endItem}</strong> of{' '}
            <strong className="font-semibold text-gray-800">{totalItems}</strong> {itemName}
          </span>
        ) : (
          <span>
            Page <strong className="font-semibold text-gray-800">{currentPage}</strong> of{' '}
            <strong className="font-semibold text-gray-800">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
          aria-label="Previous Page"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-xs text-gray-400 select-none">
                …
              </span>
            );
          }

          const pageNum = p as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[32px] h-8 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#6E1717] text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
          aria-label="Next Page"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
