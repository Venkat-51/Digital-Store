import api from './api';
import type { Order, CreateOrderPayload } from '@/types/order.types';
import type { PaginatedResponse } from '@/types/api.types';

export const ordersService = {
  getAll: async (params?: { page?: number; status?: string }): Promise<PaginatedResponse<Order>> => {
    const { data } = await api.get('/orders/', { params });
    return data;
  },

  getByOrderNumber: async (orderNumber: string): Promise<Order> => {
    const { data } = await api.get(`/orders/${orderNumber}/`);
    return data;
  },

  create: async (payload: CreateOrderPayload): Promise<Order> => {
    const { data } = await api.post('/orders/', payload);
    return data;
  },

  updateStatus: async (id: number, status: string): Promise<Order> => {
    const { data } = await api.patch(`/orders/${id}/`, { status });
    return data;
  },

  cancel: async (id: number): Promise<Order> => {
    const { data } = await api.post(`/orders/${id}/cancel/`);
    return data;
  },

  downloadInvoice: async (orderNumber: string): Promise<Blob> => {
    const { data } = await api.get(`/orders/${orderNumber}/invoice/`, {
      responseType: 'blob',
    });
    return data;
  },
};
