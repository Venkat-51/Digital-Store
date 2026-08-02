import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Product } from '@/types/product.types';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useAdmin';
import type { ProductPayload } from '@/services/admin.service';
import toast from 'react-hot-toast';

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  categories: { id: number; name: string }[];
}

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
}) => {
  const isEditing = !!product;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isInStock, setIsInStock] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setPrice(product.price ? String(product.price) : '');
      setStock(product.stock !== undefined ? String(product.stock) : '10');
      setCategoryId(product.category?.id ? String(product.category.id) : '');
      setDescription(product.description || '');
      setImageUrl(product.thumbnail || '');
      setIsInStock(product.is_in_stock ?? true);
      setIsFeatured(product.is_featured ?? false);
    } else {
      setName('');
      setPrice('');
      setStock('10');
      setCategoryId(categories[0]?.id ? String(categories[0].id) : '');
      setDescription('');
      setImageUrl('');
      setIsInStock(true);
      setIsFeatured(false);
    }
  }, [product, categories, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price) {
      toast.error('Product Name and Price are required.');
      return;
    }

    const payload: ProductPayload = {
      name,
      price: price,
      stock: parseInt(stock, 10) || 0,
      description,
      image_url: imageUrl,
      thumbnail: imageUrl,
      is_in_stock: isInStock,
      is_featured: isFeatured,
      ...(categoryId ? { category_id: parseInt(categoryId, 10) } : {}),
    };

    try {
      if (isEditing && product) {
        await updateMutation.mutateAsync({ idOrSlug: product.id, data: payload });
        toast.success('Product updated successfully!');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Product created successfully!');
      }
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to save product.';
      toast.error(msg);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Product: ${product.name}` : 'Add New Product'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Product Name *"
            placeholder="e.g. Dell XPS 15 Laptop"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Price (SGD) *"
            type="number"
            step="0.01"
            placeholder="e.g. 1499.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Stock Quantity"
            type="number"
            placeholder="e.g. 15"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Product Image URL"
          placeholder="https://images.unsplash.com/... or /media/products/..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <Textarea
          label="Description"
          placeholder="Detailed product specifications, features, and condition..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isInStock}
              onChange={(e) => setIsInStock(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
            />
            <span className="text-sm font-semibold text-gray-700">In Stock</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
            />
            <span className="text-sm font-semibold text-gray-700">Featured Product</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
