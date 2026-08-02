import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from || '/admin';

  // If already logged in as staff, redirect directly to admin dashboard
  React.useEffect(() => {
    if (user && user.is_staff) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      // Wait briefly for auth context to update user details
      toast.success('Admin login successful!');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Invalid credentials or non-admin account.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary-600/20 border border-primary-500/40 text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">Lexicon Admin</h1>
          <p className="text-xs text-slate-400">Sign in with an administrator account to access the dashboard</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Admin Email"
            type="email"
            placeholder="admin@lexicon.sg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail size={16} className="text-slate-500" />}
            required
            className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-primary-500"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock size={16} className="text-slate-500" />}
            required
            className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-primary-500"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full mt-2 font-bold py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-600/25"
          >
            Access Dashboard
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
