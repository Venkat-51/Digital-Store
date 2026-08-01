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

/** Format image URL ensuring proper base URL for media files */
export const formatImageUrl = (url?: string): string => {
  if (!url || url.trim() === '' || url === '/placeholder-product.png') {
    return 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';
  }
  
  const cleanUrl = url.trim();

  // If relative media URL, prepend backend base URL
  if (cleanUrl.startsWith('/media/') || cleanUrl.startsWith('media/')) {
    const backendBase = CONFIG.API_BASE_URL.replace(/\/api\/?$/, '');
    return `${backendBase}/${cleanUrl.replace(/^\//, '')}`;
  }

  // Handle 127.0.0.1 vs localhost domain conversion
  if (cleanUrl.includes('127.0.0.1:8000') && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return cleanUrl.replace('127.0.0.1:8000', 'localhost:8000');
  }

  return cleanUrl;
};

/** Get primary image URL from product images array */
export const getProductImage = (images?: { image: string; is_primary: boolean }[], thumbnail?: string): string => {
  let selectedUrl = '';
  if (thumbnail && thumbnail.trim()) {
    selectedUrl = thumbnail;
  } else if (images && images.length > 0) {
    const primary = images.find((img) => img.is_primary);
    selectedUrl = primary ? primary.image : images[0].image;
  }
  return formatImageUrl(selectedUrl);
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
