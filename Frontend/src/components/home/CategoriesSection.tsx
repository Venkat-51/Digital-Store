import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Monitor, HardDrive, Gamepad2, Wifi, Briefcase, BatteryCharging, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '@/services/categories.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { NAV_CATEGORIES } from '@/constants/config';

const FALLBACK_ICONS: Record<string, React.ReactNode> = {
  'computer-accessories': <Monitor size={28} />,
  'data-storage':         <HardDrive size={28} />,
  'gaming':               <Gamepad2 size={28} />,
  'networking-wireless':  <Wifi size={28} />,
  'office-essentials':    <Briefcase size={28} />,
  'power-bank':           <BatteryCharging size={28} />,
};

const GRADIENT_COLORS = [
  'from-blue-500 to-blue-700',
  'from-purple-500 to-purple-700',
  'from-orange-500 to-orange-700',
  'from-teal-500 to-teal-700',
  'from-indigo-500 to-indigo-700',
  'from-rose-500 to-rose-700',
];

const CategoriesSection: React.FC = () => {
  const { data: categories } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: categoriesService.getAll,
    staleTime: 10 * 60 * 1000,
  });

  const displayCategories = (categories && categories.length > 0 ? categories : NAV_CATEGORIES.map((c) => ({ ...c, id: c.slug }))).slice(0, 6);

  return (
    <section className="section bg-gray-50" aria-labelledby="categories-heading">
      <div className="container-wide">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-2">What we offer</p>
            <h2 id="categories-heading" className="text-4xl font-black text-gray-900 tracking-tight">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/categories"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayCategories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
            >
              <Link
                to={`/categories/${cat.slug}`}
                className="group flex flex-col items-center text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.08, rotate: -3 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${GRADIENT_COLORS[i % GRADIENT_COLORS.length]} flex items-center justify-center text-white shadow-lg mb-4 transition-shadow group-hover:shadow-xl`}
                >
                  {FALLBACK_ICONS[cat.slug] ?? <Monitor size={28} />}
                </motion.div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-primary-600 transition-colors text-center leading-tight">
                  {cat.name}
                </span>
                {(cat as { product_count?: number }).product_count && (
                  <span className="text-xs text-gray-400 mt-0.5">
                    {(cat as { product_count?: number }).product_count} items
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="sm:hidden text-center mt-8">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600"
          >
            View all categories <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
