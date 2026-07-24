import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Package, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/helpers';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  to: string;
  isActive: boolean;
}

export const BottomNav: React.FC = () => {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      to: ROUTES.HOME,
      isActive: pathname === ROUTES.HOME,
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: LayoutGrid,
      to: ROUTES.SHOP,
      isActive: pathname === ROUTES.SHOP || pathname.startsWith('/categories'),
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: Package,
      to: isAuthenticated ? ROUTES.ORDERS : ROUTES.LOGIN,
      isActive: pathname.startsWith('/account/orders'),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      to: isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN,
      isActive: pathname.startsWith('/account/profile') || (pathname.startsWith('/account') && !pathname.startsWith('/account/orders')) || pathname === ROUTES.LOGIN,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 py-1.5 px-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive: navActive }) => {
                const active = item.isActive || navActive;
                return cn(
                  'flex flex-col items-center justify-center w-16 py-1 transition-all relative active:scale-95',
                  active ? 'text-primary-600 font-bold' : 'text-gray-500 hover:text-gray-900 font-semibold'
                );
              }}
            >
              {({ isActive: navActive }) => {
                const active = item.isActive || navActive;
                return (
                  <>
                    <Icon size={22} className={cn('transition-all', active ? 'stroke-[2.4px] text-primary-600' : 'stroke-[1.8px]')} />
                    <span className={cn('text-[11px] mt-1 tracking-tight', active ? 'font-extrabold text-primary-600' : 'font-semibold text-gray-500')}>
                      {item.label}
                    </span>
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
