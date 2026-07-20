import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useFeaturedProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/product/ProductCard';
import { GridSkeleton } from '@/components/ui/Loader';
import { Modal } from '@/components/ui/Modal';
import type { Product } from '@/types/product.types';
import { ROUTES } from '@/constants/routes';
import { formatPrice } from '@/utils/formatters';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

const FeaturedProducts: React.FC = () => {
  const { data: products, isLoading } = useFeaturedProducts();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { addItem } = useCart();

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`);
    setQuickViewProduct(null);
  };

  return (
    <section className="section" aria-labelledby="featured-heading">
      <div className="container-wide">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-bold text-secondary-500 uppercase tracking-widest mb-2">Handpicked for you</p>
            <h2 id="featured-heading" className="text-4xl font-black text-gray-900 tracking-tight">
              Featured Products
            </h2>
          </div>
          <Link
            to={ROUTES.SHOP}
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {/* Grid */}
        {isLoading ? (
          <GridSkeleton count={8} cols={4} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(products ?? []).slice(0, 8).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <ProductCard
                  product={product}
                  onQuickView={setQuickViewProduct}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Mobile view all */}
        <div className="sm:hidden text-center mt-8">
          <Link to={ROUTES.SHOP} className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600">
            View all products <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Quick View Modal */}
      <Modal
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        title="Quick View"
        size="lg"
      >
        {quickViewProduct && (
          <div className="p-6 grid sm:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-6">
              <img
                src={quickViewProduct.thumbnail || '/placeholder-product.png'}
                alt={quickViewProduct.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{quickViewProduct.brand?.name}</p>
              <h3 className="text-xl font-black text-gray-900 mb-3">{quickViewProduct.name}</h3>
              {quickViewProduct.short_description && (
                <p className="text-sm text-gray-500 mb-4">{quickViewProduct.short_description}</p>
              )}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl font-black text-gray-900">{formatPrice(quickViewProduct.price)}</span>
                {quickViewProduct.compare_price && (
                  <span className="text-base text-gray-400 line-through">{formatPrice(quickViewProduct.compare_price)}</span>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Button variant="primary" size="lg" fullWidth onClick={() => handleAddToCart(quickViewProduct)}>
                  Add to Cart
                </Button>
                <Link to={`/products/${quickViewProduct.slug}`} onClick={() => setQuickViewProduct(null)}>
                  <Button variant="outline" size="lg" fullWidth>
                    View Full Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};

export default FeaturedProducts;
