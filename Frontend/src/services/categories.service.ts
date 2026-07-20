import api from './api';
import type { Category } from '@/types/product.types';

export const categoriesService = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await api.get('/categories/');
    return data;
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const { data } = await api.get(`/categories/${slug}/`);
    return data;
  },

  create: async (payload: Partial<Category>): Promise<Category> => {
    const { data } = await api.post('/categories/', payload);
    return data;
  },

  update: async (id: number, payload: Partial<Category>): Promise<Category> => {
    const { data } = await api.patch(`/categories/${id}/`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}/`);
  },
};
