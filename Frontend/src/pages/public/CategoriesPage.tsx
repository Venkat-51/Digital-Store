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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 py-10">
        <div className="container-wide">
          <Breadcrumb items={[{ label: 'Categories' }]} />
          <h1 className="text-4xl font-black text-gray-900 mt-4">All Categories</h1>
          <p className="text-gray-500 mt-2">Browse our wide selection of premium technology products.</p>
        </div>
      </div>

      <div className="container-wide py-12">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {display.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
              >
                <Link
                  to={`/categories/${cat.slug}`}
                  className="group relative flex items-center gap-5 p-6 rounded-3xl bg-primary-500 text-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Removed glass effect circles */}
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10 group-hover:scale-110 transition-transform duration-300 text-primary-500">
                    {ICONS[cat.slug] ?? <Monitor size={36} />}
                  </div>
                  <div className="relative z-10">
                    <h2 className="text-lg font-black">{cat.name}</h2>
                    {(cat as { product_count?: number }).product_count && (
                      <p className="text-white/70 text-sm">{(cat as { product_count?: number }).product_count} products</p>
                    )}
                    {(cat as { description?: string }).description && (
                      <p className="text-white/60 text-sm mt-1 line-clamp-1">{(cat as { description?: string }).description}</p>
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
