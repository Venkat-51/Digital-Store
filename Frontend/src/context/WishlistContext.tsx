import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Product } from '@/types/product.types';
import { storage } from '@/utils/helpers';
import { CONFIG } from '@/constants/config';

interface WishlistContextType {
  items: Product[];
  count: number;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Product[]>(() => {
    return storage.get<Product[]>(CONFIG.WISHLIST_STORAGE_KEY) ?? [];
  });

  useEffect(() => {
    storage.set(CONFIG.WISHLIST_STORAGE_KEY, items);
  }, [items]);

  const toggleWishlist = useCallback((product: Product) => {
    setItems((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      return exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];
    });
  }, []);

  const isInWishlist = useCallback(
    (productId: number) => items.some((p) => p.id === productId),
    [items],
  );

  const clearWishlist = useCallback(() => setItems([]), []);

  return (
    <WishlistContext.Provider value={{ items, count: items.length, toggleWishlist, isInWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlistContext = (): WishlistContextType => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlistContext must be used within WishlistProvider');
  return ctx;
};
