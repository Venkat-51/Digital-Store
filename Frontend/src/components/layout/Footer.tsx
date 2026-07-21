import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight, Share2 } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { NAV_CATEGORIES } from '@/constants/config';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-primary-950 to-primary-600 text-white">
      {/* Main Footer */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to={ROUTES.HOME} className="inline-block mb-5 group bg-white rounded-xl p-2 shadow-sm">
              <img
                src="/logo-dark.png"
                alt="Lexicon Technology Pte Ltd"
                className="h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>
            <p className="text-sm leading-relaxed text-primary-100 mb-6">
              Your trusted partner for premium technology products in Singapore. We deliver excellence in every product.
            </p>
            <div className="flex gap-3">
              {[
                { label: 'Facebook' },
                { label: 'Twitter' },
                { label: 'Instagram' },
                { label: 'LinkedIn' },
                { label: 'YouTube' },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-9 h-9 bg-primary-800/50 rounded-xl flex items-center justify-center text-primary-200 hover:bg-white hover:text-primary-600 transition-all duration-200"
                >
                  <Share2 size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5">Categories</h3>
            <ul className="space-y-3">
              {NAV_CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/categories/${cat.slug}`}
                    className="text-sm text-primary-100 hover:text-white transition-colors underline-anim"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { to: ROUTES.SHOP,    label: 'Shop All Products' },
                { to: ROUTES.ABOUT,   label: 'About Us' },
                { to: ROUTES.CONTACT, label: 'Contact Us' },
                { to: ROUTES.FAQ,     label: 'FAQ' },
                { to: ROUTES.PRIVACY, label: 'Privacy Policy' },
                { to: ROUTES.TERMS,   label: 'Terms & Conditions' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-primary-100 hover:text-white transition-colors underline-anim"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5">Contact Us</h3>
            <ul className="space-y-3 mb-8">
              {[
                { icon: <MapPin size={15} />, text: '30 Cecil Street, Singapore 049712' },
                { icon: <Phone size={15} />, text: '+65 6123 4567' },
                { icon: <Mail size={15} />, text: 'hello@lexicontech.sg' },
              ].map((c) => (
                <li key={c.text} className="flex items-start gap-3 text-sm text-primary-100">
                  <span className="text-primary-300 mt-0.5 flex-shrink-0">{c.icon}</span>
                  {c.text}
                </li>
              ))}
            </ul>

            <div>
              <p className="text-sm font-bold text-white mb-3">Newsletter</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2.5 bg-primary-900/30 border border-primary-400/30 rounded-xl text-sm text-white placeholder:text-primary-300 focus:outline-none focus:border-white transition-colors"
                />
                <button
                  aria-label="Subscribe to newsletter"
                  className="px-3 py-2.5 bg-white text-primary-600 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-500/30">
       
        <div className="container-wide py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-primary-200 text-center sm:text-left">
            © {new Date().getFullYear()} Lexicon Technology Pte Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[].map((method) => (
              <span key={method} className="text-xs text-gray-600 font-medium border border-gray-700 px-2 py-1 rounded-md">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
