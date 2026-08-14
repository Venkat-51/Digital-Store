import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoriesService } from '@/services/categories.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { Breadcrumb } from '@/components/ui/Navigation';
import { Skeleton } from '@/components/ui/Loader';
import { Monitor, HardDrive, Gamepad2, Wifi, Briefcase, BatteryCharging } from 'lucide-react';
import { NAV_CATEGORIES } from '@/constants/config';

const ICONS: Record<string, React.ReactNode> = {
  'computer-accessories': <Monitor size={36} />,
  'data-storage':         <HardDrive size={36} />,
  'gaming':               <Gamepad2 size={36} />,
  'networking-wireless':  <Wifi size={36} />,
  'office-essentials':    <Briefcase size={36} />,
  'power-bank':           <BatteryCharging size={36} />,
};

// Removed multi-color gradients to adhere to 2-color aesthetic

const CategoriesPage: React.FC = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: categoriesService.getAll,
  });

  const display = categories && categories.length > 0 ? categories : NAV_CATEGORIES.map((c, i) => ({ ...c, id: i }));

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <div className="bg-white border-b border-gray-100 py-6 sm:py-10">
        <div className="container-wide">
          <Breadcrumb items={[{ label: 'Categories' }]} />
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 mt-2 sm:mt-4">All Categories</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Browse our wide selection of premium technology products.</p>
        </div>
      </div>

      <div className="container-wide py-6 sm:py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 sm:h-48 rounded-2xl sm:rounded-3xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {display.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Link
                  to={`/categories/${cat.slug}`}
                  className="group relative flex items-center gap-4 sm:gap-5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-primary-500 text-white overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10 group-hover:scale-105 transition-transform duration-300 text-primary-500">
                    <div className="scale-75 sm:scale-100">
                      {ICONS[cat.slug] ?? <Monitor size={36} />}
                    </div>
                  </div>
                  <div className="relative z-10 min-w-0 flex-1">
                    <h2 className="text-base sm:text-lg font-black truncate">{cat.name}</h2>
                    {(cat as { product_count?: number }).product_count !== undefined && (
                      <p className="text-white/80 text-xs sm:text-sm font-medium">{(cat as { product_count?: number }).product_count} products</p>
                    )}
                    {(cat as { description?: string }).description && (
                      <p className="text-white/60 text-xs mt-0.5 sm:mt-1 line-clamp-1">{(cat as { description?: string }).description}</p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
