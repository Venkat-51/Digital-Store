import React, { useState } from 'react';
import ProductCard from './ProductCard';
import type { Product } from '@/types/product.types';
import { cn } from '@/utils/helpers';
import { GridSkeleton } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/States';
import { LayoutGrid, List } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4;
  onQuickView?: (product: Product) => void;
  emptyMessage?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  columns = 4,
  onQuickView,
  emptyMessage = 'No products found.',
}) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns];

  if (isLoading) return <GridSkeleton count={columns * 2} cols={columns} />;

  if (!products.length) {
    return (
      <EmptyState
        title="No products found"
        description={emptyMessage}
      />
    );
  }

  return (
    <div>
      {/* View toggle */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <button
          onClick={() => setView('grid')}
          className={cn('p-2 rounded-lg transition-colors', view === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600')}
          aria-label="Grid view"
        >
          <LayoutGrid size={16} />
        </button>
        <button
          onClick={() => setView('list')}
          className={cn('p-2 rounded-lg transition-colors', view === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600')}
          aria-label="List view"
        >
          <List size={16} />
        </button>
      </div>

      <div
        className={cn(
          'grid gap-4',
          view === 'grid' ? gridCols : 'grid-cols-1',
        )}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={onQuickView}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
