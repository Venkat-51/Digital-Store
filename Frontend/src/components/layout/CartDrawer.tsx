import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/States';
import { ROUTES } from '@/constants/routes';
import { getProductImage } from '@/utils/formatters';

const CartDrawer: React.FC = () => {
  const { isOpen, closeCart, items, itemCount, subtotal, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate(ROUTES.CHECKOUT);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative ml-auto w-full max-w-md bg-white h-full flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <ShoppingCart size={20} className="text-primary-600" />
                <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
                {itemCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4">
              {items.length === 0 ? (
                <EmptyState
                  icon={<ShoppingBag size={32} />}
                  title="Your cart is empty"
                  description="Browse our products and add something to your cart."
                  action={{ label: 'Start Shopping', onClick: () => { closeCart(); navigate(ROUTES.SHOP); } }}
                />
              ) : (
                <ul className="divide-y divide-gray-50">
                  {items.map((item) => (
                    <motion.li
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      className="flex gap-4 px-6 py-4"
                    >
                      {/* Image */}
                      <Link
                        to={`/products/${item.product.slug}`}
                        onClick={closeCart}
                        className="flex-shrink-0 w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100"
                      >
                        <img
                          src={getProductImage(item.product.images, item.product.thumbnail)}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.product.slug}`}
                          onClick={closeCart}
                          className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">{item.product.brand?.name}</p>
                        <p className="text-sm font-bold text-primary-600 mt-1">
                          S${parseFloat(item.unit_price).toFixed(2)}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Subtotal */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">
                              S${parseFloat(item.total_price).toFixed(2)}
                            </span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 text-gray-300 hover:text-danger-500 transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 font-medium">Subtotal</span>
                  <span className="text-xl font-black text-gray-900">{subtotal}</span>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Shipping and taxes calculated at checkout
                </p>
                <Button variant="primary" size="lg" fullWidth onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
                <Button variant="ghost" size="md" fullWidth onClick={() => { closeCart(); navigate(ROUTES.CART); }}>
                  View Full Cart
                </Button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default CartDrawer;
