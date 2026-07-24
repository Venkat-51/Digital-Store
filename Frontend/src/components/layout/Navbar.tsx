import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Heart, Search, Menu, X, ChevronDown, ChevronRight,
  User, Monitor, HardDrive, Gamepad2, Wifi, Briefcase, BatteryCharging,
  LogOut, Settings, LayoutDashboard, Package, CheckCircle, Compass
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
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
      setIsMobileSearchOpen(false);
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
        <div className="w-full container-wide px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-6">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex-shrink-0 flex items-center h-8 sm:h-10">
            <img
              src="/logo.png"
              alt="Lexicon Technology"
              className="h-7 sm:h-8 lg:h-10 w-auto object-contain"
            />
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-2xl relative z-20">
            <form onSubmit={handleSearch} className="flex w-full border-2 border-primary-900 rounded-lg overflow-visible">

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

          {/* Desktop Right Actions (Account, Wishlist, Cart) */}
          <div className="hidden lg:flex items-center gap-3 sm:gap-5 lg:gap-8 ml-auto">
            
            {/* Auth Menu */}
            <div className="flex items-center gap-2 relative">
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
            <Link to={ROUTES.WISHLIST} className="relative flex items-center justify-center hover:opacity-80">
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
               <div className="text-left leading-tight">
                 <p className="text-xs text-gray-500">Total</p>
                 <p className="text-sm font-bold text-gray-900">${subtotal}</p>
               </div>
            </button>
          </div>

          {/* Mobile Right Actions (Pill action group: Search, Wishlist, Cart + Hamburger Menu) */}
          <div className="flex lg:hidden items-center gap-2 ml-auto">
            {/* Pill Box Action Group */}
            <div className="bg-gray-50 border border-gray-200/90 rounded-xl px-2.5 py-1 flex items-center gap-2.5 shadow-2xs">
              {/* Search Toggle Icon */}
              <button
                onClick={() => setIsMobileSearchOpen((prev) => !prev)}
                className="p-1 text-gray-700 hover:text-primary-600 active:scale-95 transition-all"
                aria-label="Search"
              >
                <Search size={19} />
              </button>

              {/* Divider */}
              <div className="w-[1px] h-3.5 bg-gray-200" />

              {/* Wishlist Icon */}
              <Link
                to={ROUTES.WISHLIST}
                className="relative p-1 text-gray-700 hover:text-primary-600 active:scale-95 transition-all flex items-center justify-center"
                aria-label="Wishlist"
              >
                <Heart size={19} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-yellow-400 text-gray-900 text-[9px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center border border-white">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Divider */}
              <div className="w-[1px] h-3.5 bg-gray-200" />

              {/* Cart Icon */}
              <button
                onClick={openCart}
                className="relative p-1 text-gray-700 hover:text-primary-600 active:scale-95 transition-all flex items-center justify-center"
                aria-label="Shopping Cart"
              >
                <ShoppingCart size={19} />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-yellow-400 text-gray-900 text-[9px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center border border-white shadow-2xs">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
            </div>

            {/* Hamburger Menu Toggle Button */}
            <button
              onClick={() => setIsMobileOpen((prev) => !prev)}
              className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors active:scale-95 ml-0.5"
              aria-label="Toggle Menu"
            >
              {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown Overlay */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-gray-100 bg-white px-4 py-2.5 shadow-md overflow-hidden"
            >
              <form onSubmit={handleSearch} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <Search size={18} className="text-gray-400 flex-shrink-0" />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="bg-transparent flex-1 outline-none text-sm text-gray-900 placeholder:text-gray-400"
                  autoFocus
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 p-0.5">
                    <X size={16} />
                  </button>
                )}
                <button type="submit" className="bg-primary-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary-800 transition-colors">
                  Search
                </button>
              </form>

              {/* Mobile Search Live Results */}
              {query && !isSearchLoading && results.length > 0 && (
                <div className="mt-2 bg-white rounded-xl border border-gray-100 shadow-xl max-h-60 overflow-y-auto">
                  {results.slice(0, 5).map((p) => (
                    <Link
                      key={p.id}
                      to={`/products/${p.slug}`}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                      onClick={() => {
                        setQuery('');
                        setIsMobileSearchOpen(false);
                      }}
                    >
                      <div className="w-9 h-9 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                        <img src={p.thumbnail || '/placeholder-product.png'} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-primary-600 font-bold">${parseFloat(p.price).toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
                { label: 'About', to: ROUTES.ABOUT },
                { label: 'Wholesale', to: ROUTES.WHOLESALE },
                { label: 'Laptop Service', to: ROUTES.LAPTOP_SERVICE },
                { label: 'Contact', to: ROUTES.CONTACT },
                ...(isAuthenticated ? [
                  { label: 'Profile', to: ROUTES.PROFILE },
                  { label: 'Orders', to: ROUTES.ORDERS }
                ] : [])
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
              className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-xs"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm bg-white shadow-2xl lg:hidden flex flex-col overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-2xl font-bold font-serif text-gray-900 tracking-tight">Menu</h2>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Auth Status Banner & User Account Options */}
              {isAuthenticated ? (
                <div className="border-b border-gray-100 bg-gray-50/70 p-4">
                  <div className="flex items-center gap-2.5 min-w-0 mb-3 px-1">
                    <div className="w-8 h-8 bg-slate-950 text-white rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 shadow-2xs">
                      {user?.first_name?.[0]?.toUpperCase() || <User size={14} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-gray-900 truncate">{user?.first_name} {user?.last_name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">


                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-colors shadow-2xs"
                    >
                      <LogOut size={14} className="flex-shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-3.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold text-gray-500">Welcome to Lexicon</span>
                    <Link
                      to={ROUTES.LOGIN}
                      className="text-xs font-bold bg-primary-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-primary-700 transition-colors shadow-2xs"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      Sign In →
                    </Link>
                  </div>
                </div>
              )}

              {/* Primary Navigation Links */}
              <div className="px-5 py-4 flex flex-col gap-1.5">
                {[
                  { to: ROUTES.HOME, label: 'Home' },
                  { to: ROUTES.SHOP, label: 'Products' },
                  { to: ROUTES.ABOUT, label: 'About' },
                  { to: ROUTES.CONTACT, label: 'Contact' },
                  ...(isAuthenticated ? [
                    { to: ROUTES.PROFILE, label: 'Profile' },
                    { to: ROUTES.ORDERS, label: 'Orders' }
                  ] : [])
                ].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === ROUTES.HOME}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {({ isActive }) => (
                      <div
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-2xl font-bold transition-all text-base",
                          isActive
                            ? "bg-slate-950 text-white shadow-xs"
                            : "text-gray-900 hover:bg-gray-50"
                        )}
                      >
                        <span>{item.label}</span>
                        {isActive ? (
                          <CheckCircle size={18} className="text-white flex-shrink-0" />
                        ) : (
                          <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-1 mx-6" />

              {/* Secondary Navigation Links */}
              <div className="px-5 py-2 flex flex-col gap-1">
                <NavLink
                  to={ROUTES.ORDER_TRACKING}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between px-4 py-3 rounded-2xl font-bold transition-all text-sm",
                      isActive ? "bg-slate-950 text-white" : "text-gray-800 hover:bg-gray-50"
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <Compass size={19} className="text-gray-800" />
                    <span className="font-semibold text-gray-900">Track Order</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                </NavLink>

                <NavLink
                  to={ROUTES.WHOLESALE}
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-gray-800 hover:bg-gray-50 transition-all text-sm"
                >
                  <span className="text-gray-900">Quality Promise</span>
                  <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                </NavLink>

                <NavLink
                  to={ROUTES.LAPTOP_SERVICE}
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-gray-800 hover:bg-gray-50 transition-all text-sm"
                >
                  <span className="text-gray-900">Store Locator</span>
                  <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                </NavLink>

                <NavLink
                  to={ROUTES.TRADE_IN}
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-gray-800 hover:bg-gray-50 transition-all text-sm"
                >
                  <span className="text-gray-900">B2B / Bulk</span>
                  <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                </NavLink>
              </div>

              {/* Bottom Quick Categories / Help section */}
              <div className="mt-auto border-t border-gray-100 p-5 bg-gray-50/50">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {NAV_CATEGORIES.slice(0, 4).map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/categories/${cat.slug}`}
                      className="text-xs font-medium text-gray-600 hover:text-primary-600 truncate py-0.5"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      • {cat.name}
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
