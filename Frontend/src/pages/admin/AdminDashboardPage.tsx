import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useAdminOrders, useAdminCustomers, useDeleteProduct, useUpdateOrderStatus } from '@/hooks/useAdmin';
import {
  Package, ShoppingBag, Users, DollarSign, Plus, Upload, Download,
  Search, Filter, Edit, Trash2, Eye, FileText, CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AdminProductModal } from '@/components/admin/AdminProductModal';
import { AdminOrderDetailModal } from '@/components/admin/AdminOrderDetailModal';
import { AdminCustomerModal } from '@/components/admin/AdminCustomerModal';
import { BulkProductUploadModal } from '@/components/admin/BulkProductUploadModal';
import { NAV_CATEGORIES, CONFIG } from '@/constants/config';
import type { Product } from '@/types/product.types';
import type { Order } from '@/types/order.types';
import type { AdminCustomer } from '@/services/admin.service';
import { formatDate, formatImageUrl } from '@/utils/formatters';
import toast from 'react-hot-toast';

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'customers'>('products');

  // Filters & State
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('');
  
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('');

  const [customerSearch, setCustomerSearch] = useState('');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);

  // API Queries
  const { data: productsData, isLoading: isLoadingProducts, refetch: refetchProducts } = useProducts({ page_size: 200 });
  const { data: orders, isLoading: isLoadingOrders, refetch: refetchOrders } = useAdminOrders({ search: orderSearch, status: orderStatus });
  const { data: customers, isLoading: isLoadingCustomers, refetch: refetchCustomers } = useAdminCustomers();

  const deleteProductMutation = useDeleteProduct();
  const updateStatusMutation = useUpdateOrderStatus();

  const allProducts = productsData?.results ?? [];

  // Filtered Products
  const filteredProducts = allProducts.filter((p) => {
    const matchSearch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()));
    const matchCategory = !productCategory || (p.category?.slug === productCategory || p.category?.name.toLowerCase() === productCategory.toLowerCase());
    return matchSearch && matchCategory;
  });

  // Filtered Customers
  const filteredCustomers = (customers || []).filter((c) => {
    if (!customerSearch) return true;
    const q = customerSearch.toLowerCase();
    return c.full_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.phone && c.phone.includes(q));
  });

  // KPI calculations
  const totalRevenue = (orders || [])
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + parseFloat(o.total || '0'), 0);

  const totalOrdersCount = orders?.length || 0;
  const totalProductsCount = allProducts.length;
  const totalCustomersCount = customers?.length || 0;

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    try {
      await deleteProductMutation.mutateAsync(product.id);
      toast.success(`Deleted "${product.name}"`);
    } catch (err) {
      toast.error('Failed to delete product.');
    }
  };

  const handleDownloadTemplate = () => {
    window.open(`${CONFIG.API_BASE_URL}/products/csv-template/`, '_blank');
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, status: newStatus });
      toast.success(`Order status updated to ${newStatus.toUpperCase()}`);
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Admin Control Center</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage catalog products, customer orders, and registered accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            onClick={() => {
              refetchProducts();
              refetchOrders();
              refetchCustomers();
              toast.success('Dashboard refreshed');
            }}
            className="rounded-xl text-xs"
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">${totalRevenue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{totalOrdersCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Products Catalog</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{totalProductsCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customers</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{totalCustomersCount}</h3>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 p-2 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold transition-all ${
              activeTab === 'products'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Package size={16} /> Products ({allProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold transition-all ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ShoppingBag size={16} /> Orders ({totalOrdersCount})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold transition-all ${
              activeTab === 'customers'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Users size={16} /> Customers ({totalCustomersCount})
          </button>
        </div>

        {/* TAB 1: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 w-full">
                <div className="relative w-full sm:w-72">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search product or SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                  />
                </div>

                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {NAV_CATEGORIES.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between sm:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download size={14} />}
                  onClick={handleDownloadTemplate}
                  className="flex-1 sm:flex-none rounded-xl text-xs whitespace-nowrap"
                >
                  CSV Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Upload size={14} />}
                  onClick={() => setIsBulkModalOpen(true)}
                  className="flex-1 sm:flex-none rounded-xl text-xs whitespace-nowrap"
                >
                  Bulk Import CSV
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={14} />}
                  onClick={() => {
                    setSelectedProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="w-full sm:w-auto rounded-xl text-xs font-bold whitespace-nowrap"
                >
                  Add Product
                </Button>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoadingProducts ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">Loading products...</td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">No products found matching filters.</td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={formatImageUrl(prod.thumbnail)}
                              alt={prod.name}
                              className="w-10 h-10 rounded-xl object-contain bg-gray-50 p-1 border border-gray-100"
                            />
                            <div>
                              <p className="font-bold text-gray-900 line-clamp-1">{prod.name}</p>
                              <p className="text-[10px] font-mono text-gray-400">{prod.sku || `ID: #${prod.id}`}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-700">
                          {prod.category?.name || 'General'}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">
                          ${parseFloat(prod.price).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-800">
                          {prod.stock}
                        </td>
                        <td className="py-3 px-4">
                          {prod.is_in_stock ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle size={10} /> In Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                              <AlertCircle size={10} /> Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedProduct(prod);
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Edit product"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search order #, customer, email..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                {['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatus(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                      orderStatus === st
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {st || 'All Orders'}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoadingOrders ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">Loading orders...</td>
                    </tr>
                  ) : !orders || orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">No orders found.</td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">
                          {ord.order_number}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-gray-900">{ord.customer_name || 'Customer'}</p>
                          <p className="text-[10px] text-gray-500">{ord.customer_email}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                          {formatDate(ord.created_at)}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-gray-900">
                          ${parseFloat(ord.total).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={ord.status}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                            className={`text-[11px] font-extrabold rounded-lg px-2.5 py-1 border cursor-pointer focus:outline-none ${
                              STATUS_CLASSES[ord.status] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <option value="pending">PENDING</option>
                            <option value="processing">PROCESSING</option>
                            <option value="shipped">SHIPPED</option>
                            <option value="delivered">DELIVERED</option>
                            <option value="cancelled">CANCELLED</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Eye size={13} />}
                            onClick={() => {
                              setSelectedOrder(ord);
                              setIsOrderDetailModalOpen(true);
                            }}
                            className="rounded-lg text-[11px] py-1 px-2.5"
                          >
                            View Order
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMERS MANAGEMENT */}
        {activeTab === 'customers' && (
          <div className="p-6 space-y-6">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search customer name, email, phone..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
              />
            </div>

            {/* Customers Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4">Total Orders</th>
                    <th className="py-3 px-4">Total Spent</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoadingCustomers ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">Loading customer profiles...</td>
                    </tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">No customer records found.</td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-extrabold flex items-center justify-center text-xs">
                              {cust.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{cust.full_name}</p>
                              <p className="text-[10px] text-gray-500">{cust.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-700">
                          {cust.phone || '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {formatDate(cust.date_joined)}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {cust.order_summary.total_orders}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-600">
                          ${cust.order_summary.total_spent}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Eye size={13} />}
                            onClick={() => {
                              setSelectedCustomer(cust);
                              setIsCustomerModalOpen(true);
                            }}
                            className="rounded-lg text-[11px] py-1 px-2.5"
                          >
                            Full Profile
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product Edit / Create Modal */}
      <AdminProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        categories={NAV_CATEGORIES.map((c, idx) => ({ id: idx + 1, name: c.name }))}
      />

      {/* Bulk Upload CSV Modal */}
      <BulkProductUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />

      {/* Order Detail Modal */}
      <AdminOrderDetailModal
        isOpen={isOrderDetailModalOpen}
        onClose={() => setIsOrderDetailModalOpen(false)}
        order={selectedOrder}
      />

      {/* Customer Insights Modal */}
      <AdminCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default AdminDashboardPage;
