import api from './api';
import type { Product } from '@/types/product.types';

export interface BackendCartItem {
  id: number;
  product: Product;
  quantity: number;
  unit_price: string;
  total_price: string;
  created_at: string;
  updated_at: string;
}

export const cartService = {
  getCart: async (): Promise<BackendCartItem[]> => {
    const { data } = await api.get('/cart/');
    return data;
  },

  addToCart: async (productId: number, quantity = 1): Promise<BackendCartItem> => {
    const { data } = await api.post('/cart/', { product_id: productId, quantity });
    return data;
  },

  updateQuantity: async (itemId: number | string, quantity: number): Promise<BackendCartItem> => {
    const { data } = await api.patch(`/cart/${itemId}/`, { quantity });
    return data;
  },

  removeFromCart: async (itemId: number | string): Promise<void> => {
    await api.delete(`/cart/${itemId}/`);
  },

  clearCart: async (): Promise<void> => {
    await api.delete('/cart/clear/');
  },
};
