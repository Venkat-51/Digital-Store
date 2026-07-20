import api from './api';

export interface AdminStats {
  total_orders: number;
  total_revenue: string;
  total_customers: number;
  total_products: number;
  orders_today: number;
  revenue_today: string;
  recent_orders: { month: string; orders: number; revenue: number }[];
  top_products: { name: string; sales: number }[];
  order_status_breakdown: { status: string; count: number }[];
}

export interface CustomerStats {
  total_orders: number;
  total_spent: string;
  wishlist_count: number;
  pending_orders: number;
}

export const dashboardService = {
  getAdminStats: async (): Promise<AdminStats> => {
    const { data } = await api.get('/admin/stats/');
    return data;
  },

  getCustomerStats: async (): Promise<CustomerStats> => {
    const { data } = await api.get('/dashboard/stats/');
    return data;
  },

  getCustomers: async (params?: { page?: number; search?: string }) => {
    const { data } = await api.get('/admin/customers/', { params });
    return data;
  },

  getMediaFiles: async () => {
    const { data } = await api.get('/media/');
    return data;
  },

  uploadMedia: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/media/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteMedia: async (id: number): Promise<void> => {
    await api.delete(`/media/${id}/`);
  },
};
