import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Mail, Phone, Calendar } from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Loader';
import { formatDate } from '@/utils/formatters';

const AdminCustomers: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_CUSTOMERS],
    queryFn: () => dashboardService.getCustomers(),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-900">Customers</h1>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Customer', 'Email', 'Phone', 'Joined', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-full" /></td>)}</tr>
                  ))
                : (data?.results ?? []).map((customer: any) => (
                    <tr key={customer.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold">
                            {customer.first_name?.[0]}
                          </div>
                          <span className="font-bold text-gray-900">{customer.first_name} {customer.last_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{customer.email}</td>
                      <td className="px-5 py-4 text-gray-500">{customer.phone ?? '—'}</td>
                      <td className="px-5 py-4 text-gray-500">{formatDate(customer.date_joined)}</td>
                      <td className="px-5 py-4">
                        <Badge variant={customer.is_active ? 'success' : 'gray'}>
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
