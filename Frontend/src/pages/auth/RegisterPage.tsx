import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

const registerSchema = z
  .object({
    first_name: z.string().min(2, 'First name required'),
    last_name: z.string().min(2, 'Last name required'),
    email: z.string().email('Valid email required'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirm: z.string(),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: "Passwords don't match",
    path: ['password_confirm'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast.success('Account created! Welcome to Lexicon!');
      navigate(ROUTES.HOME);
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-2">Create Account</h1>
        <p className="text-sm text-gray-500">Join thousands of happy Lexicon customers</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input id="first_name" label="First Name" placeholder="John" leftIcon={<User size={16} />} error={errors.first_name?.message} {...register('first_name')} />
          <Input id="last_name" label="Last Name" placeholder="Tan" error={errors.last_name?.message} {...register('last_name')} />
        </div>
        <Input id="reg-email" label="Email" type="email" placeholder="you@example.com" leftIcon={<Mail size={16} />} error={errors.email?.message} {...register('email')} />
        <Input id="phone" label="Phone (optional)" type="tel" placeholder="+65 9123 4567" leftIcon={<Phone size={16} />} error={errors.phone?.message} {...register('phone')} />
        <Input
          id="reg-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min. 8 characters"
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button type="button" onClick={() => setShowPassword((p) => !p)}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          id="password_confirm"
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Repeat password"
          leftIcon={<Lock size={16} />}
          error={errors.password_confirm?.message}
          {...register('password_confirm')}
        />

        <Button variant="primary" size="lg" fullWidth type="submit" isLoading={isLoading} rightIcon={<ArrowRight size={16} />}>
          Create Account
        </Button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-4">
        By registering, you agree to our{' '}
        <Link to={ROUTES.TERMS} className="text-primary-600 hover:underline">Terms</Link> and{' '}
        <Link to={ROUTES.PRIVACY} className="text-primary-600 hover:underline">Privacy Policy</Link>.
      </p>

      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-bold text-primary-600 hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
