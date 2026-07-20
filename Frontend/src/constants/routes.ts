// ============================================================
// Route Constants
// ============================================================

export const ROUTES = {
  // Public
  HOME: '/',
  SHOP: '/shop',
  CATEGORIES: '/categories',
  CATEGORY: '/categories/:slug',
  PRODUCT: '/products/:slug',
  SEARCH: '/search',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER_SUCCESS: '/order-success/:orderNumber',
  WISHLIST: '/wishlist',
  ABOUT: '/about',
  CONTACT: '/contact',
  FAQ: '/faq',
  PRIVACY: '/privacy-policy',
  TERMS: '/terms-and-conditions',

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Customer Dashboard
  DASHBOARD: '/account',
  PROFILE: '/account/profile',
  ADDRESSES: '/account/addresses',
  ORDERS: '/account/orders',
  ORDER_DETAIL: '/account/orders/:orderNumber',
  WISHLIST_ACCOUNT: '/account/wishlist',

  // Admin
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_MEDIA: '/admin/media',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

export const buildRoute = {
  product: (slug: string) => `/products/${slug}`,
  category: (slug: string) => `/categories/${slug}`,
  orderSuccess: (orderNumber: string) => `/order-success/${orderNumber}`,
  orderDetail: (orderNumber: string) => `/account/orders/${orderNumber}`,
};
