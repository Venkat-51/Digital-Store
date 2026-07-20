import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, Heart, Clock, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { ordersService } from '@/services/orders.service';
import { useAuth } from '@/hooks/useAuth';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { ROUTES } from '@/constants/routes';
import { StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Loader';
import { formatDate } from '@/utils/formatters';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [QUERY_KEYS.PROFILE],
    queryFn: dashboardService.getCustomerStats,
  });
  const { data: orders } = useQuery({
    queryKey: [QUERY_KEYS.ORDERS],
    queryFn: () => ordersService.getAll({ page: 1 }),
  });

  const STAT_CARDS = [
    { icon: <ShoppingBag size={22} />, label: 'Total Orders', value: stats?.total_orders ?? 0, color: 'from-primary-500 to-primary-700', to: ROUTES.ORDERS },
    { icon: <DollarSign size={22} />, label: 'Total Spent', value: `$${stats?.total_spent ?? '0.00'}`, color: 'from-secondary-500 to-secondary-700', to: ROUTES.ORDERS },
    { icon: <Heart size={22} />, label: 'Wishlist Items', value: stats?.wishlist_count ?? 0, color: 'from-rose-500 to-rose-700', to: ROUTES.WISHLIST_ACCOUNT },
    { icon: <Clock size={22} />, label: 'Pending Orders', value: stats?.pending_orders ?? 0, color: 'from-yellow-500 to-yellow-700', to: ROUTES.ORDERS },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card p-6">
        <h1 className="text-2xl font-black text-gray-900">
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Here's an overview of your account.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link to={stat.to} className={`block p-5 rounded-2xl bg-gradient-to-br ${stat.color} text-white hover:shadow-lg transition-shadow`}>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                {stat.icon}
              </div>
              {statsLoading ? (
                <div className="h-8 bg-white/20 rounded-lg mb-1 animate-pulse" />
              ) : (
                <p className="text-2xl font-black">{stat.value}</p>
              )}
              <p className="text-white/80 text-sm">{stat.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <Link to={ROUTES.ORDERS} className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {!orders?.results?.length ? (
          <p className="text-center py-12 text-gray-400 text-sm">No orders yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.results.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.order_number}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">#{order.order_number}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)} · {order.items.length} items</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <p className="text-sm font-black text-gray-900">${order.total}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
