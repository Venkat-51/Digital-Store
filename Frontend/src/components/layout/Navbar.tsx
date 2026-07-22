import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Heart, Search, Menu, X, ChevronDown,
  User, Monitor, HardDrive, Gamepad2, Wifi, Briefcase, BatteryCharging,
  LogOut, Settings, LayoutDashboard, Package
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useWishlist } from '@/hooks/useWishlist';
import { useSearch } from '@/hooks/useSearch';
import { ROUTES } from '@/constants/routes';
import { NAV_CATEGORIES } from '@/constants/config';
import { Button } from '@/components/ui/Button';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'computer-accessories': <Monitor size={20} />,
  'data-storage':         <HardDrive size={20} />,
  'gaming':               <Gamepad2 size={20} />,
  'networking-wireless':  <Wifi size={20} />,
  'office-essentials':    <Briefcase size={20} />,
  'power-bank':           <BatteryCharging size={20} />,
};

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [searchCategory, setSearchCategory] = useState('All');
  const [isSearchCatOpen, setIsSearchCatOpen] = useState(false);
  
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { itemCount, subtotal, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const { query, setQuery, results, isLoading: isSearchLoading } = useSearch();

  // Sticky scroll
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setIsMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(query.trim())}${searchCategory !== 'All' ? `&category=${searchCategory}` : ''}`);
      setQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    navigate(ROUTES.HOME);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm flex flex-col">

        {/* MAIN HEADER */}
        <div className="w-full container-wide px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex-shrink-0 flex items-center h-8 sm:h-10">
            <img
              src="/logo.png"
              alt="Lexicon Technology"
              className="h-7 sm:h-8 lg:h-10 w-auto object-contain"
            />
          </Link>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-2xl relative z-20">
            <form onSubmit={handleSearch} className="flex w-full border-2 border-primary-900 rounded-lg overflow-visible">
              {/* Category Dropdown inside Search */}
              <div className="relative border-r border-gray-200 bg-gray-50 rounded-l-md">
                <button
                  type="button"
                  className="px-4 py-3 text-sm text-gray-700 flex items-center gap-2 hover:bg-gray-100"
                  onClick={() => setIsSearchCatOpen(!isSearchCatOpen)}
                >
                  <span className="max-w-[100px] truncate">{searchCategory}</span>
                  <ChevronDown size={14} />
                </button>
                <AnimatePresence>
                  {isSearchCatOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 shadow-xl rounded-lg py-1 z-50"
                    >
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input */}
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your favorite product..."
                className="flex-1 px-4 py-3 outline-none text-sm"
              />

              {/* Search Button */}
              <button
                type="submit"
                className="bg-primary-900 text-white px-8 py-3 font-semibold hover:bg-primary-800 transition-colors"
              >
                Search
              </button>
            </form>
            
            {/* Search Live Results */}
            {query && !isSearchLoading && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 max-h-80 overflow-y-auto z-50">
                {results.slice(0, 5).map((p) => (
                  <Link
                    key={p.id}
                    to={`/products/${p.slug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                    onClick={() => setQuery('')}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0">
                      <img src={p.thumbnail || '/placeholder-product.png'} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                      <p className="text-xs text-primary-600 font-bold">${parseFloat(p.price).toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Actions (Account, Wishlist, Cart) */}
          <div className="flex items-center gap-3 sm:gap-5 lg:gap-8 ml-auto">
            
            {/* Auth Menu */}
            <div className="hidden lg:flex items-center gap-2 relative">
               {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen((p) => !p)}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <User size={24} className="text-gray-700" />
                      <div className="text-left leading-tight">
                         <p className="text-xs text-gray-500">Welcome</p>
                         <p className="text-sm font-bold text-gray-900">{user?.first_name || 'Account'}</p>
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute top-full right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                        >
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-bold">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                          </div>
                          {[
                            { to: ROUTES.DASHBOARD, icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
                            { to: ROUTES.PROFILE, icon: <User size={16} />, label: 'Profile' },
                            { to: ROUTES.ORDERS, icon: <Package size={16} />, label: 'Orders' },
                            ...(user?.is_staff ? [{ to: ROUTES.ADMIN, icon: <Settings size={16} />, label: 'Admin Panel' }] : []),
                          ].map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <span className="text-gray-400">{item.icon}</span>
                              {item.label}
                            </Link>
                          ))}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 mt-1 border-t border-gray-100"
                          >
                            <LogOut size={16} /> Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
               ) : (
                  <Link to={ROUTES.LOGIN} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <User size={24} className="text-gray-700" />
                    <div className="text-left leading-tight">
                       <p className="text-xs text-gray-500">Sign In</p>
                       <p className="text-sm font-bold text-gray-900">Account</p>
                    </div>
                  </Link>
               )}
            </div>

            {/* Wishlist */}
            <Link to={ROUTES.WISHLIST} className="relative hidden lg:flex items-center justify-center hover:opacity-80">
               <Heart size={24} className="text-gray-700" />
               <span className="absolute -top-1.5 -right-2 w-5 h-5 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center border border-white">
                 {wishlistCount}
               </span>
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="flex items-center gap-2.5 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
              aria-label="Shopping Cart"
            >
               <div className="relative flex items-center justify-center">
                 <ShoppingCart size={22} className="text-gray-700" />
                 <span className="absolute -top-2 -right-2.5 w-5 h-5 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                   {itemCount}
                 </span>
               </div>
               <div className="hidden lg:block text-left leading-tight">
                 <p className="text-xs text-gray-500">Total</p>
                 <p className="text-sm font-bold text-gray-900">${subtotal}</p>
               </div>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileOpen((p) => !p)}
              className="lg:hidden p-2 -mr-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* BOTTOM NAVIGATION BAR */}
        <div className="hidden lg:block border-t border-gray-100">
          <div className="container-wide flex items-center">
            
            {/* All Categories Dropdown (Sidebar style) */}
            <div className="relative" onMouseLeave={() => setIsMegaOpen(false)}>
              <button
                className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 px-6 py-4 w-64 border-r border-gray-100 transition-colors"
                onMouseEnter={() => setIsMegaOpen(true)}
              >
                <Menu size={20} className="text-gray-700" />
                <span className="font-bold text-gray-900">All Categories</span>
                <ChevronDown size={16} className="ml-auto text-gray-500" />
              </button>

              <AnimatePresence>
                {isMegaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 w-64 bg-white border border-gray-100 shadow-xl z-50 rounded-b-xl overflow-hidden"
                  >
                    <div className="py-2">
                      {NAV_CATEGORIES.map((cat) => (
                        <Link
                          key={cat.slug}
                          to={`/categories/${cat.slug}`}
                          className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium hover:text-primary-600"
                          onClick={() => setIsMegaOpen(false)}
                        >
                          <span className="text-gray-400">{CATEGORY_ICONS[cat.slug]}</span>
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Inline Nav Links */}
            <nav className="flex items-center gap-6 px-8 flex-1">
              {[
                { label: 'Shop', to: ROUTES.SHOP },
                { label: 'About Us', to: ROUTES.ABOUT },
                { label: 'Wholesale', to: ROUTES.WHOLESALE },
                { label: 'Trade In', to: ROUTES.TRADE_IN },
                { label: 'Laptop Service', to: ROUTES.LAPTOP_SERVICE },
                { label: 'Donate', to: ROUTES.DONATE },
                { label: 'Contact', to: ROUTES.CONTACT },
              ].map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => 
                    cn("text-sm font-semibold hover:text-primary-600 transition-colors", isActive ? "text-primary-600" : "text-gray-900")
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Promo Text */}
            <div className="flex items-center gap-2 pr-4">
              <span className="text-red-500 font-bold text-lg">%</span>
              <div className="leading-tight">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Only this weekend</p>
                <p className="text-sm font-black text-gray-900">Super Discount</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to push content down (since header is fixed) */}
      <div className="h-[56px] sm:h-[64px] lg:h-[110px]" />

      {/* MOBILE MENU overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-full w-4/5 max-w-sm bg-white shadow-2xl lg:hidden flex flex-col overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <img src="/logo.png" alt="Logo" className="h-8" />
                <button onClick={() => setIsMobileOpen(false)}>
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="p-4 border-b border-gray-100">
                 <form onSubmit={handleSearch} className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
                   <Search size={18} className="text-gray-400" />
                   <input
                     type="search"
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
                     placeholder="Search products..."
                     className="bg-transparent flex-1 outline-none px-2 text-sm"
                   />
                 </form>
              </div>

              <div className="p-4 flex flex-col gap-4">
                {[
                  { to: ROUTES.HOME, label: 'Home' },
                  { to: ROUTES.SHOP, label: 'Shop' },
                  { to: ROUTES.ABOUT, label: 'About Us' },
                  { to: ROUTES.WHOLESALE, label: 'Wholesale' },
                  { to: ROUTES.TRADE_IN, label: 'Trade In' },
                  { to: ROUTES.LAPTOP_SERVICE, label: 'Laptop Service' },
                  { to: ROUTES.DONATE, label: 'Donate' },
                  { to: ROUTES.CONTACT, label: 'Contact' },
                ].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="text-base font-semibold text-gray-800"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>

              <div className="border-t border-gray-100 p-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-4">Categories</p>
                <div className="flex flex-col gap-3">
                  {NAV_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/categories/${cat.slug}`}
                      className="flex items-center gap-3 text-sm text-gray-600"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <span className="text-gray-400">{CATEGORY_ICONS[cat.slug]}</span>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
