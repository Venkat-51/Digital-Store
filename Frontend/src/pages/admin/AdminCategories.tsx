import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { categoriesService } from '@/services/categories.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Loader';

const AdminCategories: React.FC = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: categoriesService.getAll,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-900">Categories</h1>
        <Button variant="primary" size="sm" leftIcon={<Plus size={16} />}>Add Category</Button>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Category', 'Slug', 'Products', 'Actions'].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 4 }).map((_, j) => <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-full" /></td>)}</tr>
                ))
              : (categories ?? []).map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-4 font-bold text-gray-900">{cat.name}</td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{cat.slug}</td>
                    <td className="px-5 py-4 text-gray-700">{cat.product_count ?? '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit size={14} /></button>
                        <button className="p-1.5 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg"><Trash2 size={14} /></button>
                      </div>
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

export default AdminCategories;
