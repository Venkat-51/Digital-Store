import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  User, Mail, Phone, Lock, Pencil, ShoppingBag, Heart, MapPin,
  ChevronRight, LogOut, X, Shield, Camera
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWishlist } from '@/hooks/useWishlist';
import { profileService } from '@/services/profile.service';
import { ordersService } from '@/services/orders.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { ROUTES } from '@/constants/routes';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/helpers';

const profileSchema = z.object({
  first_name: z.string().min(2, 'First name required'),
  last_name: z.string().min(1, 'Last name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  old_password: z.string().min(1, 'Current password required'),
  new_password: z.string().min(8, 'Min 8 characters'),
}).refine((d) => d.old_password !== d.new_password, { message: 'New password must differ', path: ['new_password'] });
type PasswordForm = z.infer<typeof passwordSchema>;

const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: ordersData } = useQuery({
    queryKey: [QUERY_KEYS.ORDERS],
    queryFn: () => ordersService.getAll(),
  });
  const ordersCount = ordersData?.results?.length || 0;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, formState: { errors: pwdErrors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (updated) => {
      updateUser(updated);
      toast.success('Profile updated successfully!');
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILE] });
      setIsEditModalOpen(false);
    },
    onError: () => toast.error('Failed to update profile.'),
  });

  const { mutate: changePassword, isPending: changingPwd } = useMutation({
    mutationFn: profileService.changePassword,
    onSuccess: () => {
      toast.success('Password updated successfully!');
      resetPwd();
      setIsPasswordModalOpen(false);
    },
    onError: () => toast.error('Incorrect current password.'),
  });

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully.');
    navigate(ROUTES.HOME);
  };

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : 'Customer';

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 font-sans">
      {/* Top Banner (Vibrant Gradient Blue Accent) */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-600/10 relative overflow-hidden">
        {/* Subtle Decorative Elements */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-blue-300/20 rounded-full blur-xl pointer-events-none" />

        {/* User Info Header */}
        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-black border-2 border-white/40 shadow-inner flex-shrink-0">
              {user?.first_name?.[0]?.toUpperCase() || <User size={28} />}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-white truncate tracking-tight">
                {displayName}
              </h1>
              <p className="text-xs sm:text-sm text-white/90 font-medium truncate mt-0.5">
                {user?.email || 'Add your profile details'}
              </p>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="w-11 h-11 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all shadow-md active:scale-95 flex-shrink-0"
            aria-label="Edit Profile"
          >
            <Pencil size={18} />
          </button>
        </div>

        {/* 3 Metric Stat Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-7 relative z-10">
          <Link
            to={ROUTES.ORDERS}
            className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-3.5 sm:p-4 text-center transition-all hover:bg-white/30 active:scale-95 group"
          >
            <p className="text-xl sm:text-2xl font-black text-white group-hover:scale-105 transition-transform">
              {ordersCount}
            </p>
            <p className="text-xs font-bold text-white/90 mt-0.5">Orders</p>
          </Link>

          <Link
            to={ROUTES.WISHLIST}
            className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-3.5 sm:p-4 text-center transition-all hover:bg-white/30 active:scale-95 group"
          >
            <p className="text-xl sm:text-2xl font-black text-white group-hover:scale-105 transition-transform">
              {wishlistCount}
            </p>
            <p className="text-xs font-bold text-white/90 mt-0.5">Wishlist</p>
          </Link>

          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-3.5 sm:p-4 text-center transition-all">
            <p className="text-xl sm:text-2xl font-black text-white">0</p>
            <p className="text-xs font-bold text-white/90 mt-0.5">Reviews</p>
          </div>
        </div>
      </div>

      {/* MY ACTIVITY SECTION */}
      <div>
        <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest px-2 mb-3">
          MY ACTIVITY
        </h2>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
          {/* My Orders */}
          <Link
            to={ROUTES.ORDERS}
            className="flex items-center gap-4 p-4 hover:bg-gray-50/80 transition-colors group"
          >
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <ShoppingBag size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-gray-900 leading-tight">My Orders</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Track & view past orders</p>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-600 transition-colors ml-auto flex-shrink-0" />
          </Link>

          {/* Wishlist */}
          <Link
            to={ROUTES.WISHLIST}
            className="flex items-center gap-4 p-4 hover:bg-gray-50/80 transition-colors group"
          >
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Heart size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-gray-900 leading-tight">Wishlist</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Items saved for later</p>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-600 transition-colors ml-auto flex-shrink-0" />
          </Link>

          {/* Saved Addresses */}
          <Link
            to={ROUTES.ADDRESSES}
            className="flex items-center gap-4 p-4 hover:bg-gray-50/80 transition-colors group"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <MapPin size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-gray-900 leading-tight">Saved Addresses</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Manage delivery addresses</p>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-600 transition-colors ml-auto flex-shrink-0" />
          </Link>
        </div>
      </div>

      {/* ACCOUNT & SECURITY SECTION */}
      <div>
        <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest px-2 mb-3">
          SETTINGS & SECURITY
        </h2>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
          {/* Edit Profile */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50/80 transition-colors text-left group"
          >
            <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <User size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-gray-900 leading-tight">Personal Details</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Update name, email & phone number</p>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-600 transition-colors ml-auto flex-shrink-0" />
          </button>

          {/* Change Password */}
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50/80 transition-colors text-left group"
          >
            <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Lock size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-gray-900 leading-tight">Security & Password</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Change your account password</p>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-600 transition-colors ml-auto flex-shrink-0" />
          </button>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 hover:bg-red-50/80 transition-colors text-left group"
          >
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <LogOut size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-red-600 leading-tight">Sign Out</p>
              <p className="text-xs text-red-400 font-medium mt-0.5">Log out from this device</p>
            </div>
            <ChevronRight size={18} className="text-red-300 group-hover:text-red-500 transition-colors ml-auto flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900">Edit Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit((d) => updateProfile(d))} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="prof-first"
                  label="First Name"
                  leftIcon={<User size={15} />}
                  error={errors.first_name?.message}
                  {...register('first_name')}
                />
                <Input
                  id="prof-last"
                  label="Last Name"
                  error={errors.last_name?.message}
                  {...register('last_name')}
                />
              </div>
              <Input
                id="prof-email"
                label="Email Address"
                type="email"
                leftIcon={<Mail size={15} />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                id="prof-phone"
                label="Phone Number"
                type="tel"
                leftIcon={<Phone size={15} />}
                {...register('phone')}
              />
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isPending}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Lock size={18} className="text-primary-600" />
                Change Password
              </h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePwd((d) => changePassword(d))} className="space-y-4">
              <Input
                id="old-pwd"
                label="Current Password"
                type="password"
                error={pwdErrors.old_password?.message}
                {...regPwd('old_password')}
              />
              <Input
                id="new-pwd"
                label="New Password"
                type="password"
                error={pwdErrors.new_password?.message}
                {...regPwd('new_password')}
              />
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={changingPwd}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
