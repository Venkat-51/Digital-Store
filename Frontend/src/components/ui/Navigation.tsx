import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => (
  <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5', className)}>
    <Link to="/" aria-label="Home" className="text-gray-400 hover:text-gray-600 transition-colors">
      <Home size={14} />
    </Link>
    {items.map((item, idx) => (
      <React.Fragment key={idx}>
        <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
        {item.href && idx < items.length - 1 ? (
          <Link
            to={item.href}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            {item.label}
          </Link>
        ) : (
          <span className="text-sm text-gray-900 font-semibold">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

// ── Pagination ──
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      {getPages().map((page, idx) =>
        page === '...' ? (
          <span key={`dots-${idx}`} className="px-2 py-2 text-gray-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={cn(
              'w-10 h-10 rounded-xl text-sm font-semibold transition-all',
              currentPage === page
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100',
            )}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </nav>
  );
};
