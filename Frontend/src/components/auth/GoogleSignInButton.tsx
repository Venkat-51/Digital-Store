import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

export const GoogleSignInButton: React.FC = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsPending(true);
      try {
        const token = tokenResponse.access_token;
        let profileData: any = {};
        if (token) {
          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${token}` },
            });
            profileData = await res.json();
          } catch (e) {
            console.error('Failed to fetch userinfo from Google', e);
          }
        }
        const user = await googleLogin({
          token,
          email: profileData.email,
          first_name: profileData.given_name || profileData.name,
          last_name: profileData.family_name,
          avatar: profileData.picture,
        });
        toast.success(`Welcome, ${user?.first_name || 'User'}!`);
        navigate(ROUTES.HOME);
      } catch {
        toast.error('Google authentication failed on server.');
      } finally {
        setIsPending(false);
      }
    },
    onError: () => {
      toast.error('Google Sign-in failed or origin not authorized in Google Console.');
    },
  });

  return (
    <div className="w-full flex justify-center py-1">
      <button
        type="button"
        onClick={() => loginWithGoogle()}
        disabled={isPending}
        className="w-full max-w-[260px] mx-auto flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-full border border-gray-300 bg-white text-gray-800 font-extrabold text-sm shadow-xs hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
      >
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span className="truncate">{isPending ? 'Connecting...' : 'Continue with Google'}</span>
      </button>
    </div>
  );
};

export default GoogleSignInButton;
