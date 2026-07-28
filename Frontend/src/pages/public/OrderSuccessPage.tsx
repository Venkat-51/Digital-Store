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
    // Scroll to top of the page
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Fire confetti
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#2563eb', '#f97316', '#22c55e'] });
  }, []);

  // Auto-trigger WhatsApp invoice sending when order is loaded
  const hasTriggeredRef = React.useRef(false);
  React.useEffect(() => {
    if (order && orderNumber && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      const targetPhone = "919500882090";
      const itemsSummary = order.items?.map(i => `${i.product_name || i.product?.name} (x${i.quantity})`).join(', ') || 'Items';
      const msg = (
        `🧾 *NEW ORDER INVOICE - LEXICON TECHNOLOGY*\n\n` +
        `📌 *Order Number*: #${orderNumber}\n` +
        `👤 *Customer*: ${order.customer_name || 'Customer'}\n` +
        `📞 *Phone*: ${order.customer_phone || ''}\n` +
        `🛍️ *Items*: ${itemsSummary}\n` +
        `💰 *Total Amount*: SGD $${order.total}\n` +
        `Status: ${order.status?.toUpperCase() || 'CONFIRMED'}\n\n` +
        `📄 *Download Invoice PDF*: https://lexicon-self.vercel.app/orders/${orderNumber}\n`
      );
      const waUrl = order.whatsapp_url || `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(msg)}`;
      
      const timer = setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [order, orderNumber]);

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
            Thank you for your order. We'll send you a confirmation email & WhatsApp invoice shortly.
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
              <>
                <div className="grid grid-cols-2 gap-3 text-sm border-b border-gray-100 pb-4 mb-4">
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
                    <p className="font-semibold text-gray-700">
                      {order.items?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0} items
                    </p>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="space-y-2 text-left">
                    <p className="text-2xs font-bold text-gray-400 uppercase tracking-wider mb-2">Purchased Products</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                        <span className="font-medium text-gray-800 truncate max-w-[220px]">
                          {item.product?.name || item.product_name || (item.product_id ? `Product #${item.product_id}` : `Product #${item.id}`)} × {item.quantity}
                        </span>
                        <span className="font-bold text-gray-900">${item.total_price || item.product?.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <a
              href={
                order?.whatsapp_url ||
                `https://api.whatsapp.com/send?phone=919500882090&text=${encodeURIComponent(
                  `🧾 *NEW ORDER INVOICE - LEXICON TECHNOLOGY*\n\n📌 Order Number: #${orderNumber}\n💰 Total: $${order?.total || ''}\n📄 Download Invoice PDF: https://lexicon-self.vercel.app/orders/${orderNumber}`
                )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all active:scale-98 text-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.98 9.98 0 004.779 1.221h.005c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2zm5.836 14.155c-.244.686-1.42 1.309-1.956 1.393-.497.078-1.139.112-1.841-.112-.426-.135-1.002-.319-1.745-.64-3.123-1.353-5.158-4.508-5.314-4.717-.156-.208-1.267-1.687-1.267-3.218 0-1.53.799-2.285 1.085-2.597.286-.312.624-.39.832-.39.208 0 .416.002.597.01.195.008.455-.074.715.546.26.623.884 2.158.962 2.314.078.156.13.338.026.546-.104.208-.156.338-.312.52-.156.182-.328.406-.468.546-.156.156-.319.325-.137.637.182.312.809 1.334 1.734 2.158 1.19 1.06 2.193 1.389 2.505 1.545.312.156.494.13.676-.078.182-.208.78-.91.988-1.222.208-.312.416-.26.696-.156.28.104 1.776.837 2.083.991.307.154.512.232.59.362.078.13.078.754-.166 1.44z"/>
              </svg>
              Send Invoice PDF to WhatsApp (+91 9500882090)
            </a>

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
