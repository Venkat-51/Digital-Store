import { generateId } from '@/utils/helpers';
import type { CartItem } from '@/types/order.types';
import type { Product } from '@/types/product.types';

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    slug: "premium-wireless-headphones",
    sku: "WH-1000XM4",
    description: "Industry leading noise canceling with Dual Noise Sensor technology.",
    category: { id: 1, name: "Audio", slug: "audio" },
    brand: { id: 1, name: "Sony", slug: "sony" },
    price: "348.00",
    images: [
      { id: 1, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80", is_primary: true, order: 1 }
    ],
    stock: 25,
    is_in_stock: true,
    is_featured: true,
    is_new: false,
    is_sale: true,
    rating: 4.8,
    review_count: 342,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Ultra HD Smart TV",
    slug: "ultra-hd-smart-tv",
    sku: "TV-55-UHD",
    description: "Experience incredible detail and clarity with 4K UHD resolution.",
    category: { id: 2, name: "Television", slug: "television" },
    brand: { id: 2, name: "Samsung", slug: "samsung" },
    price: "499.99",
    images: [
      { id: 2, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80", is_primary: true, order: 1 }
    ],
    stock: 12,
    is_in_stock: true,
    is_featured: true,
    is_new: true,
    is_sale: false,
    rating: 4.6,
    review_count: 128,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: "Mechanical Gaming Keyboard",
    slug: "mechanical-gaming-keyboard",
    sku: "MGK-RGB-01",
    description: "RGB backlit mechanical gaming keyboard with tactile switches.",
    category: { id: 3, name: "Accessories", slug: "accessories" },
    brand: { id: 3, name: "Corsair", slug: "corsair" },
    price: "129.50",
    images: [
      { id: 3, image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80", is_primary: true, order: 1 }
    ],
    stock: 50,
    is_in_stock: true,
    is_featured: false,
    is_new: true,
    is_sale: false,
    rating: 4.9,
    review_count: 85,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockCartData: CartItem[] = mockProducts.map((product, index) => {
  const quantity = index + 1; // Example quantities: 1, 2, 3...
  return {
    id: generateId(),
    product: product,
    quantity: quantity,
    unit_price: product.price,
    total_price: (parseFloat(product.price) * quantity).toFixed(2),
  };
});
