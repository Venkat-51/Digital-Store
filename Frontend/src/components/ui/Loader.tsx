import React from 'react';
import { cn } from '@/utils/helpers';

// ── Spinner ──
interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const spinnerSizes = { xs: 'h-4 w-4', sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => (
  <svg
    className={cn('animate-spin text-primary-600', spinnerSizes[size], className)}
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

// ── Page Loader ──
export const PageLoader: React.FC = () => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm font-medium text-gray-500 animate-pulse">Loading…</p>
    </div>
  </div>
);

// ── Skeleton ──
interface SkeletonProps {
  className?: string;
  rounded?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, rounded = 'rounded-xl' }) => (
  <div className={cn('skeleton', rounded, className)} />
);

// ── Product Card Skeleton ──
export const ProductCardSkeleton: React.FC = () => (
  <div className="card p-4">
    <Skeleton className="w-full h-48 mb-4" rounded="rounded-xl" />
    <Skeleton className="h-4 w-2/3 mb-2" />
    <Skeleton className="h-4 w-1/2 mb-3" />
    <Skeleton className="h-6 w-1/3 mb-4" />
    <Skeleton className="h-10 w-full" />
  </div>
);

// ── Generic Grid Skeleton ──
export const GridSkeleton: React.FC<{ count?: number; cols?: number }> = ({ count = 8, cols = 4 }) => (
  <div className={cn('grid gap-4', `grid-cols-2 md:grid-cols-${Math.min(cols, 3)} lg:grid-cols-${cols}`)}>
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);
