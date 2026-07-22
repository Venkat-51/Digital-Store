import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';    
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ArrowRight, ShoppingBag, Star, Truck, Shield, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

const TRUST_BADGES = [
  { icon: <Truck size={18} />, text: 'Free Delivery above $80' },
  { icon: <Shield size={18} />, text: '1-Year Warranty' },
  { icon: <Headphones size={18} />, text: '24/7 Support' },
];

const floatingCardData = [
  { top: '15%', right: '8%', delay: 0,    label: 'Trending',  value: '+38% sales',     color: 'from-primary-500 to-primary-700' },
  { top: '55%', right: '5%', delay: 0.3,  label: 'Products',  value: '2,500+',          color: 'from-secondary-500 to-secondary-700' },
  { top: '75%', left: '5%',  delay: 0.6,  label: 'Customers', value: '50K+ Happy',      color: 'from-green-500 to-green-700' },
];

const Hero: React.FC = () => {
  const bgRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Parallax orbs
    const ctx = gsap.context(() => {
      gsap.to(orbRef.current, {
        y: -40,
        x: 20,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });
    return () => ctx.revert();
  }, []);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
  };

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden bg-white"
      aria-label="Hero section"
    >
      {/* Background gradient mesh */}
      <div ref={bgRef} className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      {/* Animated orbs */}
      <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-primary-100/40 rounded-full blur-3xl pointer-events-none" />
      <div ref={orbRef} className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-secondary-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-primary-50/60 rounded-full blur-2xl pointer-events-none" />

      <div className="container-wide relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column — Text */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            {/* Pill badge */}
            <motion.div variants={itemVariants} className="inline-flex mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-full text-sm font-semibold text-primary-700">
                <Star size={14} fill="currentColor" />
                Singapore's #1 Tech Store
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.05] mb-6 text-balance"
            >
              Power Your
              <span className="block gradient-text">World with</span>
              Technology.
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-500 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              Discover premium computer accessories, storage, gaming gear, and networking solutions. 
              Quality tech, delivered to your door.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 justify-center lg:justify-start mb-10">
              <Button
                variant="primary"
                size="xl"
                rightIcon={<ArrowRight size={18} />}
                onClick={() => window.location.href = ROUTES.SHOP}
              >
                Shop Now
              </Button>
              <Button
                variant="outline"
                size="xl"
                leftIcon={<ShoppingBag size={18} />}
                onClick={() => window.location.href = ROUTES.CATEGORIES}
              >
                Browse Categories
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center lg:justify-start">
              {TRUST_BADGES.map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-primary-600">{badge.icon}</span>
                  {badge.text}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column — Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative hidden lg:block"
          >
            {/* Main visual card */}
            <div className="relative">
              <div className="w-full aspect-square max-w-[500px] mx-auto bg-gradient-to-br from-primary-600 to-primary-900 rounded-[3rem] shadow-2xl flex items-center justify-center p-12 overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute inset-0 opacity-10">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute border-2 border-white rounded-full"
                      style={{
                        width: `${(i + 1) * 33}%`,
                        height: `${(i + 1) * 33}%`,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        opacity: 1 - i * 0.3,
                      }}
                    />
                  ))}
                </div>

                {/* Central icon */}
                <div className="relative z-10 text-center">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-4 mx-auto">
                    <svg viewBox="0 0 64 64" className="w-12 h-12 text-white" fill="currentColor">
                      <rect x="4" y="8" width="56" height="36" rx="4" opacity="0.9"/>
                      <rect x="20" y="44" width="24" height="4" opacity="0.7"/>
                      <rect x="12" y="48" width="40" height="4" rx="2" opacity="0.6"/>
                      <rect x="8" y="12" width="48" height="28" rx="2" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
                    </svg>
                  </div>
                  <p className="text-white font-bold text-lg">Premium Tech</p>
                  <p className="text-white/60 text-sm">2,500+ Products</p>
                </div>
                {/* Animated ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-8 border border-white/10 rounded-full border-dashed"
                />
              </div>

              {/* Floating stat cards */}
              {floatingCardData.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + card.delay, duration: 0.5 }}
                  className="absolute glass rounded-2xl px-4 py-3 shadow-lg"
                  style={{ top: card.top, right: card.right, left: card.left }}
                >
                  <p className="text-2xs text-gray-400 font-semibold uppercase tracking-widest">{card.label}</p>
                  <p className="text-sm font-black text-gray-900">{card.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex flex-col items-center mt-16 gap-2"
        >
          <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 border-2 border-gray-300 rounded-full flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-gray-400 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
