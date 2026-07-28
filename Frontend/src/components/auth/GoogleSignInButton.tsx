import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

export const GoogleSignInButton: React.FC = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: any) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast.error('Google Sign-in failed: No credential received.');
      return;
    }
    try {
      const user = await googleLogin(idToken);
      toast.success(`Welcome, ${user?.first_name || 'User'}!`);
      navigate(ROUTES.HOME);
    } catch {
      toast.error('Google Authentication failed on server.');
    }
  };

  const handleError = () => {
    toast.error('Google Sign-in was cancelled or failed.');
  };

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="outline"
        shape="rectangular"
        size="large"
        width="100%"
        text="continue_with"
      />
    </div>
  );
};

export default GoogleSignInButton;
