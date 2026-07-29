import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Product } from '@/types/product.types';
import { productsService } from '@/services/products.service';
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

  // Fetch from Neon DB on mount / when token exists
  useEffect(() => {
    const token = storage.get<string>(CONFIG.TOKEN_KEY);
    if (token) {
      productsService.getWishlist().then((remoteItems) => {
        if (Array.isArray(remoteItems)) {
          const products = remoteItems.map((item) => item.product).filter(Boolean);
          setItems(products);
          storage.set(CONFIG.WISHLIST_STORAGE_KEY, products);
        }
      }).catch((err) => {
        console.error('Failed to sync wishlist from database:', err);
      });
    }
  }, []);

  useEffect(() => {
    storage.set(CONFIG.WISHLIST_STORAGE_KEY, items);
  }, [items]);

  const toggleWishlist = useCallback((product: Product) => {
    const token = storage.get<string>(CONFIG.TOKEN_KEY);
    setItems((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        if (token) {
          productsService.removeFromWishlist(product.id).catch(console.error);
        }
        return prev.filter((p) => p.id !== product.id);
      } else {
        if (token) {
          productsService.addToWishlist(product.id).catch(console.error);
        }
        return [...prev, product];
      }
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
