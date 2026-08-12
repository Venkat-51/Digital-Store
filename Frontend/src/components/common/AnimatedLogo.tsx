import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  showText?: boolean;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  variant = 'light',
  className = 'h-9 w-auto',
  showText = true,
}) => {
  const isDark = variant === 'dark';

  return (
    <motion.div
      className={`relative inline-flex items-center gap-2.5 select-none cursor-pointer group ${className}`}
      initial="initial"
      whileHover="hover"
      animate="animate"
    >
      {/* Dynamic Background Glow Effect */}
      <motion.div
        className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 opacity-20 blur-md transition-all duration-500 group-hover:opacity-60 group-hover:blur-lg"
        variants={{
          hover: { scale: 1.08 },
        }}
      />

      {/* SVG Icon Emblem */}
      <div className="relative flex items-center justify-center">
        <svg
          width="44"
          height="42"
          viewBox="0 0 48 46"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-auto h-full max-h-full drop-shadow-md"
        >
          <defs>
            {/* Linear Gradient for Mark */}
            <linearGradient id="lexiconGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            {/* Accent Shimmer Gradient */}
            <linearGradient id="lexiconGradAccent" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Main Stylized Emblem Shape */}
          <motion.path
            d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
            fill="url(#lexiconGradPrimary)"
            variants={{
              initial: { scale: 0.95, opacity: 0.9 },
              hover: { scale: 1.03, opacity: 1 },
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Animated Energetic Stroke Overlay */}
          <motion.path
            d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
            fill="none"
            stroke="url(#lexiconGradAccent)"
            strokeWidth="1.8"
            strokeDasharray="120 40"
            animate={{
              strokeDashoffset: [0, -160],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Glowing Pulse Dot Accent */}
          <motion.circle
            cx="25.5"
            cy="11.5"
            r="3"
            fill="#38bdf8"
            filter="url(#logoGlow)"
            animate={{
              r: [2.5, 4, 2.5],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>

      {/* Typography Text */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center">
            <span
              className={`font-black tracking-wider text-lg sm:text-xl font-sans transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              LEXICON
            </span>
            <motion.span
              className="inline-block ml-1 text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-500"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              •
            </motion.span>
          </div>
          <span
            className={`text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase transition-colors duration-300 ${
              isDark ? 'text-purple-300/80' : 'text-purple-900/80'
            }`}
          >
            TECHNOLOGY
          </span>
        </div>
      )}
    </motion.div>
  );
};
