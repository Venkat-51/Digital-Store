import React, { useState } from 'react';
import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { User, MapPin, Package, Heart, LogOut, LayoutDashboard, ChevronRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/helpers';
import { PageLoader } from '@/components/ui/Loader';

const CUSTOMER_NAV = [
  { to: ROUTES.DASHBOARD,           icon: <LayoutDashboard size={18} />, label: 'Dashboard'  },
  { to: ROUTES.PROFILE,             icon: <User size={18} />,            label: 'Profile'     },
  { to: ROUTES.ADDRESSES,           icon: <MapPin size={18} />,          label: 'Addresses'   },
  { to: ROUTES.ORDERS,              icon: <Package size={18} />,         label: 'Orders'      },
  { to: ROUTES.WISHLIST_ACCOUNT,    icon: <Heart size={18} />,           label: 'Wishlist'    },
];

const CustomerLayout: React.FC = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  const Sidebar = () => (
    <aside className="w-64 flex-shrink-0">
      {/* Profile card */}
      <div className="card p-5 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
            {user?.first_name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="card overflow-hidden">
        {CUSTOMER_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === ROUTES.DASHBOARD}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition-all',
                'border-b border-gray-50 last:border-0',
                isActive
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )
            }
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {item.label}
            <ChevronRight size={14} className="ml-auto text-gray-300" />
          </NavLink>
        ))}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3.5 text-sm font-semibold text-danger-600 hover:bg-danger-50 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-wide py-8">
        {/* Mobile sidebar toggle */}
        <button
          className="lg:hidden flex items-center gap-2 mb-4 text-sm font-semibold text-gray-600 hover:text-gray-900"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={18} />
          Account Menu
        </button>

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <div className="block">
            <Sidebar />
          </div>

          {/* Mobile sidebar overlay */}
          <AnimatePresence>
            {isSidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 30 }}
                  className="fixed top-0 left-0 z-50 h-full w-72 bg-white p-4 lg:hidden overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-gray-900">Account Menu</span>
                    <button onClick={() => setIsSidebarOpen(false)}>
                      <X size={20} className="text-gray-400" />
                    </button>
                  </div>
                  <Sidebar />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;
