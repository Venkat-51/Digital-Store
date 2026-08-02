import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import type { Product } from '@/types/product.types';
import { QUERY_KEYS } from '@/constants/queryKeys';

export const ADMIN_QUERY_KEYS = {
  ORDERS: ['admin', 'orders'],
  CUSTOMERS: ['admin', 'customers'],
};

export const useAdminOrders = (params?: { status?: string; search?: string }) => {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.ORDERS, params],
    queryFn: () => adminService.getOrders(params),
    staleTime: 30 * 1000,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      adminService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.CUSTOMERS });
    },
  });
};

export const useAdminCustomers = () => {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.CUSTOMERS,
    queryFn: () => adminService.getCustomers(),
    staleTime: 60 * 1000,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Product> & { category_id?: number; image_url?: string }) =>
      adminService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      idOrSlug,
      data,
    }: {
      idOrSlug: string | number;
      data: Partial<Product> & { category_id?: number; image_url?: string };
    }) => adminService.updateProduct(idOrSlug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idOrSlug: string | number) => adminService.deleteProduct(idOrSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
    },
  });
};
