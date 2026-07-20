import api from './api';
import type { LoginCredentials, RegisterPayload, AuthTokens, User } from '@/types/user.types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<{ tokens: AuthTokens; user: User }> => {
    const { data } = await api.post('/auth/login/', credentials);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<{ tokens: AuthTokens; user: User }> => {
    const { data } = await api.post('/auth/register/', payload);
    return data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout/', { refresh: refreshToken });
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/password/reset/', { email });
    return data;
  },

  resetPassword: async (payload: { token: string; password: string; password_confirm: string }): Promise<void> => {
    await api.post('/auth/password/reset/confirm/', payload);
  },

  me: async (): Promise<User> => {
    const { data } = await api.get('/auth/me/');
    return data;
  },

  refreshToken: async (refresh: string): Promise<{ access: string }> => {
    const { data } = await api.post('/auth/token/refresh/', { refresh });
    return data;
  },
};
