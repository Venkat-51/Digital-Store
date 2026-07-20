// ============================================================
// Utility Formatters
// ============================================================

import { CONFIG } from '@/constants/config';

/** Format a price string to SGD currency */
export const formatPrice = (price: string | number): string => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return `${CONFIG.CURRENCY_SYMBOL}${num.toFixed(2)}`;
};

/** Format date to readable string */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/** Format date with time */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** Get primary image URL from product images array */
export const getProductImage = (images?: { image: string; is_primary: boolean }[], thumbnail?: string): string => {
  if (thumbnail) return thumbnail;
  if (!images || images.length === 0) return '/placeholder-product.png';
  const primary = images.find((img) => img.is_primary);
  return primary ? primary.image : images[0].image;
};

/** Calculate discount percentage */
export const calcDiscount = (price: string, comparePrice: string): number => {
  const p = parseFloat(price);
  const c = parseFloat(comparePrice);
  if (c <= p) return 0;
  return Math.round(((c - p) / c) * 100);
};

/** Truncate text to N characters */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
};

/** Generate initials from name */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/** Slugify a string */
export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

/** Format file size */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/** Clamp a number between min and max */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
