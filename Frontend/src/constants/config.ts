// ============================================================
// App Config Constants
// ============================================================

export const CONFIG = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Lexicon Technology',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  APP_URL: import.meta.env.VITE_APP_URL || "http://localhost:5173",  CURRENCY: 'SGD',
  CURRENCY_SYMBOL: '$',
  PRODUCTS_PER_PAGE: 12,
  MAX_CART_QUANTITY: 99,
  DEBOUNCE_MS: 400,
  TOKEN_KEY: 'lexicon_access_token',
  REFRESH_TOKEN_KEY: 'lexicon_refresh_token',
  CART_STORAGE_KEY: 'lexicon_cart',
  WISHLIST_STORAGE_KEY: 'lexicon_wishlist',
} as const;

export const NAV_CATEGORIES = [
  { name: 'Computer Accessories', slug: 'computer-accessories', icon: 'Monitor' },
  { name: 'Data Storage', slug: 'data-storage', icon: 'HardDrive' },
  { name: 'Gaming', slug: 'gaming', icon: 'Gamepad2' },
  { name: 'Networking & Wireless', slug: 'networking-wireless', icon: 'Wifi' },
  { name: 'Office Essentials', slug: 'office-essentials', icon: 'Briefcase' },
  { name: 'Power Bank', slug: 'power-bank', icon: 'BatteryCharging' },
] as const;

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-800' },
  confirmed:  { label: 'Confirmed',  color: 'bg-blue-100 text-blue-800' },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800' },
  shipped:    { label: 'Shipped',    color: 'bg-indigo-100 text-indigo-800' },
  delivered:  { label: 'Delivered',  color: 'bg-green-100 text-green-800' },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-800' },
  refunded:   { label: 'Refunded',   color: 'bg-gray-100 text-gray-800' },
};

export const SORT_OPTIONS = [
  { value: 'created_at',   label: 'Latest' },
  { value: '-created_at',  label: 'Oldest' },
  { value: 'price',        label: 'Price: Low to High' },
  { value: '-price',       label: 'Price: High to Low' },
  { value: 'name',         label: 'Name: A-Z' },
  { value: '-name',        label: 'Name: Z-A' },
] as const;
