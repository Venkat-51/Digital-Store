// ============================================================
// Product Types
// ============================================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: number | null;
  children?: Category[];
  product_count?: number;
  icon?: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text?: string;
  is_primary: boolean;
  order: number;
}

export interface ProductSpec {
  id: number;
  name: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  short_description?: string;
  category: Category;
  brand: Brand;
  price: string;
  compare_price?: string;
  discount_percentage?: number;
  images: ProductImage[];
  thumbnail?: string;
  specifications?: ProductSpec[];
  stock: number;
  is_in_stock: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_sale: boolean;
  rating?: number;
  review_count?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  category?: string | number;
  brand?: string | number;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  is_featured?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface WishlistItem {
  id: number;
  product: Product;
  added_at: string;
}
