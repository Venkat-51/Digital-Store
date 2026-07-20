import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, Users, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const STATS = [
  { value: '10+', label: 'Years in Business' },
  { value: '2,500+', label: 'Products' },
  { value: '50,000+', label: 'Happy Customers' },
  { value: '100+', label: 'Brand Partners' },
];

const TEAM = [
  { name: 'David Tan', role: 'CEO & Founder', initials: 'DT' },
  { name: 'Sarah Lim', role: 'Head of Operations', initials: 'SL' },
  { name: 'Michael Wong', role: 'Technical Director', initials: 'MW' },
];

const AboutPage: React.FC = () => (
  <div className="min-h-screen">
    {/* Hero */}
    <div className="bg-gradient-to-br from-gray-900 to-primary-900 text-white py-24">
      <div className="container-wide text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-primary-300 font-semibold text-sm uppercase tracking-widest mb-4">Our Story</p>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            Powering Singapore<br />with Premium Tech
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            Lexicon Technology was founded with a simple mission: make world-class technology accessible to everyone in Singapore, at honest prices, with outstanding service.
          </p>
        </motion.div>
      </div>
    </div>

    {/* Stats */}
    <div className="bg-primary-600 py-12">
      <div className="container-wide grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <p className="text-4xl font-black text-white">{s.value}</p>
            <p className="text-primary-200 text-sm mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Mission / Vision */}
    <div className="section bg-white">
      <div className="container-wide">
        <div className="grid md:grid-cols-2 gap-10">
          {[
            { icon: <Target size={28} />, title: 'Our Mission', text: 'To be Singapore\'s most trusted technology retailer by delivering authentic premium products with exceptional service and competitive pricing.' },
            { icon: <Award size={28} />, title: 'Our Vision', text: 'To empower every individual, business, and organisation in Singapore with the technology they need to thrive in a digital world.' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, x: i === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="card p-8">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 mb-5">{item.icon}</div>
              <h2 className="text-xl font-black text-gray-900 mb-3">{item.title}</h2>
              <p className="text-gray-500 leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>

    {/* Team */}
    <div className="section bg-gray-50">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-4">Meet Our Team</h2>
          <p className="text-gray-500">The passionate people behind Lexicon Technology.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {TEAM.map((member, i) => (
            <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">{member.initials}</div>
              <p className="font-bold text-gray-900">{member.name}</p>
              <p className="text-sm text-gray-400">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>

    {/* CTA */}
    <div className="py-20 bg-primary-600 text-white text-center">
      <h2 className="text-3xl font-black mb-4">Ready to Shop?</h2>
      <p className="text-primary-200 mb-8">Explore our 2,500+ premium tech products today.</p>
      <Link to={ROUTES.SHOP}>
        <button className="px-8 py-4 bg-white text-primary-700 font-black rounded-2xl hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
          Shop Now <ArrowRight size={18} />
        </button>
      </Link>
    </div>
  </div>
);

export default AboutPage;
