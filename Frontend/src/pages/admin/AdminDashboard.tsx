import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Users, Package, DollarSign, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { dashboardService } from '@/services/dashboard.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { Skeleton } from '@/components/ui/Loader';

const PIE_COLORS = ['#2563eb', '#f97316', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_STATS],
    queryFn: dashboardService.getAdminStats,
  });

  const STAT_CARDS = [
    { label: 'Total Revenue', value: stats ? `S$${stats.total_revenue}` : '—', icon: <DollarSign size={20} />, color: 'bg-primary-50 text-primary-600', change: '+12%' },
    { label: 'Total Orders', value: stats?.total_orders ?? '—', icon: <ShoppingBag size={20} />, color: 'bg-secondary-50 text-secondary-600', change: '+8%' },
    { label: 'Customers', value: stats?.total_customers ?? '—', icon: <Users size={20} />, color: 'bg-green-50 text-green-600', change: '+5%' },
    { label: 'Products', value: stats?.total_products ?? '—', icon: <Package size={20} />, color: 'bg-purple-50 text-purple-600', change: '+2%' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center`}>
                {card.icon}
              </div>
              <span className="flex items-center gap-0.5 text-xs font-bold text-success-600">
                <ArrowUpRight size={12} />{card.change}
              </span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-2/3 mb-1" />
            ) : (
              <p className="text-2xl font-black text-gray-900">{card.value}</p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-bold text-gray-900 mb-5">Revenue Overview</h2>
          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats?.recent_orders ?? []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontSize: '13px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#colorRev)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order Status Pie */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-5">Order Status</h2>
          {isLoading ? (
            <Skeleton className="h-56 w-full rounded-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats?.order_status_breakdown ?? []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                >
                  {(stats?.order_status_breakdown ?? []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend formatter={(v) => <span className="text-xs capitalize">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Top Selling Products</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {(stats?.top_products ?? []).slice(0, 5).map((product, i) => (
            <div key={product.name} className="flex items-center gap-4 px-6 py-4">
              <span className="w-6 text-sm font-black text-gray-300">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full"
                    style={{ width: `${Math.min((product.sales / ((stats?.top_products?.[0]?.sales ?? 1) || 1)) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-700 w-8 text-right">{product.sales}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
