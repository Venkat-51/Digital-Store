import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { PageLoader } from '@/components/ui/Loader';

// Layouts
import RootLayout from '@/layouts/RootLayout';
import AuthLayout from '@/layouts/AuthLayout';
import CustomerLayout from '@/layouts/CustomerLayout';

// Lazy-loaded pages — Public
const HomePage          = lazy(() => import('@/pages/public/HomePage'));
const ShopPage          = lazy(() => import('@/pages/public/ShopPage'));
const CategoriesPage    = lazy(() => import('@/pages/public/CategoriesPage'));
const ProductDetailPage = lazy(() => import('@/pages/public/ProductDetailPage'));
const SearchPage        = lazy(() => import('@/pages/public/SearchPage'));
const CartPage          = lazy(() => import('@/pages/public/CartPage'));
const CheckoutPage      = lazy(() => import('@/pages/public/CheckoutPage'));
const OrderSuccessPage  = lazy(() => import('@/pages/public/OrderSuccessPage'));
const WishlistPage      = lazy(() => import('@/pages/public/WishlistPage'));
const AboutPage         = lazy(() => import('@/pages/public/AboutPage'));
const ContactPage       = lazy(() => import('@/pages/public/ContactPage'));
const FAQPage           = lazy(() => import('@/pages/public/FAQPage'));
const PrivacyPage       = lazy(() => import('@/pages/public/PrivacyPage'));
const TermsPage         = lazy(() => import('@/pages/public/TermsPage'));

// Auth
const LoginPage         = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage      = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));

// Customer
const ProfilePage       = lazy(() => import('@/pages/customer/ProfilePage'));
const OrdersPage        = lazy(() => import('@/pages/customer/OrdersPage'));
const SavedAddressesPage = lazy(() => import('@/pages/customer/SavedAddressesPage'));

const Wrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
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
      { path: 'wholesale',            element: <Wrap><ContactPage /></Wrap> },
      { path: 'trade-in',             element: <Wrap><ContactPage /></Wrap> },
      { path: 'laptop-service',       element: <Wrap><ContactPage /></Wrap> },
      { path: 'donate',               element: <Wrap><ContactPage /></Wrap> },
      { path: 'order-tracking',       element: <Wrap><ContactPage /></Wrap> },
      {
        path: 'account',
        element: <CustomerLayout />,
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
    children: [
      { path: 'login',           element: <Wrap><LoginPage /></Wrap> },
      { path: 'register',        element: <Wrap><RegisterPage /></Wrap> },
      { path: 'forgot-password', element: <Wrap><ForgotPasswordPage /></Wrap> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export const AppRouter: React.FC = () => <RouterProvider router={router} />;
