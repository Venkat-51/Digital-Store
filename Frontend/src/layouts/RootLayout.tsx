import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.15, ease: 'easeIn' as const } },
};

const RootLayout: React.FC = () => {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <CartDrawer />
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '14px',
            background: '#1f2937',
            color: '#f9fafb',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            padding: '12px 16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-1"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
};

export default RootLayout;
