import React from 'react';
import { Modal } from '@/components/ui/Modal';
import type { Order } from '@/types/order.types';
import { useUpdateOrderStatus } from '@/hooks/useAdmin';
import { Download, Package, MapPin, Mail, Phone, Clock, FileText } from 'lucide-react';
import { formatDate, formatPrice } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { CONFIG } from '@/constants/config';

interface AdminOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

export const AdminOrderDetailModal: React.FC<AdminOrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const updateStatusMutation = useUpdateOrderStatus();

  if (!order) return null;

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId: order.id, status: newStatus });
      toast.success(`Order status updated to ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      toast.error('Failed to update order status');
    }
  };

  const invoiceUrl = `${CONFIG.API_BASE_URL}/orders/${order.order_number}/invoice/`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details #${order.order_number}`}
      size="xl"
    >
      <div className="space-y-6 pt-2 text-sm text-gray-700">
        {/* Header Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Order Reference</span>
            <h3 className="text-xl font-black text-white mt-0.5">{order.order_number}</h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Clock size={14} /> Placed on {formatDate(order.created_at)}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <span className="text-xs text-slate-400">Order Status:</span>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-slate-800 text-white border border-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              <option value="pending">PENDING</option>
              <option value="processing">PROCESSING</option>
              <option value="shipped">SHIPPED</option>
              <option value="delivered">DELIVERED</option>
              <option value="cancelled">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Customer & Address Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide flex items-center gap-2">
              <Mail size={15} className="text-primary-600" /> Customer Info
            </h4>
            <p className="font-bold text-gray-900 text-sm">{order.customer_name || 'Customer'}</p>
            <p className="text-xs text-gray-600 flex items-center gap-2">
              <span>Email:</span> <span className="font-semibold text-gray-900">{order.customer_email}</span>
            </p>
            {order.customer_phone && (
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <span>Phone:</span> <span className="font-semibold text-gray-900">{order.customer_phone}</span>
              </p>
            )}
          </div>

          {/* Shipping Address */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide flex items-center gap-2">
              <MapPin size={15} className="text-emerald-600" /> Delivery Address
            </h4>
            {order.shipping_address ? (
              <div className="text-xs text-gray-700 leading-relaxed">
                <p className="font-bold text-gray-900">{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.address_line1} {order.shipping_address.address_line2}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.postal_code} ({order.shipping_address.country})</p>
                <p className="text-gray-500 mt-1">Phone: {order.shipping_address.phone}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No shipping address attached.</p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <Package size={16} className="text-primary-600" /> Line Items ({order.items?.length || 0})
          </h4>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold uppercase border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">{item.product_name}</td>
                    <td className="py-2.5 px-3 text-center text-gray-700">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-gray-700">${item.unit_price}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">${item.total_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Summary & PDF Download */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <a
            href={invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <FileText size={15} /> Download PDF Invoice
          </a>

          <div className="w-full sm:w-auto text-right space-y-1">
            <div className="flex justify-between sm:justify-end gap-6 text-xs text-gray-500">
              <span>Subtotal:</span>
              <span className="font-semibold text-gray-900">${order.subtotal}</span>
            </div>
            <div className="flex justify-between sm:justify-end gap-6 text-xs text-gray-500">
              <span>Shipping Fee:</span>
              <span className="font-semibold text-gray-900">${order.shipping_cost}</span>
            </div>
            <div className="flex justify-between sm:justify-end gap-6 text-base font-black text-primary-600 pt-1 border-t border-gray-100">
              <span>Total:</span>
              <span>${order.total}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
