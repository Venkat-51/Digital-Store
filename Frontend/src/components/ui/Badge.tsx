import React from 'react';
import { cn } from '@/utils/helpers';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'gray' | 'new' | 'sale';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  primary:   'bg-primary-100 text-primary-700',
  secondary: 'bg-secondary-100 text-secondary-700',
  success:   'bg-success-50 text-success-600',
  danger:    'bg-danger-50 text-danger-600',
  warning:   'bg-yellow-50 text-yellow-700',
  gray:      'bg-gray-100 text-gray-600',
  new:       'bg-primary-600 text-white',
  sale:      'bg-secondary-500 text-white',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'gray', children, className, size = 'sm' }) => (
  <span
    className={cn(
      'inline-flex items-center font-semibold rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      variantStyles[variant],
      className,
    )}
  >
    {children}
  </span>
);

// ── Status Badge ──
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusMap: Record<string, { label: string; variant: BadgeVariant }> = {
    pending:    { label: 'Pending',    variant: 'warning' },
    confirmed:  { label: 'Confirmed',  variant: 'primary' },
    processing: { label: 'Processing', variant: 'primary' },
    shipped:    { label: 'Shipped',    variant: 'secondary' },
    delivered:  { label: 'Delivered',  variant: 'success' },
    cancelled:  { label: 'Cancelled',  variant: 'danger' },
    refunded:   { label: 'Refunded',   variant: 'gray' },
    active:     { label: 'Active',     variant: 'success' },
    inactive:   { label: 'Inactive',   variant: 'gray' },
  };

  const config = statusMap[status.toLowerCase()] ?? { label: status, variant: 'gray' as BadgeVariant };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};
