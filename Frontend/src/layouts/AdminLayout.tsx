import React, { useState } from 'react';
import { Outlet, NavLink, Navigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users,
  Image, Settings, LogOut, Bell, Menu, X, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/helpers';
import { PageLoader } from '@/components/ui/Loader';

const ADMIN_NAV = [
  { to: ROUTES.ADMIN,            icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
  { to: ROUTES.ADMIN_PRODUCTS,   icon: <Package size={18} />,         label: 'Products'           },
  { to: ROUTES.ADMIN_CATEGORIES, icon: <Tag size={18} />,             label: 'Categories'         },
  { to: ROUTES.ADMIN_ORDERS,     icon: <ShoppingBag size={18} />,     label: 'Orders'             },
  { to: ROUTES.ADMIN_CUSTOMERS,  icon: <Users size={18} />,           label: 'Customers'          },
  { to: ROUTES.ADMIN_MEDIA,      icon: <Image size={18} />,           label: 'Media Library'      },
  { to: ROUTES.ADMIN_SETTINGS,   icon: <Settings size={18} />,        label: 'Settings'           },
];

const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated || !user?.is_staff) return <Navigate to={ROUTES.LOGIN} replace />;

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="flex flex-col h-full bg-gray-900 text-gray-400 w-64">
      {/* Logo */}
      <Link
        to={ROUTES.HOME}
        className="flex items-center justify-between px-5 py-4 border-b border-gray-800"
        onClick={onItemClick}
      >
        <div className="bg-white px-3.5 py-2 rounded-2xl flex items-center justify-center shadow-xs">
          <img
            src="/logo.png"
            alt="Lexicon Technology Pte Ltd"
            className="h-7 w-auto object-contain"
          />
        </div>
        <span className="text-2xs font-bold text-gray-400 uppercase tracking-widest bg-gray-800/80 px-2 py-1 rounded-md">
          ADMIN
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <p className="px-5 py-2 text-2xs font-bold uppercase tracking-widest text-gray-600">Main Menu</p>
        {ADMIN_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onItemClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-all mx-2 rounded-xl mb-0.5',
                isActive
                  ? 'bg-primary-600 text-white shadow-glow/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
            {user?.first_name?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.first_name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => {
            onItemClick?.();
            logout();
          }}
          className="flex items-center gap-2 w-full px-2 py-2 text-sm font-medium text-gray-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <SidebarContent onItemClick={() => setIsSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <button
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="text-base font-bold text-gray-900">Admin Dashboard</h1>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary-500 rounded-full" />
            </button>
            <Link to={ROUTES.HOME} className="text-sm font-semibold text-primary-600 hover:text-primary-700">
              View Site →
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
