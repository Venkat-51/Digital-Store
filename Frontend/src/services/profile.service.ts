import api from './api';
import type { User, Address } from '@/types/user.types';

export const profileService = {
  getProfile: async (): Promise<User> => {
    const { data } = await api.get('/auth/me/');
    return data;
  },

  updateProfile: async (payload: Partial<User>): Promise<User> => {
    const { data } = await api.patch('/auth/me/', payload);
    return data;
  },

  changePassword: async (payload: { old_password: string; new_password: string }): Promise<void> => {
    await api.post('/auth/password/change/', payload);
  },

  getAddresses: async (): Promise<Address[]> => {
    const { data } = await api.get('/addresses/');
    return data;
  },

  createAddress: async (payload: Omit<Address, 'id'>): Promise<Address> => {
    const { data } = await api.post('/addresses/', payload);
    return data;
  },

  updateAddress: async (id: number, payload: Partial<Address>): Promise<Address> => {
    const { data } = await api.patch(`/addresses/${id}/`, payload);
    return data;
  },

  deleteAddress: async (id: number): Promise<void> => {
    await api.delete(`/addresses/${id}/`);
  },

  setDefaultAddress: async (id: number): Promise<Address> => {
    const { data } = await api.post(`/addresses/${id}/set-default/`);
    return data;
  },

  uploadAvatar: async (file: File): Promise<{ avatar: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await api.post('/auth/avatar/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
