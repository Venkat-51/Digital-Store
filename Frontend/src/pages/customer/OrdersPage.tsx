import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { ordersService } from '@/services/orders.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/States';
import { formatDate } from '@/utils/formatters';

const OrdersPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ORDERS],
    queryFn: () => ordersService.getAll(),
  });

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h1 className="text-xl font-black text-gray-900">My Orders</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" rounded="rounded-2xl" />)}
        </div>
      ) : !data?.results?.length ? (
        <EmptyState
          icon={<Package size={32} />}
          title="No orders yet"
          description="Your orders will appear here after you make a purchase."
          action={{ label: 'Start Shopping', onClick: () => window.location.href = '/shop' }}
        />
      ) : (
        <div className="space-y-3">
          {data.results.map((order) => (
            <Link
              key={order.id}
              to={`/account/orders/${order.order_number}`}
              className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-card-hover transition-shadow"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 flex-shrink-0">
                <Package size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-gray-900">#{order.order_number}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm text-gray-400 mt-0.5">
                  {formatDate(order.created_at)} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-lg font-black text-gray-900">S${order.total}</p>
                <ArrowRight size={16} className="text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
