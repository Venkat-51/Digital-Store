import api from './api';
import type { Order } from '@/types/order.types';
import type { Product } from '@/types/product.types';

export interface AdminCustomer {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  is_staff: boolean;
  date_joined: string;
  addresses: any[];
  cart: {
    items: {
      id: number;
      product_id: number;
      product_name: string;
      quantity: number;
      unit_price: string;
      total_price: string;
    }[];
    total_value: string;
  };
  wishlist: {
    id: number;
    product_id: number;
    product_name: string;
    price: string;
    slug: string;
  }[];
  order_summary: {
    total_orders: number;
    total_spent: string;
    recent_orders: Order[];
  };
}

export const adminService = {
  // Orders
  getOrders: async (params?: { status?: string; search?: string }): Promise<Order[]> => {
    const res = await api.get('/admin/orders/', { params });
    return res.data;
  },

  updateOrderStatus: async (orderId: number, status: string): Promise<Order> => {
    const res = await api.patch(`/admin/orders/${orderId}/status/`, { status });
    return res.data;
  },

  // Customers
  getCustomers: async (): Promise<AdminCustomer[]> => {
    const res = await api.get('/admin/customers/');
    return res.data;
  },

  // Products CRUD
  createProduct: async (data: Partial<Product> & { category_id?: number; image_url?: string }): Promise<Product> => {
    const res = await api.post('/products/', data);
    return res.data;
  },

  updateProduct: async (idOrSlug: string | number, data: Partial<Product> & { category_id?: number; image_url?: string }): Promise<Product> => {
    const res = await api.patch(`/products/${idOrSlug}/`, data);
    return res.data;
  },

  deleteProduct: async (idOrSlug: string | number): Promise<{ message: string }> => {
    const res = await api.delete(`/products/${idOrSlug}/`);
    return res.data;
  },
};
