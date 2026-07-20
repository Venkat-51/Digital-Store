import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormData = z.infer<typeof schema>;

const ForgotPasswordPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-success-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-success-500" />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">Check your email</h2>
        <p className="text-sm text-gray-500 mb-6">
          We sent a password reset link to <strong>{getValues('email')}</strong>
        </p>
        <Link to={ROUTES.LOGIN}>
          <Button variant="outline" size="md" fullWidth leftIcon={<ArrowLeft size={16} />}>
            Back to Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-2">Forgot Password?</h1>
        <p className="text-sm text-gray-500">Enter your email and we'll send you a reset link.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input id="forgot-email" label="Email Address" type="email" placeholder="you@example.com" leftIcon={<Mail size={16} />} error={errors.email?.message} {...register('email')} />
        <Button variant="primary" size="lg" fullWidth type="submit" isLoading={isLoading}>
          Send Reset Link
        </Button>
      </form>
      <div className="text-center mt-5">
        <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700">
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
