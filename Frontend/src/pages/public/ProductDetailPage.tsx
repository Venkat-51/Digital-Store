import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, Minus, Plus, Star, Truck, Shield, RefreshCw, ZoomIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProduct, useRelatedProducts, useProductImage } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { Breadcrumb } from '@/components/ui/Navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Loader';
import { ErrorState } from '@/components/ui/States';
import ProductGrid from '@/components/product/ProductGrid';
import { formatPrice } from '@/utils/formatters';
import { cn } from '@/utils/helpers';
import { calcDiscount } from '@/utils/formatters';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug!);
  const { data: related } = useRelatedProducts(product?.id ?? 0);
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description');

  const { data: imageData, isLoading: isImageLoading } = useProductImage(product?.id ?? 0);

  if (isLoading) {
    return (
      <div className="container-wide py-10">
        <div className="grid lg:grid-cols-2 gap-10">
          <Skeleton className="w-full aspect-square" rounded="rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return <ErrorState message="Product not found." />;
  }

  const fetchedImage = imageData?.image_url;
  const images = fetchedImage ? [{ id: 0, image: fetchedImage, is_primary: true, order: 0 }] : (product.images?.length > 0 ? product.images : [{ id: 0, image: '/placeholder-product.png', is_primary: true, order: 0 }]);
  const discount = product.compare_price ? calcDiscount(product.price, product.compare_price) : 0;
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100 py-4">
        <div className="container-wide">
          <Breadcrumb
            items={[
              { label: 'Shop', href: '/shop' },
              { label: product.category?.name, href: `/categories/${product.category?.slug}` },
              { label: product.name },
            ]}
          />
        </div>
      </div>

      <div className="container-wide py-10">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-gray-50 rounded-3xl overflow-hidden aspect-square group">
              <AnimatePresence mode="wait">
                {isImageLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <motion.img
                    key={selectedImage}
                    src={images[selectedImage]?.image}
                    alt={`${product.name} - view ${selectedImage + 1}`}
                    className="w-full h-full object-contain p-8"
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  />
                )}
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_new && <Badge variant="new">New</Badge>}
                {discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
              </div>

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((p) => (p - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={18} className="text-gray-700" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((p) => (p + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={18} className="text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all',
                      selectedImage === i ? 'border-primary-600 shadow-glow/30' : 'border-transparent hover:border-gray-300',
                    )}
                  >
                    <img src={img.image} alt="" className="w-full h-full object-contain p-2 bg-gray-50" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">{product.brand?.name}</p>
            <h1 className="text-3xl font-black text-gray-900 mb-4 leading-tight">{product.name}</h1>
            
            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={cn('transition-colors', i < Math.round(product.rating!) ? 'text-secondary-500 fill-current' : 'text-gray-300')}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({product.review_count} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl font-black text-gray-900">{formatPrice(product.price)}</span>
              {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price) && (
                <>
                  <span className="text-xl text-gray-400 line-through">{formatPrice(product.compare_price)}</span>
                  <Badge variant="sale">Save {discount}%</Badge>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <div className={cn('w-2 h-2 rounded-full', product.is_in_stock ? 'bg-success-500' : 'bg-danger-500')} />
              <span className={cn('text-sm font-semibold', product.is_in_stock ? 'text-success-600' : 'text-danger-600')}>
                {product.is_in_stock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{product.short_description}</p>
            )}

            {/* Quantity */}
            {product.is_in_stock && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-bold text-gray-700">Quantity</span>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2.5 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 text-sm font-bold text-gray-900 min-w-[2.5rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-2.5 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<ShoppingCart size={18} />}
                onClick={handleAddToCart}
                disabled={!product.is_in_stock}
                className="flex-1"
              >
                {product.is_in_stock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button
                variant={inWishlist ? 'secondary' : 'outline'}
                size="lg"
                leftIcon={<Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />}
                onClick={() => {
                  toggleWishlist(product);
                  toast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist!', { icon: inWishlist ? '💔' : '❤️' });
                }}
              >
                {inWishlist ? 'Wishlisted' : 'Wishlist'}
              </Button>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl">
              {[
                { icon: <Truck size={18} />, label: 'Free shipping over $80' },
                { icon: <Shield size={18} />, label: '1-Year warranty' },
                { icon: <RefreshCw size={18} />, label: '30-day returns' },
              ].map((perk) => (
                <div key={perk.label} className="flex flex-col items-center text-center gap-1.5">
                  <span className="text-primary-600">{perk.icon}</span>
                  <span className="text-2xs font-semibold text-gray-500">{perk.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs — Description / Specs */}
        <div className="mb-16">
          <div className="flex gap-1 border-b border-gray-100 mb-6">
            {(['description', 'specs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-5 py-3 text-sm font-bold capitalize transition-colors border-b-2 -mb-px',
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700',
                )}
              >
                {tab === 'specs' ? 'Specifications' : 'Description'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'description' ? (
              <motion.div key="desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </motion.div>
            ) : (
              <motion.div key="specs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {product.specifications && product.specifications.length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr key={spec.id} className={cn('border-b border-gray-50', i % 2 === 0 ? 'bg-gray-50/50' : '')}>
                          <td className="py-3 px-4 font-semibold text-gray-700 w-1/3">{spec.name}</td>
                          <td className="py-3 px-4 text-gray-600">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 text-sm">No specifications available.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Related Products */}
        {related && related.length > 0 && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-6">Related Products</h2>
            <ProductGrid products={related} columns={4} />
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetailPage;
