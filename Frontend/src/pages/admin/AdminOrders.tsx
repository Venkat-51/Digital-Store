import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { ordersService } from '@/services/orders.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Loader';
import { Pagination } from '@/components/ui/Navigation';
import { formatDate } from '@/utils/formatters';

const AdminOrders: React.FC = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_ORDERS, { page, status }],
    queryFn: () => ordersService.getAll({ page, ...(status && { status }) }),
  });

  const totalPages = data ? Math.ceil(data.count / 10) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-900">Orders</h1>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="">All Statuses</option>
          {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Order #', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                : (data?.results ?? []).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-4 font-bold text-primary-600">#{order.order_number}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">{order.customer?.first_name} {order.customer?.last_name}</p>
                        <p className="text-xs text-gray-400">{order.customer?.email}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{formatDate(order.created_at)}</td>
                      <td className="px-5 py-4 text-gray-700">{order.items.length}</td>
                      <td className="px-5 py-4 font-bold text-gray-900">S${order.total}</td>
                      <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                      <td className="px-5 py-4">
                        <select
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                          defaultValue={order.status}
                          onChange={(e) => ordersService.updateStatus(order.id, e.target.value)}
                        >
                          {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
};

export default AdminOrders;
