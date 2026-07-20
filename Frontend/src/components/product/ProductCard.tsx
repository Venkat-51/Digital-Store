import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helpers';
import { getProductImage, formatPrice, calcDiscount } from '@/utils/formatters';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import type { Product } from '@/types/product.types';
import { Badge } from '@/components/ui/Badge';
import { useProductImage } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView, className }) => {
  const { addItem, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);

  const inCart = isInCart(product.id);
  const inWishlist = isInWishlist(product.id);
  const discount = product.compare_price ? calcDiscount(product.price, product.compare_price) : 0;
  
  // Lazily fetch the image from the backend
  const { data: imageData, isLoading: isImageLoading } = useProductImage(product.id);
  const image = imageData?.image_url || getProductImage(product.images, product.thumbnail);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.is_in_stock) return;
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    toast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist ♥', {
      icon: inWishlist ? '💔' : '❤️',
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  return (
    <motion.article
      className={cn('card card-hover group relative overflow-hidden', className)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link to={`/products/${product.slug}`} aria-label={product.name}>
        {/* Image */}
        <div className="product-image-wrapper bg-gray-50 relative">
          {isImageLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <motion.img
              src={image}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_new && <Badge variant="new">New</Badge>}
            {product.is_sale && discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
            {!product.is_in_stock && <Badge variant="gray">Out of Stock</Badge>}
          </div>

          {/* Hover actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute top-3 right-3 flex flex-col gap-2"
          >
            {/* Wishlist */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleWishlist}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-all',
                inWishlist
                  ? 'bg-secondary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-secondary-50 hover:text-secondary-500',
              )}
            >
              <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
            </motion.button>

            {/* Quick View */}
            {onQuickView && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleQuickView}
                aria-label="Quick view"
                className="w-9 h-9 rounded-xl bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600 flex items-center justify-center shadow-md transition-all"
              >
                <Eye size={16} />
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Brand */}
          <p className="text-2xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            {product.brand?.name}
          </p>

          {/* Name */}
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <Star size={12} fill="#f97316" className="text-secondary-500" />
              <span className="text-xs font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({product.review_count})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-black text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price) && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToCart}
            disabled={!product.is_in_stock}
            className={cn(
              'w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2',
              'transition-all duration-200',
              inCart
                ? 'bg-success-500 text-white'
                : product.is_in_stock
                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed',
            )}
          >
            <ShoppingCart size={15} />
            {inCart ? 'In Cart' : product.is_in_stock ? 'Add to Cart' : 'Out of Stock'}
          </motion.button>
        </div>
      </Link>
    </motion.article>
  );
};

export default ProductCard;
