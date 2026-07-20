import { useQuery } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { ProductFilters } from '@/types/product.types';

export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, filters],
    queryFn: () => productsService.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT(slug),
    queryFn: () => productsService.getBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.FEATURED_PRODUCTS],
    queryFn: productsService.getFeatured,
    staleTime: 10 * 60 * 1000,
  });
};

export const useRelatedProducts = (productId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.RELATED_PRODUCTS(productId),
    queryFn: () => productsService.getRelated(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};
