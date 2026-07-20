import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useDebounce } from './useDebounce';
import { storage } from '@/utils/helpers';

const RECENT_SEARCHES_KEY = 'lexicon_recent_searches';
const MAX_RECENT = 8;

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 400);

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.SEARCH(debouncedQuery),
    queryFn: () => productsService.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
  });

  const recentSearches = storage.get<string[]>(RECENT_SEARCHES_KEY) ?? [];

  const saveSearch = useCallback((term: string) => {
    const existing = storage.get<string[]>(RECENT_SEARCHES_KEY) ?? [];
    const updated = [term, ...existing.filter((s) => s !== term)].slice(0, MAX_RECENT);
    storage.set(RECENT_SEARCHES_KEY, updated);
  }, []);

  const clearRecentSearches = useCallback(() => {
    storage.set(RECENT_SEARCHES_KEY, []);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return {
    query,
    setQuery,
    debouncedQuery,
    results: data?.results ?? [],
    totalCount: data?.count ?? 0,
    isLoading,
    isOpen,
    open,
    close,
    recentSearches,
    saveSearch,
    clearRecentSearches,
  };
};
