import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '@/services/categories.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { NAV_CATEGORIES } from '@/constants/config';
import { cn } from '@/utils/helpers';

const HorizontalCategoryBar: React.FC = () => {
  const { pathname } = useLocation();
  const { data: categories } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: categoriesService.getAll,
    staleTime: 10 * 60 * 1000,
  });

  const displayCategories = (categories && categories.length > 0 ? categories : NAV_CATEGORIES.map((c) => ({ ...c, id: c.slug }))).slice(0, 8);

  return (
    <div className="w-full bg-white border-b border-gray-100 sticky top-16 z-30 overflow-hidden">
      <div className="container-wide py-3">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-1">
          <Link
            to="/shop"
            className={cn(
              "flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors",
              pathname === '/shop' || pathname === '/'
                ? "bg-primary-600 text-white shadow-md"
                : "bg-gray-50 text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200"
            )}
          >
            All Products
          </Link>
          {displayCategories.map((cat) => {
            const isActive = pathname === `/categories/${cat.slug}`;
            return (
              <Link
                key={cat.slug}
                to={`/categories/${cat.slug}`}
                className={cn(
                  "flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-primary-600 text-white shadow-md"
                    : "bg-gray-50 text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200"
                )}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HorizontalCategoryBar;
