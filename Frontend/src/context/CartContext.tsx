import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { CartItem } from '@/types/order.types';
import type { Product } from '@/types/product.types';
import { storage, generateId } from '@/utils/helpers';
import { CONFIG } from '@/constants/config';
import { formatPrice } from '@/utils/formatters';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: string;
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (itemId: string | number) => void;
  updateQuantity: (itemId: string | number, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  isInCart: (productId: number) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const calcSubtotal = (items: CartItem[]): string => {
  const total = items.reduce((sum, item) => {
    return sum + parseFloat(item.unit_price) * item.quantity;
  }, 0);
  return total.toFixed(2);
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    return storage.get<CartItem[]>(CONFIG.CART_STORAGE_KEY) ?? [];
  });
  const [isOpen, setIsOpen] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    storage.set(CONFIG.CART_STORAGE_KEY, items);
  }, [items]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? {
                ...i,
                quantity: Math.min(i.quantity + quantity, CONFIG.MAX_CART_QUANTITY),
                total_price: (parseFloat(i.unit_price) * (i.quantity + quantity)).toFixed(2),
              }
            : i,
        );
      }
      return [
        ...prev,
        {
          id: generateId(),
          product,
          quantity,
          unit_price: product.price,
          total_price: (parseFloat(product.price) * quantity).toFixed(2),
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((itemId: string | number) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string | number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              quantity: Math.min(quantity, CONFIG.MAX_CART_QUANTITY),
              total_price: (parseFloat(i.unit_price) * quantity).toFixed(2),
            }
          : i,
      ),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((p) => !p), []);

  const isInCart = useCallback(
    (productId: number) => items.some((i) => i.product.id === productId),
    [items],
  );

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = formatPrice(calcSubtotal(items));

  return (
    <CartContext.Provider
      value={{ items, itemCount, subtotal, isOpen, addItem, removeItem, updateQuantity, clearCart, openCart, closeCart, toggleCart, isInCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
};
