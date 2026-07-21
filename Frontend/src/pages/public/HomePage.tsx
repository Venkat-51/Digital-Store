import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import HeroCarousel from '@/components/home/HeroCarousel';
import ProductGrid from '@/components/product/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { ROUTES } from '@/constants/routes';

const TESTIMONIALS = [
  { name: 'Sarah Tan', role: 'IT Manager, DBS Bank', rating: 5, text: 'Lexicon consistently delivers top quality hardware. Their corporate pricing and fast delivery make procurement seamless.' },
  { name: 'Michael Lim', role: 'Gamer & Content Creator', rating: 5, text: 'Amazing selection of gaming peripherals. Got my setup upgraded within 2 days. 100% authentic products!' },
  { name: 'Priya Nair', role: 'Startup Founder', rating: 5, text: 'Best place for office tech. Bought 20 units for my team. Great pricing and excellent after-sales support.' },
];

const HomePage: React.FC = () => {
  // Fetch top 4 products for the home screen
  const { data: paginatedData, isLoading } = useProducts({ page_size: 4 });
  const products = paginatedData?.results || [];

  return (
    <>
      <Helmet>
        <title>Lexicon Technology — Premium Tech Products in Singapore</title>
        <meta name="description" content="Shop premium computer accessories, gaming gear, data storage, and networking solutions at Lexicon Technology." />
      </Helmet>

      {/* Hero Carousel Banner */}
      <HeroCarousel />

      {/* Main E-commerce Product Feed */}
      <section className="section bg-white pt-8 pb-16">
        <div className="container-wide">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">We Think You'll Like</h1>
          </div>
          
          <ProductGrid 
            products={products} 
            isLoading={isLoading} 
          />

          {/* View More Button */}
          {!isLoading && products.length > 0 && (
            <div className="mt-12 flex justify-center">
              <Link 
                to={ROUTES.SHOP} 
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-primary-500 text-primary-600 font-bold rounded-2xl hover:bg-primary-50 transition-colors shadow-sm"
              >
                View More Products <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary-500" aria-label="Newsletter">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-black text-white mb-2">Stay in the Loop</h2>
              <p className="text-primary-200">Get exclusive deals, new arrivals, and tech news delivered to your inbox.</p>
            </div>
            <form className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:min-w-[400px]" onSubmit={(e) => e.preventDefault()}>
              <div className="relative flex-1">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 bg-white"
                />
              </div>
              <button className="px-6 py-3 bg-white text-primary-500 font-bold rounded-2xl hover:bg-gray-50 transition-colors" type="submit">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
