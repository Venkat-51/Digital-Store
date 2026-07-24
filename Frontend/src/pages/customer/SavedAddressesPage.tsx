import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  MapPin, Plus, Pencil, Trash2, ArrowLeft, Check, CheckCircle2, ChevronRight, X, Phone, Home, Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { profileService } from '@/services/profile.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/States';
import type { Address } from '@/types/user.types';
import { cn } from '@/utils/helpers';

const addressSchema = z.object({
  label: z.string().min(2, 'Label required (e.g. Home, Office)'),
  full_name: z.string().min(2, 'Recipient name required'),
  phone: z.string().min(8, 'Valid phone number required'),
  address_line1: z.string().min(5, 'Address line 1 required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State/Region required'),
  postal_code: z.string().min(5, 'Postal code required'),
  country: z.string().min(2, 'Country required'),
});
type AddressForm = z.infer<typeof addressSchema>;

const SavedAddressesPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Fetch addresses
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PROFILE, 'addresses'],
    queryFn: () => profileService.getAddresses(),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  });

  // Create address mutation
  const { mutate: createAddress, isPending: isCreating } = useMutation({
    mutationFn: profileService.createAddress,
    onSuccess: () => {
      toast.success('Address added successfully!');
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILE, 'addresses'] });
      closeModal();
    },
    onError: () => toast.error('Failed to add address.'),
  });

  // Update address mutation
  const { mutate: updateAddress, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Address> }) =>
      profileService.updateAddress(id, payload),
    onSuccess: () => {
      toast.success('Address updated successfully!');
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILE, 'addresses'] });
      closeModal();
    },
    onError: () => toast.error('Failed to update address.'),
  });

  // Delete address mutation
  const { mutate: deleteAddress } = useMutation({
    mutationFn: profileService.deleteAddress,
    onSuccess: () => {
      toast.success('Address deleted successfully!');
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILE, 'addresses'] });
    },
    onError: () => toast.error('Failed to delete address.'),
  });

  // Set default address mutation
  const { mutate: setDefaultAddress } = useMutation({
    mutationFn: profileService.setDefaultAddress,
    onSuccess: () => {
      toast.success('Default address updated!');
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILE, 'addresses'] });
    },
    onError: () => toast.error('Failed to update default address.'),
  });

  const openAddModal = () => {
    setEditingAddress(null);
    reset({
      label: '',
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: 'Singapore',
      state: 'Singapore',
      postal_code: '',
      country: 'Singapore',
    });
    setIsOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    reset({
      label: addr.label,
      full_name: addr.full_name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country,
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingAddress(null);
  };

  const onSubmit = (data: AddressForm) => {
    if (editingAddress) {
      updateAddress({ id: editingAddress.id, payload: data });
    } else {
      createAddress({ ...data, is_default: addresses.length === 0 });
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto font-sans">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Saved Addresses</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Manage your shipping and delivery destinations</p>
        </div>
        <Button
          onClick={openAddModal}
          leftIcon={<Plus size={16} />}
          size="sm"
          className="rounded-2xl"
        >
          Add New Address
        </Button>
      </div>

      {/* Main Address List */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <Skeleton className="h-44 w-full" rounded="rounded-3xl" />
          <Skeleton className="h-44 w-full" rounded="rounded-3xl" />
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin size={32} />}
          title="No addresses saved"
          description="Please add a shipping address to speed up your checkout process."
          action={{ label: 'Add New Address', onClick: openAddModal }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                "bg-white rounded-3xl p-6 border transition-all relative flex flex-col justify-between gap-4 shadow-2xs hover:shadow-sm",
                addr.is_default ? "border-primary-500 ring-2 ring-primary-500/10" : "border-gray-100"
              )}
            >
              {/* Card Title & Label */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
                      {addr.label.toLowerCase() === 'home' ? (
                        <Home size={15} />
                      ) : addr.label.toLowerCase() === 'office' || addr.label.toLowerCase() === 'work' ? (
                        <Briefcase size={15} />
                      ) : (
                        <MapPin size={15} />
                      )}
                    </span>
                    <h3 className="font-extrabold text-gray-900 text-sm">{addr.label}</h3>
                  </div>
                  {addr.is_default && (
                    <span className="bg-emerald-50 text-emerald-700 text-3xs font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-emerald-100">
                      <Check size={10} /> Default
                    </span>
                  )}
                </div>

                {/* Recipient info & Address */}
                <div className="mt-4 space-y-1 text-xs text-gray-600 font-medium leading-relaxed">
                  <p className="font-bold text-gray-900 text-sm mb-1">{addr.full_name}</p>
                  <p>{addr.address_line1}</p>
                  {addr.address_line2 && <p>{addr.address_line2}</p>}
                  <p>{addr.city}, {addr.postal_code}</p>
                  <p className="text-gray-400 mt-2 flex items-center gap-1">
                    <Phone size={12} /> {addr.phone}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                {!addr.is_default ? (
                  <button
                    onClick={() => setDefaultAddress(addr.id)}
                    className="text-2xs font-bold text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    Set as Default
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openEditModal(addr)}
                    className="text-gray-400 hover:text-primary-600 transition-colors p-1"
                    aria-label="Edit address"
                  >
                    <Pencil size={15} />
                  </button>
                  {!addr.is_default && (
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      aria-label="Delete address"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  {...register('label')}
                  label="Address Tag / Label"
                  placeholder="e.g. Home, Office"
                  error={errors.label?.message}
                />
                <Input
                  {...register('full_name')}
                  label="Recipient Full Name"
                  placeholder="e.g. John Doe"
                  error={errors.full_name?.message}
                />
              </div>

              <Input
                {...register('phone')}
                label="Phone Number"
                placeholder="e.g. +65 9123 4567"
                error={errors.phone?.message}
              />

              <Input
                {...register('address_line1')}
                label="Address Line 1"
                placeholder="Street name, building, apartment number"
                error={errors.address_line1?.message}
              />

              <Input
                {...register('address_line2')}
                label="Address Line 2 (Optional)"
                placeholder="Unit number, lobby name, floor"
                error={errors.address_line2?.message}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  {...register('city')}
                  label="City"
                  placeholder="e.g. Singapore"
                  error={errors.city?.message}
                />
                <Input
                  {...register('state')}
                  label="State / Region"
                  placeholder="e.g. Singapore"
                  error={errors.state?.message}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  {...register('postal_code')}
                  label="Postal Code"
                  placeholder="e.g. 123456"
                  error={errors.postal_code?.message}
                />
                <Input
                  {...register('country')}
                  label="Country"
                  placeholder="e.g. Singapore"
                  error={errors.country?.message}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <Button variant="outline" size="sm" onClick={closeModal} type="button">
                  Cancel
                </Button>
                <Button size="sm" type="submit" isLoading={isCreating || isUpdating}>
                  {editingAddress ? 'Save Changes' : 'Add Address'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedAddressesPage;
