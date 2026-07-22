// ============================================================
// Order Types
// ============================================================

import type { Product } from './product.types';
import type { Address, User } from './user.types';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  id: number;
  product?: Product;
  product_id?: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer: User;
  items: OrderItem[];
  status: OrderStatus;
  shipping_address: Address;
  subtotal: string;
  shipping_cost: string;
  tax: string;
  total: string;
  notes?: string;
  company_name?: string;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
}

export interface CreateOrderPayload {
  items: { product_id: number; quantity: number }[];
  shipping_address_id?: number;
  shipping_address?: Omit<Address, 'id' | 'is_default' | 'label'>;
  notes?: string;
  company_name?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

// ============================================================
// Cart Types
// ============================================================

export interface CartItem {
  id: number | string;
  product: Product;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface Cart {
  id?: number;
  items: CartItem[];
  subtotal: string;
  item_count: number;
}
