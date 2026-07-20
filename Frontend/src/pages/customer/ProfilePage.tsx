import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Camera, User, Mail, Phone, Lock } from 'lucide-react';
import { profileService } from '@/services/profile.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
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
  const { user, updateUser } = useAuth();
  const qc = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: user?.first_name, last_name: user?.last_name, email: user?.email, phone: user?.phone },
  });

  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, formState: { errors: pwdErrors } } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (updated) => { updateUser(updated); toast.success('Profile updated!'); qc.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILE] }); },
    onError: () => toast.error('Failed to update profile.'),
  });

  const { mutate: changePassword, isPending: changingPwd } = useMutation({
    mutationFn: profileService.changePassword,
    onSuccess: () => { toast.success('Password changed!'); resetPwd(); },
    onError: () => toast.error('Incorrect current password.'),
  });

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-xl font-black text-gray-900 mb-6">My Profile</h1>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
              {user?.first_name?.[0]?.toUpperCase()}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg">
              <Camera size={14} />
            </button>
          </div>
          <div>
            <p className="font-bold text-gray-900">{user?.first_name} {user?.last_name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit((d) => updateProfile(d))} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input id="prof-first" label="First Name" leftIcon={<User size={15} />} error={errors.first_name?.message} {...register('first_name')} />
            <Input id="prof-last" label="Last Name" error={errors.last_name?.message} {...register('last_name')} />
          </div>
          <Input id="prof-email" label="Email" type="email" leftIcon={<Mail size={15} />} error={errors.email?.message} {...register('email')} />
          <Input id="prof-phone" label="Phone" type="tel" leftIcon={<Phone size={15} />} {...register('phone')} />
          <Button variant="primary" type="submit" isLoading={isPending}>Save Changes</Button>
        </form>
      </div>

      {/* Password Change */}
      <div className="card p-6">
        <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2"><Lock size={18} /> Change Password</h2>
        <form onSubmit={handlePwd((d) => changePassword(d))} className="space-y-4 max-w-md">
          <Input id="old-pwd" label="Current Password" type="password" error={pwdErrors.old_password?.message} {...regPwd('old_password')} />
          <Input id="new-pwd" label="New Password" type="password" error={pwdErrors.new_password?.message} {...regPwd('new_password')} />
          <Button variant="outline" type="submit" isLoading={changingPwd}>Update Password</Button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
