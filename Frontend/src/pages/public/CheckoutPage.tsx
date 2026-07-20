import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ShoppingBag, User, Mail, Phone, Building2, MapPin, FileText, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { ordersService } from '@/services/orders.service';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Breadcrumb } from '@/components/ui/Navigation';
import { EmptyState } from '@/components/ui/States';
import { ROUTES, buildRoute } from '@/constants/routes';
import { formatPrice } from '@/utils/formatters';

const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'Name is required'),
  company_name: z.string().optional(),
  customer_email: z.string().email('Valid email required'),
  customer_phone: z.string().min(8, 'Phone number required'),
  address_line1: z.string().min(5, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  postal_code: z.string().min(4, 'Postal code required'),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const CheckoutPage: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { city: 'Singapore', postal_code: '' },
  });

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: (data: CheckoutFormData) =>
      ordersService.create({
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        customer_name: data.customer_name,
        company_name: data.company_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        shipping_address: {
          full_name: data.customer_name,
          phone: data.customer_phone,
          address_line1: data.address_line1,
          address_line2: data.address_line2,
          city: data.city,
          state: data.state ?? '',
          postal_code: data.postal_code,
          country: 'Singapore',
        },
        notes: data.notes,
      }),
    onSuccess: (order) => {
      clearCart();
      navigate(buildRoute.orderSuccess(order.order_number));
    },
    onError: () => toast.error('Failed to place order. Please try again.'),
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <EmptyState
          icon={<ShoppingBag size={32} />}
          title="Your cart is empty"
          description="Add products to your cart before checking out."
          action={{ label: 'Start Shopping', onClick: () => navigate(ROUTES.SHOP) }}
        />
      </div>
    );
  }

  const shipping = parseFloat(subtotal.replace('$', '')) >= 80 ? 0 : 5.99;
  const subtotalNum = parseFloat(subtotal.replace('$', ''));
  const total = subtotalNum + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="container-wide">
          <Breadcrumb items={[{ label: 'Cart', href: ROUTES.CART }, { label: 'Checkout' }]} />
          <h1 className="text-3xl font-black text-gray-900 mt-3">Checkout</h1>
        </div>
      </div>

      <div className="container-wide py-8">
        <form onSubmit={handleSubmit((d) => placeOrder(d))}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Details */}
              <div className="card p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 bg-primary-100 rounded-xl flex items-center justify-center">
                    <User size={16} className="text-primary-600" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">Customer Details</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    placeholder="John Tan"
                    error={errors.customer_name?.message}
                    {...register('customer_name')}
                  />
                  <Input
                    label="Company Name"
                    placeholder="Acme Pte Ltd (optional)"
                    error={errors.company_name?.message}
                    {...register('company_name')}
                  />
                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="john@example.com"
                    leftIcon={<Mail size={15} />}
                    error={errors.customer_email?.message}
                    {...register('customer_email')}
                  />
                  <Input
                    label="Phone Number *"
                    type="tel"
                    placeholder="+65 9123 4567"
                    leftIcon={<Phone size={15} />}
                    error={errors.customer_phone?.message}
                    {...register('customer_phone')}
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="card p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 bg-secondary-100 rounded-xl flex items-center justify-center">
                    <MapPin size={16} className="text-secondary-600" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">Shipping Address</h2>
                </div>
                <div className="space-y-4">
                  <Input
                    label="Address Line 1 *"
                    placeholder="123 Orchard Road, #01-234"
                    error={errors.address_line1?.message}
                    {...register('address_line1')}
                  />
                  <Input
                    label="Address Line 2"
                    placeholder="Building name (optional)"
                    {...register('address_line2')}
                  />
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Input
                      label="City *"
                      placeholder="Singapore"
                      error={errors.city?.message}
                      {...register('city')}
                    />
                    <Input
                      label="State / Region"
                      placeholder="—"
                      {...register('state')}
                    />
                    <Input
                      label="Postal Code *"
                      placeholder="238859"
                      error={errors.postal_code?.message}
                      {...register('postal_code')}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="card p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                    <FileText size={16} className="text-gray-500" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">Order Notes</h2>
                </div>
                <Textarea
                  placeholder="Special instructions, delivery preferences…"
                  rows={3}
                  {...register('notes')}
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-5">
              <div className="card p-5 sticky top-24">
                <h2 className="text-base font-bold text-gray-900 mb-5">Order Summary</h2>
                
                {/* Items */}
                <div className="space-y-3 mb-5 max-h-72 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.thumbnail || '/placeholder-product.png'}
                          alt={item.product.name}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">{item.product.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                        ${parseFloat(item.total_price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold text-gray-900">{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-semibold text-gray-900">
                      {shipping === 0 ? <span className="text-success-600">Free</span> : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-black border-t border-gray-100 pt-3">
                    <span className="text-gray-900">Total</span>
                    <span className="text-primary-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  type="submit"
                  isLoading={isPending}
                  rightIcon={<ArrowRight size={16} />}
                  className="mt-5"
                >
                  Place Order
                </Button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  By placing your order, you agree to our{' '}
                  <a href={ROUTES.TERMS} className="text-primary-600 hover:underline">Terms</a> and{' '}
                  <a href={ROUTES.PRIVACY} className="text-primary-600 hover:underline">Privacy Policy</a>.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
