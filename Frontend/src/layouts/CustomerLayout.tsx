import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { PageLoader } from '@/components/ui/Loader';

const CustomerLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="container-wide">
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
