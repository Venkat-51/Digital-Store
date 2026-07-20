import React from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { Breadcrumb } from '@/components/ui/Navigation';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';
import { ROUTES } from '@/constants/routes';
import { formatPrice, getProductImage } from '@/utils/formatters';
import { Link } from 'react-router-dom';

const WishlistPage: React.FC = () => {
  const { items, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <EmptyState
          icon={<Heart size={32} />}
          title="Your wishlist is empty"
          description="Save your favourite products and come back to them later."
          action={{ label: 'Browse Products', onClick: () => window.location.href = ROUTES.SHOP }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="container-wide">
          <Breadcrumb items={[{ label: 'Wishlist' }]} />
          <h1 className="text-3xl font-black text-gray-900 mt-3">My Wishlist ({items.length})</h1>
        </div>
      </div>
      <div className="container-wide py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {items.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="card p-4 group"
              >
                <div className="relative mb-4">
                  <Link to={`/products/${product.slug}`}>
                    <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center">
                      <img src={getProductImage(product.images, product.thumbnail)} alt={product.name} className="max-h-full max-w-full object-contain p-4" />
                    </div>
                  </Link>
                  <button
                    onClick={() => { toggleWishlist(product); toast('Removed from wishlist', { icon: '💔' }); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-xl shadow-md flex items-center justify-center text-secondary-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                  {product.is_new && <div className="absolute top-3 left-3"><Badge variant="new">New</Badge></div>}
                </div>
                <p className="text-2xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{product.brand?.name}</p>
                <Link to={`/products/${product.slug}`} className="text-sm font-bold text-gray-900 hover:text-primary-600 line-clamp-2 mb-2">{product.name}</Link>
                <p className="text-base font-black text-gray-900 mb-3">{formatPrice(product.price)}</p>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  disabled={!product.is_in_stock}
                  onClick={() => { addItem(product, 1); toast.success('Added to cart!'); }}
                >
                  {product.is_in_stock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
