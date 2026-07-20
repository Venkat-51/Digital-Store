import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import HorizontalCategoryBar from '@/components/home/HorizontalCategoryBar';
import ProductGrid from '@/components/product/ProductGrid';
import { useProducts } from '@/hooks/useProducts';

const TESTIMONIALS = [
  { name: 'Sarah Tan', role: 'IT Manager, DBS Bank', rating: 5, text: 'Lexicon consistently delivers top quality hardware. Their corporate pricing and fast delivery make procurement seamless.' },
  { name: 'Michael Lim', role: 'Gamer & Content Creator', rating: 5, text: 'Amazing selection of gaming peripherals. Got my setup upgraded within 2 days. 100% authentic products!' },
  { name: 'Priya Nair', role: 'Startup Founder', rating: 5, text: 'Best place for office tech. Bought 20 units for my team. Great pricing and excellent after-sales support.' },
];

const HomePage: React.FC = () => {
  // Fetch all products for the continuous feed
  const { data: paginatedData, isLoading } = useProducts({ limit: 40 });
  const products = paginatedData?.results || [];

  return (
    <>
      <Helmet>
        <title>Lexicon Technology — Premium Tech Products in Singapore</title>
        <meta name="description" content="Shop premium computer accessories, gaming gear, data storage, and networking solutions at Lexicon Technology." />
      </Helmet>

      {/* New Horizontal Category Bar */}
      <HorizontalCategoryBar />

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
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-gray-50 border-t border-gray-100" aria-labelledby="testimonials-heading">
        <div className="container-wide">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-2">Customer Stories</p>
            <h2 id="testimonials-heading" className="text-4xl font-black text-gray-900 tracking-tight">
              Loved by 50,000+ Customers
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card p-6 border-gray-100 border hover:shadow-card-hover transition-shadow duration-300 bg-white"
              >
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-primary-500 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
