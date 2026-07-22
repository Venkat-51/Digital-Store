import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCart } from '@/hooks/useCart';
import { Breadcrumb, Pagination } from '@/components/ui/Navigation';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { ROUTES } from '@/constants/routes';
import { formatPrice } from '@/utils/formatters';

const CartPage: React.FC = () => {
  const { items, subtotal, removeItem, updateQuantity, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <EmptyState
          icon={<ShoppingBag size={32} />}
          title="Your cart is empty"
          description="Discover our amazing products and start shopping."
          action={{ label: 'Shop Now', onClick: () => window.location.href = ROUTES.SHOP }}
        />
      </div>
    );
  }

  const shipping = parseFloat(subtotal.replace('$', '')) >= 80 ? 0 : 5.99;
  const subtotalNum = parseFloat(subtotal.replace('$', ''));
  const total = subtotalNum + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="container-wide">
          <Breadcrumb items={[{ label: 'Cart' }]} />
          <div className="flex items-center justify-between mt-3 gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Shopping Cart ({items.length})</h1>
            <button onClick={() => { clearCart(); toast.success('Cart cleared'); }} className="text-xs sm:text-sm font-semibold text-danger-600 hover:text-danger-700 flex items-center gap-1.5 flex-shrink-0">
              <Trash2 size={14} /> Clear Cart
            </button>
          </div>
        </div>
      </div>

      <div className="container-wide py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="card p-3 sm:p-5 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto flex-1 min-w-0">
                    <Link to={`/products/${item.product.slug}`} className="flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden">
                      <img src={item.product.thumbnail || '/placeholder-product.png'} alt={item.product.name} className="w-full h-full object-contain p-2" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-2xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">{item.product.brand?.name}</p>
                      <Link to={`/products/${item.product.slug}`} className="text-xs sm:text-base font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">{item.product.name}</Link>
                      <p className="text-xs sm:text-sm font-bold text-primary-600 mt-0.5 sm:mt-1">{formatPrice(item.unit_price)}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="sm:hidden text-gray-300 hover:text-danger-500 transition-colors p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2.5 sm:px-3 py-1 sm:py-2 hover:bg-gray-100 text-xs sm:text-sm">−</button>
                      <span className="px-3 sm:px-4 text-xs sm:text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2.5 sm:px-3 py-1 sm:py-2 hover:bg-gray-100 text-xs sm:text-sm">+</button>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm sm:text-base font-black text-gray-900">{formatPrice(item.total_price)}</p>
                      <button onClick={() => removeItem(item.id)} className="hidden sm:block text-gray-300 hover:text-danger-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="card p-5 h-fit sticky top-24">
            <h2 className="text-base font-bold text-gray-900 mb-5">Order Summary</h2>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-900">{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-semibold">{shipping === 0 ? <span className="text-success-600">Free</span> : `${shipping.toFixed(2)}`}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-base">
                <span>Total</span>
                <span className="text-primary-600">${total.toFixed(2)}</span>
              </div>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-gray-400 text-center mb-4">Add ${(80 - subtotalNum).toFixed(2)} more for free shipping</p>
            )}
            <Link to={ROUTES.CHECKOUT}>
              <Button variant="primary" size="lg" fullWidth rightIcon={<ArrowRight size={16} />}>
                Proceed to Checkout
              </Button>
            </Link>
            <Link to={ROUTES.SHOP}>
              <Button variant="ghost" size="md" fullWidth className="mt-3">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
