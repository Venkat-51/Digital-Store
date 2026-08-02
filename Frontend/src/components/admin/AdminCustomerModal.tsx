import React from 'react';
import { Modal } from '@/components/ui/Modal';
import type { AdminCustomer } from '@/services/admin.service';
import { Mail, Phone, MapPin, ShoppingBag, Heart, ShoppingCart, Calendar, UserCheck } from 'lucide-react';
import { formatPrice, formatDate } from '@/utils/formatters';
import { Badge } from '@/components/ui/Badge';

interface AdminCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: AdminCustomer | null;
}

export const AdminCustomerModal: React.FC<AdminCustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  if (!customer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Customer Profile: ${customer.full_name}`}
      size="xl"
    >
      <div className="space-y-6 pt-2 text-sm text-gray-700">
        {/* Basic Contact Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">{customer.full_name}</h3>
              {customer.is_staff && (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  STAFF / ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>User ID: #{customer.id}</span> • <span>Joined {formatDate(customer.date_joined)}</span>
            </p>
          </div>

          <div className="flex flex-col gap-1 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-primary-400" />
              <span>{customer.email}</span>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-emerald-400" />
                <span>{customer.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Orders</p>
            <p className="text-xl font-extrabold text-gray-900 mt-1">{customer.order_summary.total_orders}</p>
          </div>

          <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Spent</p>
            <p className="text-xl font-extrabold text-primary-600 mt-1">${customer.order_summary.total_spent}</p>
          </div>

          <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Cart Items</p>
            <p className="text-xl font-extrabold text-blue-600 mt-1">{customer.cart.items.length}</p>
          </div>

          <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Wishlist Saved</p>
            <p className="text-xl font-extrabold text-red-500 mt-1">{customer.wishlist.length}</p>
          </div>
        </div>

        {/* Section 1: Saved Addresses */}
        <div>
          <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-primary-600" /> Saved Delivery Addresses ({customer.addresses.length})
          </h4>
          {customer.addresses.length === 0 ? (
            <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-xl">No saved addresses found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customer.addresses.map((addr) => (
                <div key={addr.id} className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-xs">{addr.label}</span>
                    {addr.is_default && <Badge variant="primary">Default</Badge>}
                  </div>
                  <p className="text-xs text-gray-700 font-medium">{addr.full_name}</p>
                  <p className="text-xs text-gray-500">{addr.address_line1} {addr.address_line2}</p>
                  <p className="text-xs text-gray-500">{addr.city}, {addr.postal_code} ({addr.country})</p>
                  <p className="text-xs text-gray-500">Phone: {addr.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Active Cart & Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cart */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h4 className="font-bold text-gray-900 flex items-center gap-2 text-xs uppercase tracking-wide">
                <ShoppingCart size={15} className="text-blue-600" /> Current Cart (${customer.cart.total_value})
              </h4>
              <span className="text-xs font-semibold text-gray-500">{customer.cart.items.length} items</span>
            </div>
            {customer.cart.items.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2">Cart is empty.</p>
            ) : (
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {customer.cart.items.map((item) => (
                  <li key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-gray-50">
                    <span className="font-medium text-gray-800 line-clamp-1">{item.product_name}</span>
                    <span className="text-gray-500 whitespace-nowrap">
                      {item.quantity} × ${item.unit_price} = <strong className="text-gray-900">${item.total_price}</strong>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Wishlist */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h4 className="font-bold text-gray-900 flex items-center gap-2 text-xs uppercase tracking-wide">
                <Heart size={15} className="text-red-500" /> Saved Wishlist
              </h4>
              <span className="text-xs font-semibold text-gray-500">{customer.wishlist.length} items</span>
            </div>
            {customer.wishlist.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2">Wishlist is empty.</p>
            ) : (
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {customer.wishlist.map((item) => (
                  <li key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-gray-50">
                    <span className="font-medium text-gray-800 line-clamp-1">{item.product_name}</span>
                    <span className="font-bold text-primary-600">${item.price}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Section 3: Recent Orders */}
        <div>
          <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
            <ShoppingBag size={16} className="text-emerald-600" /> Order History ({customer.order_summary.total_orders})
          </h4>
          {customer.order_summary.recent_orders.length === 0 ? (
            <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-xl">No orders placed yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Order #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customer.order_summary.recent_orders.map((ord) => (
                    <tr key={ord.id}>
                      <td className="py-2 px-3 font-mono font-bold text-gray-900">{ord.order_number}</td>
                      <td className="py-2 px-3 text-gray-500">{formatDate(ord.created_at)}</td>
                      <td className="py-2 px-3">
                        <span className="capitalize px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-800">
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900">${floatVal(ord.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

function floatVal(val: any): number {
  if (typeof val === 'number') return val;
  return parseFloat(val || '0');
}
