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
  WHOLESALE: '/wholesale',
  TRADE_IN: '/trade-in',
  LAPTOP_SERVICE: '/laptop-service',
  DONATE: '/donate',
  ORDER_TRACKING: '/order-tracking',

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
} as const;

export const buildRoute = {
  product: (slug: string) => `/products/${slug}`,
  category: (slug: string) => `/categories/${slug}`,
  orderSuccess: (orderNumber: string) => `/order-success/${orderNumber}`,
  orderDetail: (orderNumber: string) => `/account/orders/${orderNumber}`,
};
