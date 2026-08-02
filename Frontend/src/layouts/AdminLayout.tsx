import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PageLoader } from '@/components/ui/Loader';
import { LayoutDashboard, ShoppingBag, ShoppingCart, Users, LogOut, ArrowLeft, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/helpers';

const AdminLayout: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  // Guard access: User must be authenticated AND have staff permissions (or match admin email)
  if (!user || !user.is_staff) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  const navItems = [
    { label: 'Overview & Products', href: '/admin', icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-xl text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="font-black text-lg text-white tracking-wide">LEXICON</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 border border-primary-500/30">
                Admin Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft size={14} /> View Storefront
            </Link>
            <div className="h-4 w-[1px] bg-slate-700" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white">{user.full_name || user.username}</p>
                <p className="text-[10px] text-slate-400">{user.email}</p>
              </div>
              <button
                onClick={() => logout()}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
