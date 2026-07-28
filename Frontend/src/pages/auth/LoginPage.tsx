import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user?.first_name || 'User'}!`);
      navigate(ROUTES.HOME);
    } catch {
      toast.error('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-2">Welcome back</h1>
        <p className="text-sm text-gray-500">Sign in to your Lexicon account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="login-email"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail size={16} />}
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          id="login-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button type="button" onClick={() => setShowPassword((p) => !p)} className="hover:text-gray-700">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex justify-end">
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs font-semibold text-primary-600 hover:text-primary-700">
            Forgot password?
          </Link>
        </div>

        <Button variant="primary" size="lg" fullWidth type="submit" isLoading={isLoading} rightIcon={<ArrowRight size={16} />}>
          Sign In
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-xs text-gray-400 font-medium">or continue with</span>
        </div>
      </div>

      {/* Google Login Button */}
      <GoogleSignInButton />

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} className="font-bold text-primary-600 hover:text-primary-700">
          Sign up free
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
