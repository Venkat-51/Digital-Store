import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Package, ArrowRight, ArrowLeft, Download, MapPin, Truck, CheckCircle2, Clock, Calendar
} from 'lucide-react';
import { ordersService } from '@/services/orders.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { formatDate, formatPrice } from '@/utils/formatters';
import { cn } from '@/utils/helpers';

const OrdersPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber?: string }>();
  const navigate = useNavigate();

  // Fetch all orders for list view
  const { data: ordersData, isLoading: isListLoading } = useQuery({
    queryKey: [QUERY_KEYS.ORDERS],
    queryFn: () => ordersService.getAll(),
    enabled: !orderNumber,
  });

  // Fetch single order detail when orderNumber is present
  const { data: orderDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: QUERY_KEYS.ORDER(orderNumber!),
    queryFn: () => ordersService.getByOrderNumber(orderNumber!),
    enabled: !!orderNumber,
  });

  // ============================================================
  // SINGLE ORDER DETAIL VIEW
  // ============================================================
  if (orderNumber) {
    if (isDetailLoading) {
      return (
        <div className="space-y-4 max-w-3xl mx-auto">
          <Skeleton className="h-10 w-48" rounded="rounded-xl" />
          <Skeleton className="h-32 w-full" rounded="rounded-3xl" />
          <Skeleton className="h-64 w-full" rounded="rounded-3xl" />
        </div>
      );
    }

    if (!orderDetail) {
      return (
        <div className="max-w-3xl mx-auto space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <EmptyState
            icon={<Package size={36} />}
            title="Order not found"
            description={`We couldn't find order details for #${orderNumber}.`}
            action={{ label: 'View All Orders', onClick: () => window.location.href = '/account/orders' }}
          />
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-2">
            <a
              href={
                orderDetail.whatsapp_url ||
                `https://api.whatsapp.com/send?phone=919500882090&text=${encodeURIComponent(
                  `🧾 *ORDER INVOICE - LEXICON TECHNOLOGY*\n\n📌 Order Number: #${orderDetail.order_number}\n👤 Customer: ${orderDetail.customer_name || ''}\n💰 Total: S$${orderDetail.total}\n📄 Invoice PDF: https://lexicon-self.vercel.app/orders/${orderDetail.order_number}`
                )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-98"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.98 9.98 0 004.779 1.221h.005c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2zm5.836 14.155c-.244.686-1.42 1.309-1.956 1.393-.497.078-1.139.112-1.841-.112-.426-.135-1.002-.319-1.745-.64-3.123-1.353-5.158-4.508-5.314-4.717-.156-.208-1.267-1.687-1.267-3.218 0-1.53.799-2.285 1.085-2.597.286-.312.624-.39.832-.39.208 0 .416.002.597.01.195.008.455-.074.715.546.26.623.884 2.158.962 2.314.078.156.13.338.026.546-.104.208-.156.338-.312.52-.156.182-.328.406-.468.546-.156.156-.319.325-.137.637.182.312.809 1.334 1.734 2.158 1.19 1.06 2.193 1.389 2.505 1.545.312.156.494.13.676-.078.182-.208.78-.91.988-1.222.208-.312.416-.26.696-.156.28.104 1.776.837 2.083.991.307.154.512.232.59.362.078.13.078.754-.166 1.44z"/>
              </svg>
              WhatsApp Invoice (+91 9500882090)
            </a>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={15} />}
              onClick={async () => {
                try {
                  const blob = await ordersService.downloadInvoice(orderDetail.order_number);
                  const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `invoice-${orderDetail.order_number}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  console.error('Failed to download invoice:', error);
                }
              }}
            >
              Download Invoice
            </Button>
          </div>
        </div>

        {/* Order Info Banner */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-gray-900">Order #{orderDetail.order_number}</h1>
                <StatusBadge status={orderDetail.status} />
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" />
                Placed on {formatDate(orderDetail.created_at)}
              </p>
            </div>
            <div className="text-right sm:text-right">
              <p className="text-2xs font-bold text-gray-400 uppercase tracking-wider">Total Amount</p>
              <p className="text-2xl font-black text-gray-900">{formatPrice(orderDetail.total)}</p>
            </div>
          </div>

          {/* Status Stepper */}
          <div className="pt-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Order Status</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-emerald-50 text-emerald-700 rounded-2xl p-3 border border-emerald-100">
                <CheckCircle2 size={18} className="mx-auto mb-1 text-emerald-600" />
                <p className="text-xs font-bold">Confirmed</p>
              </div>
              <div className={cn(
                "rounded-2xl p-3 border text-xs font-bold",
                orderDetail.status === 'processing' || orderDetail.status === 'shipped' || orderDetail.status === 'delivered'
                  ? "bg-amber-50 text-amber-700 border-amber-100"
                  : "bg-gray-50 text-gray-400 border-gray-100"
              )}>
                <Clock size={18} className="mx-auto mb-1" />
                <p>Processing</p>
              </div>
              <div className={cn(
                "rounded-2xl p-3 border text-xs font-bold",
                orderDetail.status === 'delivered'
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-gray-50 text-gray-400 border-gray-100"
              )}>
                <Truck size={18} className="mx-auto mb-1" />
                <p>Delivered</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
            Items Ordered ({orderDetail.items.length})
          </h2>
          <div className="divide-y divide-gray-100">
            {orderDetail.items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl p-2 flex items-center justify-center border border-gray-100 flex-shrink-0">
                  <img
                    src={item.product?.thumbnail || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300&auto=format&fit=crop&q=80'}
                    alt={item.product?.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-gray-900 truncate">{item.product?.name}</h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Qty: {item.quantity} × {formatPrice(item.unit_price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{formatPrice(item.total_price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details Grid (Shipping Address & Summary) */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Shipping Address Card */}
          {orderDetail.shipping_address && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
              <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={15} className="text-primary-600" />
                Shipping Address
              </h2>
              <div className="text-sm space-y-1 text-gray-700 font-medium">
                <p className="font-bold text-gray-900">{orderDetail.shipping_address.full_name}</p>
                <p>{orderDetail.shipping_address.address_line1}</p>
                <p>{orderDetail.shipping_address.city}, {orderDetail.shipping_address.postal_code}</p>
                <p className="text-gray-500 text-xs pt-1">{orderDetail.shipping_address.phone}</p>
              </div>
            </div>
          )}

          {/* Payment Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
            <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
              Payment Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Subtotal</span>
                <span>{formatPrice(orderDetail.subtotal || orderDetail.total)}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Shipping</span>
                <span>{orderDetail.shipping_cost === '0.00' ? 'FREE' : formatPrice(orderDetail.shipping_cost || '0')}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-black text-gray-900 text-base">
                <span>Total</span>
                <span className="text-primary-600">{formatPrice(orderDetail.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ALL ORDERS LIST VIEW
  // ============================================================
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">My Orders</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Track and view your recent purchases</p>
        </div>
        {!!ordersData?.results?.length && (
          <span className="bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1.5 rounded-xl">
            {ordersData.results.length} {ordersData.results.length === 1 ? 'Order' : 'Orders'}
          </span>
        )}
      </div>

      {isListLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" rounded="rounded-3xl" />
          ))}
        </div>
      ) : !ordersData?.results?.length ? (
        <EmptyState
          icon={<Package size={32} />}
          title="No orders yet"
          description="Your orders will appear here after you make a purchase."
          action={{ label: 'Start Shopping', onClick: () => window.location.href = '/shop' }}
        />
      ) : (
        <div className="space-y-3">
          {ordersData.results.map((order) => (
            <Link
              key={order.id}
              to={`/account/orders/${order.order_number}`}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Package size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-extrabold text-gray-900 text-base">#{order.order_number}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  {formatDate(order.created_at)} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                <p className="text-lg font-black text-gray-900">{formatPrice(order.total)}</p>
                <span className="text-xs font-bold text-primary-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Details <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
