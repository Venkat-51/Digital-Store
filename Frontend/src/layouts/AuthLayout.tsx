import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '@/constants/routes';

const AuthLayout: React.FC = () => (
  <div className="min-h-screen bg-gradient-mesh bg-gray-50 flex flex-col">
    {/* Top bar */}
    <nav className="py-4 px-6">
      <Link to={ROUTES.HOME} className="inline-block" aria-label="Home">
        <img
          src="/logo.png"
          alt="Lexicon Technology Pte Ltd"
          className="h-10 w-auto object-contain"
        />
      </Link>
    </nav>

    {/* Content */}
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Outlet />
      </motion.div>
    </div>

    {/* Footer note */}
    <div className="py-6 text-center text-xs text-gray-400">
      © {new Date().getFullYear()} Lexicon Technology Pte Ltd
    </div>
  </div>
);

export default AuthLayout;
