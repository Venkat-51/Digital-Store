import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight, Share2 } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { NAV_CATEGORIES } from '@/constants/config';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* Main Footer */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to={ROUTES.HOME} className="inline-block mb-5 group">
              <img
                src="/logo-dark.png"
                alt="Lexicon Technology Pte Ltd"
                className="h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>
            <p className="text-sm leading-relaxed text-gray-500 mb-6">
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
                  className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all duration-200"
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
                    className="text-sm text-gray-400 hover:text-white transition-colors underline-anim"
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
                    className="text-sm text-gray-400 hover:text-white transition-colors underline-anim"
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
                <li key={c.text} className="flex items-start gap-3 text-sm text-gray-400">
                  <span className="text-primary-500 mt-0.5 flex-shrink-0">{c.icon}</span>
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
                  className="flex-1 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <button
                  aria-label="Subscribe to newsletter"
                  className="px-3 py-2.5 bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors flex-shrink-0"
                >
                  <ArrowRight size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-wide py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600 text-center sm:text-left">
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
