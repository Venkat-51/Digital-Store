import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { productsService } from '@/services/products.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { Button } from '@/components/ui/Button';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Navigation';
import { formatPrice, getProductImage } from '@/utils/formatters';
import toast from 'react-hot-toast';
import type { Product } from '@/types/product.types';
import { CONFIG } from '@/constants/config';

const AdminProducts: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_PRODUCTS, { page, search }],
    queryFn: () => productsService.getAll({ page, page_size: 20, search }),
  });

  const { mutate: deleteProduct } = useMutation({
    mutationFn: productsService.delete,
    onSuccess: () => { toast.success('Product deleted.'); qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_PRODUCTS] }); },
    onError: () => toast.error('Failed to delete product.'),
  });

  const totalPages = data ? Math.ceil(data.count / 20) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Products</h1>
          {data && <p className="text-sm text-gray-400">{data.count} total products</p>}
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={16} />}>
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Product', 'SKU', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : !data?.results.length ? (
                <tr><td colSpan={6} className="py-16 text-center text-gray-400 text-sm">No products found.</td></tr>
              ) : (
                data.results.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={getProductImage(product.images, product.thumbnail)} alt={product.name} className="w-full h-full object-contain p-1.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate max-w-[200px]">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.brand?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 font-mono text-xs">{product.sku}</td>
                    <td className="px-5 py-4 font-bold text-gray-900">{formatPrice(product.price)}</td>
                    <td className="px-5 py-4">
                      <span className={product.stock > 0 ? 'text-success-600 font-bold' : 'text-danger-600 font-bold'}>{product.stock}</span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={product.is_in_stock ? 'success' : 'danger'}>
                        {product.is_in_stock ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => { if (confirm(`Delete "${product.name}"?`)) deleteProduct(product.id); }}
                          className="p-1.5 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
};

export default AdminProducts;
