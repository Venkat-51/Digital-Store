// ============================================================
// Axios Instance with interceptors
// ============================================================

import axios from 'axios';
import { CONFIG } from '@/constants/config';
import { storage } from '@/utils/helpers';

const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ── Request interceptor: attach JWT access token ──
api.interceptors.request.use(
  (config) => {
    const token = storage.get<string>(CONFIG.TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: handle 401, refresh token ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = storage.get<string>(CONFIG.REFRESH_TOKEN_KEY);

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${CONFIG.API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          storage.set(CONFIG.TOKEN_KEY, data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch {
          // Refresh failed — clear tokens
          storage.remove(CONFIG.TOKEN_KEY);
          storage.remove(CONFIG.REFRESH_TOKEN_KEY);
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
