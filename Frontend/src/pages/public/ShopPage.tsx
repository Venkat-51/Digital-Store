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

  const currentMin = minPrice ? Number(minPrice) : undefined;
  const currentMax = maxPrice ? Number(maxPrice) : undefined;

  const isRangeActive = (range: typeof PRICE_RANGES[0]) => {
    return range.min === currentMin && range.max === currentMax;
  };

  const handlePriceRangeClick = (range: typeof PRICE_RANGES[0]) => {
    const params = new URLSearchParams(searchParams);
    if (range.min !== undefined) {
      params.set('min_price', String(range.min));
    } else {
      params.delete('min_price');
    }
    if (range.max !== undefined) {
      params.set('max_price', String(range.max));
    } else {
      params.delete('max_price');
    }
    params.delete('page');
    setSearchParams(params);
  };

  const updateParam = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (ordering) params.set('ordering', ordering);
    setSearchParams(params);
  };

  const rawProducts = data?.results ?? [];

  const displayProducts = React.useMemo(() => {
    let list = [...rawProducts];

    if (minPrice) {
      const minP = Number(minPrice);
      list = list.filter((p) => parseFloat(p.price) >= minP);
    }
    if (maxPrice) {
      const maxP = Number(maxPrice);
      list = list.filter((p) => parseFloat(p.price) <= maxP);
    }
    if (inStock === 'true') {
      list = list.filter((p) => p.is_in_stock || p.stock > 0);
    }
    if (category && category.toLowerCase() !== 'all') {
      const catLower = category.toLowerCase();
      list = list.filter(
        (p) =>
          p.category?.slug.toLowerCase() === catLower ||
          p.category?.name.toLowerCase() === catLower
      );
    }

    return list;
  }, [rawProducts, minPrice, maxPrice, inStock, category]);

  const totalPages = Math.max(1, Math.ceil(displayProducts.length / CONFIG.PRODUCTS_PER_PAGE));
  const hasFilters = !!(category || minPrice || maxPrice || inStock === 'true');

  const FilterSidebar = () => (
    <aside className="w-full space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="text-base font-extrabold text-gray-900">Filters</h2>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">Price Range</h3>
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => {
            const active = isRangeActive(range);
            return (
              <button
                key={range.label}
                onClick={() => handlePriceRangeClick(range)}
                className={cn(
                  'w-full text-left text-sm py-2.5 px-3.5 rounded-xl transition-all font-medium flex items-center justify-between',
                  active
                    ? 'bg-primary-50 text-primary-700 font-bold shadow-2xs'
                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900',
                )}
              >
                <span>{range.label}</span>
                {active && <span className="w-2 h-2 rounded-full bg-primary-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability */}
      <div className="pt-2 border-t border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Availability</h3>
        <label className="flex items-center gap-3 cursor-pointer py-1.5 px-1 select-none">
          <input
            type="checkbox"
            checked={inStock === 'true'}
            onChange={(e) => updateParam('in_stock', e.target.checked ? 'true' : undefined)}
            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
          />
          <span className="text-sm font-semibold text-gray-800">In Stock Only</span>
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
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">All Products</h1>
              {data && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {displayProducts.length} {displayProducts.length === 1 ? 'product' : 'products'} found
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Sort */}
              <select
                value={ordering}
                onChange={(e) => updateParam('ordering', e.target.value || undefined)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
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
                leftIcon={<SlidersHorizontal size={14} />}
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex-shrink-0 text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl"
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
          <div className="hidden lg:block w-64 flex-shrink-0">
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
                {category && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium capitalize">
                    Category: {category}
                    <button onClick={() => updateParam('category', undefined)}><X size={12} /></button>
                  </span>
                )}
              </div>
            )}

            <ProductGrid
              products={displayProducts}
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsFilterOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white p-6 overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">Filters</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close filters"
              >
                <X size={20} />
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
