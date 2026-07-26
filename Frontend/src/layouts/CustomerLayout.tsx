import React from 'react';
import { Outlet, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Heart, LogOut, ChevronRight, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { PageLoader } from '@/components/ui/Loader';
import { cn } from '@/utils/helpers';

const CustomerLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : 'Customer';

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  const navTabs = [
    { label: 'Profile Info', to: ROUTES.PROFILE, icon: User },
    { label: 'My Orders', to: ROUTES.ORDERS, icon: ShoppingBag },
    { label: 'Addresses', to: ROUTES.ADDRESSES, icon: MapPin },
    { label: 'Wishlist', to: ROUTES.WISHLIST, icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-gray-100/70 py-4 sm:py-6 font-sans">
      <div className="container-wide max-w-6xl mx-auto px-3 sm:px-4">
        


        {/* DESKTOP & MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          
          {/* Left Sidebar - Flipkart Style (Desktop only) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-4">
            
            {/* User Greeting Box */}
            <div className="bg-white rounded-sm p-3.5 sm:p-4 shadow-2xs border border-gray-200/80 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-300/60 flex items-center justify-center text-amber-600 font-black text-xl flex-shrink-0">
                {user?.first_name?.[0]?.toUpperCase() || <User size={22} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-gray-500 font-medium leading-none mb-1">Hello,</p>
                <h2 className="text-sm font-extrabold text-gray-900 truncate">{displayName}</h2>
              </div>
            </div>

            {/* Menu Links Box */}
            <div className="bg-white rounded-sm shadow-2xs border border-gray-200/80 overflow-hidden divide-y divide-gray-100">
              
              {/* MY ORDERS */}
              <NavLink
                to={ROUTES.ORDERS}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-4 py-3.5 text-xs font-extrabold transition-colors group',
                    isActive ? 'text-primary-600 bg-blue-50/60' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag size={18} className="text-primary-600 flex-shrink-0" />
                  <span className="tracking-wider uppercase">MY ORDERS</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-primary-600" />
              </NavLink>

              {/* ACCOUNT SETTINGS Group */}
              <div className="py-2">
                <div className="px-4 py-2 flex items-center gap-3 text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  <User size={18} className="text-primary-600 flex-shrink-0" />
                  <span>ACCOUNT SETTINGS</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  <NavLink
                    to={ROUTES.PROFILE}
                    end
                    className={({ isActive }) =>
                      cn(
                        'block pl-11 pr-4 py-2 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-blue-50/80 text-primary-600 font-extrabold border-l-4 border-primary-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      )
                    }
                  >
                    Profile Information
                  </NavLink>
                  <NavLink
                    to={ROUTES.ADDRESSES}
                    className={({ isActive }) =>
                      cn(
                        'block pl-11 pr-4 py-2 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-blue-50/80 text-primary-600 font-extrabold border-l-4 border-primary-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      )
                    }
                  >
                    Manage Addresses
                  </NavLink>
                </div>
              </div>

              {/* MY WISHLIST */}
              <NavLink
                to={ROUTES.WISHLIST}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-4 py-3.5 text-xs font-extrabold transition-colors group',
                    isActive ? 'text-primary-600 bg-blue-50/60' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <Heart size={18} className="text-primary-600 flex-shrink-0" />
                  <span className="tracking-wider uppercase">MY WISHLIST</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-primary-600" />
              </NavLink>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                aria-label="Logout"
                className="w-full flex items-center gap-3 px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut size={18} className="text-red-600 flex-shrink-0" />
                <span>LOGOUT</span>
              </button>
            </div>
          </aside>

          {/* Right Main Content Panel */}
          <main className="lg:col-span-8 xl:col-span-9 min-w-0">
            <Outlet />
          </main>

        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;
