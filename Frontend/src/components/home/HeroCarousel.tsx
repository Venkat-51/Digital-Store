import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

const BANNER_IMAGES = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1600&q=80',
    title: 'Power Your Work',
    subtitle: 'Latest Laptops & Accessories'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&q=80',
    title: 'Ultimate Gaming Gear',
    subtitle: 'Upgrade Your Setup Today'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=1600&q=80',
    title: 'Premium Hardware',
    subtitle: 'Build Your Dream PC'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1600&q=80',
    title: 'Smart Home Devices',
    subtitle: 'Connect Your World'
  }
];

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % BANNER_IMAGES.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + BANNER_IMAGES.length) % BANNER_IMAGES.length);

  return (
    <section className="relative w-full h-[500px] overflow-hidden bg-gray-900 group" aria-label="Hero Carousel">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img 
            src={BANNER_IMAGES[currentIndex].url} 
            alt={BANNER_IMAGES[currentIndex].title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-4">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-black tracking-tight mb-4"
            >
              {BANNER_IMAGES[currentIndex].title}
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg md:text-2xl font-medium mb-8 text-gray-200 max-w-2xl"
            >
              {BANNER_IMAGES[currentIndex].subtitle}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                variant="primary"
                size="xl"
                onClick={() => window.location.href = ROUTES.SHOP}
              >
                Shop Now
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/30 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/30 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {BANNER_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentIndex ? 'w-8 bg-primary-500' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
