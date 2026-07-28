import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AppRouter } from '@/routes';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '579142027944-pfrgbjnggpgi1p1t51ajfqb726pulo51.apps.googleusercontent.com';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <AppRouter />
                <WhatsAppButton />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
