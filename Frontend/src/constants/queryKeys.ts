// ============================================================
// TanStack Query Keys
// ============================================================

export const QUERY_KEYS = {
  // Products
  PRODUCTS: 'products',
  PRODUCT: (slug: string) => ['product', slug] as const,
  FEATURED_PRODUCTS: 'featured-products',
  RELATED_PRODUCTS: (id: number) => ['related-products', id] as const,

  // Categories
  CATEGORIES: 'categories',
  CATEGORY: (slug: string) => ['category', slug] as const,

  // Orders
  ORDERS: 'orders',
  ORDER: (orderNumber: string) => ['order', orderNumber] as const,

  // Cart
  CART: 'cart',

  // Wishlist
  WISHLIST: 'wishlist',

  // Profile
  PROFILE: 'profile',
  ADDRESSES: 'addresses',

  // Admin
  ADMIN_STATS: 'admin-stats',
  ADMIN_PRODUCTS: 'admin-products',
  ADMIN_CUSTOMERS: 'admin-customers',
  ADMIN_ORDERS: 'admin-orders',

  // Search
  SEARCH: (query: string) => ['search', query] as const,
} as const;
