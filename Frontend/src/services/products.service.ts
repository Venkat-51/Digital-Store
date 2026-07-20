import api from './api';
import type { Product, ProductFilters, WishlistItem } from '@/types/product.types';
import type { PaginatedResponse } from '@/types/api.types';

export const productsService = {
  getAll: async (filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> => {
    const { data } = await api.get('/products/', { params: filters });
    return data;
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const { data } = await api.get(`/products/${slug}/`);
    return data;
  },

  getFeatured: async (): Promise<Product[]> => {
    const { data } = await api.get('/products/featured/');
    return data;
  },

  getRelated: async (productId: number): Promise<Product[]> => {
    const { data } = await api.get(`/products/${productId}/related/`);
    return data;
  },

  search: async (query: string, filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const { data } = await api.get('/products/', { params: { search: query, ...filters } });
    return data;
  },

  // Admin
  create: async (formData: FormData): Promise<Product> => {
    const { data } = await api.post('/products/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  update: async (id: number, payload: Partial<Product>): Promise<Product> => {
    const { data } = await api.patch(`/products/${id}/`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}/`);
  },

  // Wishlist
  getWishlist: async (): Promise<WishlistItem[]> => {
    const { data } = await api.get('/wishlist/');
    return data;
  },

  addToWishlist: async (productId: number): Promise<WishlistItem> => {
    const { data } = await api.post('/wishlist/', { product_id: productId });
    return data;
  },

  removeFromWishlist: async (itemId: number): Promise<void> => {
    await api.delete(`/wishlist/${itemId}/`);
  },
};
