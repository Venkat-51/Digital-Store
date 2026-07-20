// ============================================================
// cn — className merger utility (clsx + tailwind-merge)
// ============================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

/** Merge animation class based on condition */
export const cx = cn;

/** Delay helper */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Local storage helpers */
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

/** Generate a unique client-side ID */
export const generateId = (): string =>
  `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

/** Check if user is on mobile */
export const isMobile = (): boolean =>
  typeof window !== 'undefined' && window.innerWidth < 768;

/** Scroll to element by ID */
export const scrollToId = (id: string): void => {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
