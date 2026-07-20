import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import ProductGrid from '@/components/product/ProductGrid';
import { Breadcrumb, Pagination } from '@/components/ui/Navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { SORT_OPTIONS, CONFIG } from '@/constants/config';
import type { ProductFilters } from '@/types/product.types';
import { cn } from '@/utils/helpers';

const PRICE_RANGES = [
  { label: 'All Prices', min: undefined, max: undefined },
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 – $100', min: 50, max: 100 },
  { label: '$100 – $200', min: 100, max: 200 },
  { label: '$200 – $500', min: 200, max: 500 },
  { label: 'Over $500', min: 500, max: undefined },
];

const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const page = Number(searchParams.get('page') ?? '1');
  const ordering = searchParams.get('ordering') ?? '';
  const category = searchParams.get('category') ?? '';
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');
  const inStock = searchParams.get('in_stock');

  const filters: ProductFilters = {
    page,
    page_size: CONFIG.PRODUCTS_PER_PAGE,
    ...(ordering && { ordering }),
    ...(category && { category }),
    ...(minPrice && { min_price: Number(minPrice) }),
    ...(maxPrice && { max_price: Number(maxPrice) }),
    ...(inStock === 'true' && { in_stock: true }),
  };

  const { data, isLoading, error } = useProducts(filters);

  const updateParam = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});

  const totalPages = data ? Math.ceil(data.count / CONFIG.PRODUCTS_PER_PAGE) : 0;
  const hasFilters = !!(ordering || category || minPrice || maxPrice || inStock);

  const FilterSidebar = () => (
    <aside className="w-64 flex-shrink-0 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Filters</h2>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-primary-600 font-semibold hover:text-primary-700">
            Clear all
          </button>
        )}
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">Price Range</h3>
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => {
            const isSelected =
              (minPrice === String(range.min ?? '')) &&
              (maxPrice === String(range.max ?? ''));
            return (
              <button
                key={range.label}
                onClick={() => {
                  updateParam('min_price', range.min !== undefined ? String(range.min) : undefined);
                  updateParam('max_price', range.max !== undefined ? String(range.max) : undefined);
                }}
                className={cn(
                  'w-full text-left text-sm py-2 px-3 rounded-xl transition-colors font-medium',
                  isSelected ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100',
                )}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">Availability</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock === 'true'}
            onChange={(e) => updateParam('in_stock', e.target.checked ? 'true' : undefined)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700">In Stock Only</span>
        </label>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="container-wide">
          <Breadcrumb items={[{ label: 'Shop' }]} />
          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900">All Products</h1>
              {data && (
                <p className="text-sm text-gray-500 mt-1">
                  {data.count} {data.count === 1 ? 'product' : 'products'} found
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Sort */}
              <select
                value={ordering}
                onChange={(e) => updateParam('ordering', e.target.value || undefined)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="">Sort by: Default</option>
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Mobile filter toggle */}
              <Button
                variant="outline"
                size="sm"
                leftIcon={<SlidersHorizontal size={16} />}
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden"
              >
                Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="flex gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <div className="card p-5 sticky top-24">
              <FilterSidebar />
            </div>
          </div>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="text-xs font-semibold text-gray-500">Active filters:</span>
                {inStock === 'true' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                    In Stock <button onClick={() => updateParam('in_stock', undefined)}><X size={12} /></button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                    Price filter
                    <button onClick={() => { updateParam('min_price', undefined); updateParam('max_price', undefined); }}>
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}

            <ProductGrid
              products={data?.results ?? []}
              isLoading={isLoading}
              columns={4}
            />

            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', String(p));
                    setSearchParams(params);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsFilterOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setIsFilterOpen(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <FilterSidebar />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
