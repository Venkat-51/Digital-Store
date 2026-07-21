import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/formatters';
import confetti from 'canvas-confetti';

const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { data: order } = useQuery({
    queryKey: QUERY_KEYS.ORDER(orderNumber!),
    queryFn: () => ordersService.getByOrderNumber(orderNumber!),
    enabled: !!orderNumber,
  });

  React.useEffect(() => {
    // Fire confetti
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#2563eb', '#f97316', '#22c55e'] });
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="max-w-lg w-full text-center"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
        >
          <CheckCircle size={48} className="text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-black text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-6">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>

          {/* Order number */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 mb-6 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Package size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Order Number</p>
                <p className="text-lg font-black text-gray-900">#{orderNumber}</p>
              </div>
            </div>
            {order && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Date</p>
                  <p className="font-semibold text-gray-700">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Total</p>
                  <p className="font-semibold text-gray-700">${order.total}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Status</p>
                  <p className="font-semibold text-success-600 capitalize">{order.status}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Items</p>
                  <p className="font-semibold text-gray-700">{order.items.length} items</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={<Package size={18} />}
              onClick={() => window.location.href = ROUTES.ORDERS}
            >
              Track My Order
            </Button>

            <Link to={ROUTES.SHOP}>
              <Button variant="ghost" size="md" fullWidth rightIcon={<ArrowRight size={16} />}>
                Continue Shopping
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrderSuccessPage;
