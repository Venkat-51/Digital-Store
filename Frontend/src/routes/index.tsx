import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { PageLoader } from '@/components/ui/Loader';
import { ROUTES } from '@/constants/routes';

// Layouts
import RootLayout from '@/layouts/RootLayout';
import AuthLayout from '@/layouts/AuthLayout';
import CustomerLayout from '@/layouts/CustomerLayout';
import AdminLayout from '@/layouts/AdminLayout';

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
const CustomerDashboard = lazy(() => import('@/pages/customer/CustomerDashboard'));
const ProfilePage       = lazy(() => import('@/pages/customer/ProfilePage'));
const OrdersPage        = lazy(() => import('@/pages/customer/OrdersPage'));

// Admin
const AdminDashboard    = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminProducts     = lazy(() => import('@/pages/admin/AdminProducts'));
const AdminCategories   = lazy(() => import('@/pages/admin/AdminCategories'));
const AdminOrders       = lazy(() => import('@/pages/admin/AdminOrders'));
const AdminCustomers    = lazy(() => import('@/pages/admin/AdminCustomers'));

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
  {
    path: '/account',
    element: <CustomerLayout />,
    children: [
      { index: true,        element: <Wrap><CustomerDashboard /></Wrap> },
      { path: 'profile',    element: <Wrap><ProfilePage /></Wrap> },
      { path: 'orders',     element: <Wrap><OrdersPage /></Wrap> },
      { path: 'orders/:orderNumber', element: <Wrap><OrdersPage /></Wrap> },
      { path: 'addresses',  element: <Wrap><ProfilePage /></Wrap> },
      { path: 'wishlist',   element: <Wrap><WishlistPage /></Wrap> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true,        element: <Wrap><AdminDashboard /></Wrap> },
      { path: 'products',   element: <Wrap><AdminProducts /></Wrap> },
      { path: 'categories', element: <Wrap><AdminCategories /></Wrap> },
      { path: 'orders',     element: <Wrap><AdminOrders /></Wrap> },
      { path: 'customers',  element: <Wrap><AdminCustomers /></Wrap> },
      { path: 'media',      element: <Wrap><AdminDashboard /></Wrap> },
      { path: 'settings',   element: <Wrap><AdminDashboard /></Wrap> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export const AppRouter: React.FC = () => <RouterProvider router={router} />;
