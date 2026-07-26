import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Heart, MapPin, Bell, Shield, Headphones, FileText,
  ShieldCheck, ChevronRight, LogOut, User, X, Check, Lock, Edit3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/profile.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';

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
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [isMobileEditOpen, setIsMobileEditOpen] = useState(false);

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : 'Lexicon User';

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  const { register, handleSubmit, formState: { errors }, reset: resetProfile } = useForm<ProfileForm>({
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
      setEditingPersonal(false);
      setEditingEmail(false);
      setEditingPhone(false);
      setIsMobileEditOpen(false);
    },
    onError: () => toast.error('Failed to update profile.'),
  });

  const { mutate: changePassword, isPending: changingPwd } = useMutation({
    mutationFn: profileService.changePassword,
    onSuccess: () => {
      toast.success('Password updated successfully!');
      resetPwd();
      setEditingPassword(false);
      setIsMobileEditOpen(false);
    },
    onError: () => toast.error('Incorrect current password.'),
  });

  return (
    <>
      {/* ================================================================= */}
      {/* MOBILE ONLY VIEW (< lg) - EXACT MATCH FOR USER REFERENCE DESIGN  */}
      {/* ================================================================= */}
      <div className="lg:hidden space-y-6 pb-8 font-sans">
        
        {/* 1. TOP USER HEADER CARD */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/90 flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-2xs">
              {user?.first_name?.[0]?.toUpperCase() || <User size={22} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 font-medium leading-none mb-0.5">Hello,</p>
              <h2 className="text-base font-bold text-gray-900 truncate leading-tight mb-0.5">
                {displayName}
              </h2>
              <p className="text-xs text-gray-500 truncate font-normal">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="bg-red-50 text-red-600 border border-red-100/80 hover:bg-red-100/80 px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-colors flex-shrink-0 shadow-2xs active:scale-95 ml-2"
          >
            <LogOut size={14} className="text-red-500 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* 2. MY ACTIVITY SECTION */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">
            MY ACTIVITY
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden divide-y divide-gray-100">
            
            {/* My Orders */}
            <Link
              to={ROUTES.ORDERS}
              className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-orange-50/90 text-orange-500 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    My Orders
                  </h4>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">Track & view past orders</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
            </Link>

            {/* Wishlist */}
            <Link
              to={ROUTES.WISHLIST}
              className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-pink-50/90 text-pink-500 flex items-center justify-center flex-shrink-0">
                  <Heart size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    Wishlist
                  </h4>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">Items saved for later</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
            </Link>

            {/* Saved Addresses */}
            <Link
              to={ROUTES.ADDRESSES}
              className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-blue-50/90 text-blue-500 flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    Saved Addresses
                  </h4>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">Manage delivery addresses</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
            </Link>
          </div>
        </div>

        {/* 3. SETTINGS SECTION */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">
            SETTINGS
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden divide-y divide-gray-100">
            
            {/* Notifications */}
            <button
              type="button"
              onClick={() => toast.success('Notification preferences updated')}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors text-left group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-purple-50/90 text-purple-500 flex items-center justify-center flex-shrink-0">
                  <Bell size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    Notifications
                  </h4>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">Manage alerts & offers</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
            </button>

            {/* Privacy & Security */}
            <button
              type="button"
              onClick={() => setIsMobileEditOpen(true)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors text-left group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-emerald-50/90 text-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Shield size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    Privacy & Security
                  </h4>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">Account protection</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
            </button>

            {/* Help & Support */}
            <Link
              to={ROUTES.FAQ}
              className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-sky-50/90 text-sky-500 flex items-center justify-center flex-shrink-0">
                  <Headphones size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    Help & Support
                  </h4>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">FAQs, Contact Support</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
            </Link>

            {/* Terms & Privacy */}
            <Link
              to={ROUTES.TERMS}
              className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-amber-50/90 text-amber-500 flex items-center justify-center flex-shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    Terms & Privacy
                  </h4>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">Terms of Service & Privacy Policy</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
            </Link>
          </div>
        </div>

        {/* 4. SECURITY INFO CARD */}
        <div className="bg-[#EFF5FF] rounded-2xl p-4 border border-blue-100 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-blue-950">Your account is secure</h4>
              <p className="text-xs text-blue-600/80 font-medium mt-0.5">We care about your data and privacy.</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-blue-500 flex-shrink-0" />
        </div>
      </div>

      {/* ================================================================= */}
      {/* DESKTOP ONLY VIEW (lg:block) - UNCHANGED DESKTOP FORM LAYOUT      */}
      {/* ================================================================= */}
      <div className="hidden lg:block bg-white rounded-sm p-8 shadow-2xs border border-gray-200/80 space-y-9 font-sans min-h-[400px]">
        {/* SECTION 1: PERSONAL INFORMATION */}
        <div className="space-y-4 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
            <button
              type="button"
              onClick={() => {
                if (editingPersonal) resetProfile();
                setEditingPersonal(!editingPersonal);
              }}
              className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              {editingPersonal ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <form onSubmit={handleSubmit((d) => updateProfile(d))} className="space-y-5">
            <div className="grid grid-cols-2 gap-4 max-w-2xl">
              <div>
                <input
                  type="text"
                  disabled={!editingPersonal}
                  {...register('first_name')}
                  placeholder="First Name"
                  className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:bg-white focus:border-primary-600 disabled:bg-gray-100/70 disabled:text-gray-600 transition-all"
                />
                {errors.first_name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.first_name.message}</p>}
              </div>
              <div>
                <input
                  type="text"
                  disabled={!editingPersonal}
                  {...register('last_name')}
                  placeholder="Last Name"
                  className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:bg-white focus:border-primary-600 disabled:bg-gray-100/70 disabled:text-gray-600 transition-all"
                />
                {errors.last_name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.last_name.message}</p>}
              </div>
            </div>

            {editingPersonal && (
              <Button
                type="submit"
                variant="primary"
                isLoading={isPending}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-8 py-2.5 rounded-sm shadow-2xs"
              >
                SAVE
              </Button>
            )}
          </form>
        </div>

        {/* SECTION 2: EMAIL ADDRESS */}
        <div className="space-y-4 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900">Email Address</h2>
            <button
              type="button"
              onClick={() => {
                if (editingEmail) resetProfile();
                setEditingEmail(!editingEmail);
              }}
              className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              {editingEmail ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <form onSubmit={handleSubmit((d) => updateProfile(d))} className="space-y-4 max-w-md">
            <input
              type="email"
              disabled={!editingEmail}
              {...register('email')}
              placeholder="Email Address"
              className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:bg-white focus:border-primary-600 disabled:bg-gray-100/70 disabled:text-gray-600 transition-all"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email.message}</p>}

            {editingEmail && (
              <Button
                type="submit"
                variant="primary"
                isLoading={isPending}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-8 py-2.5 rounded-sm shadow-2xs"
              >
                SAVE
              </Button>
            )}
          </form>
        </div>

        {/* SECTION 3: MOBILE NUMBER */}
        <div className="space-y-4 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900">Mobile Number</h2>
            <button
              type="button"
              onClick={() => {
                if (editingPhone) resetProfile();
                setEditingPhone(!editingPhone);
              }}
              className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              {editingPhone ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <form onSubmit={handleSubmit((d) => updateProfile(d))} className="space-y-4 max-w-md">
            <input
              type="tel"
              disabled={!editingPhone}
              {...register('phone')}
              placeholder="+65 Mobile Number"
              className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:bg-white focus:border-primary-600 disabled:bg-gray-100/70 disabled:text-gray-600 transition-all"
            />

            {editingPhone && (
              <Button
                type="submit"
                variant="primary"
                isLoading={isPending}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-8 py-2.5 rounded-sm shadow-2xs"
              >
                SAVE
              </Button>
            )}
          </form>
        </div>

        {/* SECTION 4: SECURITY & PASSWORD */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900">Security & Password</h2>
            <button
              type="button"
              onClick={() => {
                if (editingPassword) resetPwd();
                setEditingPassword(!editingPassword);
              }}
              className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              {editingPassword ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {editingPassword && (
            <form onSubmit={handlePwd((d) => changePassword(d))} className="space-y-4 max-w-md pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Current Password</label>
                <input
                  type="password"
                  {...regPwd('old_password')}
                  className="w-full bg-white border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-primary-600"
                />
                {pwdErrors.old_password && <p className="text-xs text-red-500 mt-1 font-medium">{pwdErrors.old_password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">New Password</label>
                <input
                  type="password"
                  {...regPwd('new_password')}
                  className="w-full bg-white border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-primary-600"
                />
                {pwdErrors.new_password && <p className="text-xs text-red-500 mt-1 font-medium">{pwdErrors.new_password.message}</p>}
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={changingPwd}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-8 py-2.5 rounded-sm shadow-2xs"
              >
                UPDATE PASSWORD
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* MOBILE EDIT PROFILE & SECURITY BOTTOM SHEET / MODAL               */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isMobileEditOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileEditOpen(false)}
              className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-[130] bg-white rounded-t-[28px] p-6 shadow-2xl lg:hidden max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Privacy & Security</h3>
                <button
                  onClick={() => setIsMobileEditOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Personal Information Edit */}
                <form onSubmit={handleSubmit((d) => updateProfile(d))} className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Profile Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      {...register('first_name')}
                      placeholder="First Name"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:bg-white focus:border-slate-900 outline-none"
                    />
                    <input
                      type="text"
                      {...register('last_name')}
                      placeholder="Last Name"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:bg-white focus:border-slate-900 outline-none"
                    />
                  </div>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="Email Address"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:bg-white focus:border-slate-900 outline-none"
                  />
                  <input
                    type="tel"
                    {...register('phone')}
                    placeholder="Phone Number"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:bg-white focus:border-slate-900 outline-none"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isPending}
                    className="w-full bg-gray-950 hover:bg-black text-white font-bold text-sm py-3 rounded-xl shadow-md"
                  >
                    Save Changes
                  </Button>
                </form>

                <div className="border-t border-gray-100 pt-4">
                  {/* Password Edit */}
                  <form onSubmit={handlePwd((d) => changePassword(d))} className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Change Password</h4>
                    <input
                      type="password"
                      {...regPwd('old_password')}
                      placeholder="Current Password"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:bg-white focus:border-slate-900 outline-none"
                    />
                    <input
                      type="password"
                      {...regPwd('new_password')}
                      placeholder="New Password (min 8 chars)"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:bg-white focus:border-slate-900 outline-none"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={changingPwd}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm py-3 rounded-xl shadow-md"
                    >
                      Update Password
                    </Button>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfilePage;
