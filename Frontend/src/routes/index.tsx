import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useRouteError } from 'react-router-dom';
import { PageLoader } from '@/components/ui/Loader';

// Layouts
import RootLayout from '@/layouts/RootLayout';
import AuthLayout from '@/layouts/AuthLayout';
import CustomerLayout from '@/layouts/CustomerLayout';

// Automatic Retry Wrapper for Dynamic Imports (Handles Vercel chunk hash updates gracefully)
const lazyRetry = <T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) =>
  lazy(async () => {
    const hasAlreadyRefreshed = sessionStorage.getItem('retry_chunk_refreshed');
    try {
      const component = await componentImport();
      sessionStorage.removeItem('retry_chunk_refreshed');
      return component;
    } catch (error) {
      if (!hasAlreadyRefreshed) {
        sessionStorage.setItem('retry_chunk_refreshed', 'true');
        window.location.reload();
        return { default: (() => null) as unknown as T };
      }
      throw error;
    }
  });

// Error Boundary for React Router
const RootErrorBoundary: React.FC = () => {
  const error: any = useRouteError();
  const isChunkError =
    error?.name === 'TypeError' ||
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.message?.includes('Importing a module script failed');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center space-y-5">
        <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto font-bold text-2xl">
          !
        </div>
        <h2 className="text-xl font-black text-gray-900">
          {isChunkError ? 'Application Updated' : 'Something went wrong'}
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          {isChunkError
            ? 'A new version of the app is available. Click below to refresh and load the latest updates.'
            : 'An unexpected error occurred while loading this page.'}
        </p>
        <button
          onClick={() => {
            sessionStorage.removeItem('retry_chunk_refreshed');
            window.location.reload();
          }}
          className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-colors shadow-md text-sm cursor-pointer"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
};

// Lazy-loaded pages — Public
const HomePage          = lazyRetry(() => import('@/pages/public/HomePage'));
const ShopPage          = lazyRetry(() => import('@/pages/public/ShopPage'));
const CategoriesPage    = lazyRetry(() => import('@/pages/public/CategoriesPage'));
const ProductDetailPage = lazyRetry(() => import('@/pages/public/ProductDetailPage'));
const SearchPage        = lazyRetry(() => import('@/pages/public/SearchPage'));
const CartPage          = lazyRetry(() => import('@/pages/public/CartPage'));
const CheckoutPage      = lazyRetry(() => import('@/pages/public/CheckoutPage'));
const OrderSuccessPage  = lazyRetry(() => import('@/pages/public/OrderSuccessPage'));
const WishlistPage      = lazyRetry(() => import('@/pages/public/WishlistPage'));
const AboutPage         = lazyRetry(() => import('@/pages/public/AboutPage'));
const ContactPage       = lazyRetry(() => import('@/pages/public/ContactPage'));
const LaptopServicePage = lazyRetry(() => import('@/pages/public/LaptopServicePage'));
const OrderTrackingPage = lazyRetry(() => import('@/pages/public/OrderTrackingPage'));
const FAQPage           = lazyRetry(() => import('@/pages/public/FAQPage'));
const PrivacyPage       = lazyRetry(() => import('@/pages/public/PrivacyPage'));
const TermsPage         = lazyRetry(() => import('@/pages/public/TermsPage'));

// Auth
const LoginPage          = lazyRetry(() => import('@/pages/auth/LoginPage'));
const RegisterPage       = lazyRetry(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazyRetry(() => import('@/pages/auth/ForgotPasswordPage'));

// Customer
const ProfilePage        = lazyRetry(() => import('@/pages/customer/ProfilePage'));
const OrdersPage         = lazyRetry(() => import('@/pages/customer/OrdersPage'));
const SavedAddressesPage = lazyRetry(() => import('@/pages/customer/SavedAddressesPage'));

const Wrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RootErrorBoundary />,
    children: [
      { index: true,                   element: <Wrap><HomePage /></Wrap> },
      { path: 'shop',                  element: <Wrap><ShopPage /></Wrap> },
      { path: 'categories',            element: <Wrap><CategoriesPage /></Wrap> },
      { path: 'categories/:slug',      element: <Wrap><ShopPage /></Wrap> },
      { path: 'products/:slug',        element: <Wrap><ProductDetailPage /></Wrap> },
      { path: 'search',               element: <Wrap><SearchPage /></Wrap> },
      { path: 'cart',                 element: <Wrap><CartPage /></Wrap> },
      { path: 'checkout',             element: <Wrap><CheckoutPage /></Wrap> },
      { path: 'order-success/:orderNumber', element: <Wrap><OrderSuccessPage /></Wrap> },
      { path: 'wishlist',             element: <Wrap><WishlistPage /></Wrap> },
      { path: 'about',                element: <Wrap><AboutPage /></Wrap> },
      { path: 'contact',              element: <Wrap><ContactPage /></Wrap> },
      { path: 'faq',                  element: <Wrap><FAQPage /></Wrap> },
      { path: 'privacy-policy',       element: <Wrap><PrivacyPage /></Wrap> },
      { path: 'terms-and-conditions', element: <Wrap><TermsPage /></Wrap> },
      { path: 'trade-in',             element: <Wrap><ContactPage /></Wrap> },
      { path: 'laptop-service',       element: <Wrap><LaptopServicePage /></Wrap> },
      { path: 'donate',               element: <Wrap><ContactPage /></Wrap> },
      { path: 'order-tracking',       element: <Wrap><OrderTrackingPage /></Wrap> },
      {
        path: 'account',
        element: <CustomerLayout />,
        errorElement: <RootErrorBoundary />,
        children: [
          { index: true,        element: <Wrap><ProfilePage /></Wrap> },
          { path: 'profile',    element: <Wrap><ProfilePage /></Wrap> },
          { path: 'orders',     element: <Wrap><OrdersPage /></Wrap> },
          { path: 'orders/:orderNumber', element: <Wrap><OrdersPage /></Wrap> },
          { path: 'addresses',  element: <Wrap><SavedAddressesPage /></Wrap> },
          { path: 'wishlist',   element: <Wrap><WishlistPage /></Wrap> },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    errorElement: <RootErrorBoundary />,
    children: [
      { path: 'login',           element: <Wrap><LoginPage /></Wrap> },
      { path: 'register',        element: <Wrap><RegisterPage /></Wrap> },
      { path: 'forgot-password', element: <Wrap><ForgotPasswordPage /></Wrap> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export const AppRouter: React.FC = () => <RouterProvider router={router} />;
