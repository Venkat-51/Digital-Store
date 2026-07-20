import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Heart, Search, Menu, X, ChevronDown,
  User, Monitor, HardDrive, Gamepad2, Wifi, Briefcase, BatteryCharging,
  Package, LogOut, Settings, LayoutDashboard
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { itemCount, openCart } = useCart();
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
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(query.trim())}`);
      setIsSearchOpen(false);
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
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-md border-b border-gray-100'
            : 'bg-white border-b border-gray-100',
        )}
        style={{ height: 'var(--navbar-height)' }}
      >
        <div className="container-wide h-full flex items-center gap-4">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center flex-shrink-0 group" aria-label="Lexicon Technology home">
            <img
              src="/logo.png"
              alt="Lexicon Technology Pte Ltd"
              className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            <NavLink
              to={ROUTES.HOME}
              className={({ isActive }) =>
                cn('nav-link px-3 py-2 rounded-xl', isActive && 'text-primary-600 bg-primary-50')
              }
            >
              Home
            </NavLink>
            <NavLink
              to={ROUTES.SHOP}
              className={({ isActive }) =>
                cn('nav-link px-3 py-2 rounded-xl', isActive && 'text-primary-600 bg-primary-50')
              }
            >
              Shop
            </NavLink>

            {/* Mega Menu Trigger */}
            <div className="relative" onMouseLeave={() => setIsMegaOpen(false)}>
              <button
                className="nav-link px-3 py-2 rounded-xl flex items-center gap-1"
                onMouseEnter={() => setIsMegaOpen(true)}
                onClick={() => setIsMegaOpen((p) => !p)}
                aria-expanded={isMegaOpen}
                aria-haspopup="true"
              >
                Categories
                <ChevronDown
                  size={14}
                  className={cn('transition-transform duration-200', isMegaOpen && 'rotate-180')}
                />
              </button>

              <AnimatePresence>
                {isMegaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
                    onMouseEnter={() => setIsMegaOpen(true)}
                  >
                    <div className="p-5">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">
                        Browse Categories
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {NAV_CATEGORIES.map((cat) => (
                          <Link
                            key={cat.slug}
                            to={`/categories/${cat.slug}`}
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-primary-50 transition-colors group"
                            onClick={() => setIsMegaOpen(false)}
                          >
                            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-200 flex-shrink-0">
                              {CATEGORY_ICONS[cat.slug]}
                            </div>
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-700">
                              {cat.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link
                          to={ROUTES.CATEGORIES}
                          className="flex items-center justify-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                          onClick={() => setIsMegaOpen(false)}
                        >
                          View all categories →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink
              to={ROUTES.ABOUT}
              className={({ isActive }) =>
                cn('nav-link px-3 py-2 rounded-xl', isActive && 'text-primary-600 bg-primary-50')
              }
            >
              About
            </NavLink>
            <NavLink
              to={ROUTES.CONTACT}
              className={({ isActive }) =>
                cn('nav-link px-3 py-2 rounded-xl', isActive && 'text-primary-600 bg-primary-50')
              }
            >
              Contact
            </NavLink>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Search */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsSearchOpen((p) => !p);
                  setTimeout(() => searchRef.current?.focus(), 100);
                }}
                aria-label="Search"
                className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Search size={20} />
              </button>

              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                  >
                    <form onSubmit={handleSearch} className="p-3">
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl">
                        <Search size={16} className="text-gray-400 flex-shrink-0" />
                        <input
                          ref={searchRef}
                          type="search"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search products…"
                          className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none font-medium"
                        />
                        {query && (
                          <button type="button" onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </form>
                    {isSearchLoading && (
                      <div className="px-4 py-3 text-sm text-gray-500">Searching…</div>
                    )}
                    {!isSearchLoading && results.length > 0 && (
                      <div className="border-t border-gray-100 max-h-64 overflow-y-auto">
                        {results.slice(0, 5).map((p) => (
                          <Link
                            key={p.id}
                            to={`/products/${p.slug}`}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsSearchOpen(false)}
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={p.thumbnail || '/placeholder-product.png'} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                              <p className="text-xs text-gray-500">{p.brand?.name}</p>
                            </div>
                            <span className="text-sm font-bold text-primary-600 ml-auto flex-shrink-0">
                              ${parseFloat(p.price).toFixed(2)}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist */}
            <Link
              to={ROUTES.WISHLIST}
              aria-label={`Wishlist (${wishlistCount} items)`}
              className="relative p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-secondary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              aria-label={`Cart (${itemCount} items)`}
              className="relative p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                >
                  {itemCount}
                </motion.span>
              )}
            </button>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen((p) => !p)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                  aria-expanded={isProfileOpen}
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user?.first_name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-gray-700">
                    {user?.first_name}
                  </span>
                  <ChevronDown size={14} className={cn('text-gray-400 transition-transform', isProfileOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 mb-1">
                        <p className="text-sm font-bold text-gray-900">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
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
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <span className="text-gray-400">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-danger-600 hover:bg-danger-50 transition-colors"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.LOGIN)}>
                  Login
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate(ROUTES.REGISTER)}>
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileOpen((p) => !p)}
              className="lg:hidden p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors ml-1"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-2xl lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <span className="text-lg font-black text-gray-900">Menu</span>
                <button onClick={() => setIsMobileOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                {[
                  { to: ROUTES.HOME, label: 'Home' },
                  { to: ROUTES.SHOP, label: 'Shop' },
                  { to: ROUTES.CATEGORIES, label: 'Categories' },
                  { to: ROUTES.ABOUT, label: 'About' },
                  { to: ROUTES.CONTACT, label: 'Contact' },
                  { to: ROUTES.FAQ, label: 'FAQ' },
                ].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center px-5 py-3 text-base font-semibold transition-colors',
                        isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50',
                      )
                    }
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}

                <div className="border-t border-gray-100 mt-4 pt-4 px-5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Categories</p>
                  {NAV_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/categories/${cat.slug}`}
                      className="flex items-center gap-3 py-2.5 text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <span className="text-gray-400">{CATEGORY_ICONS[cat.slug]}</span>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
              {!isAuthenticated && (
                <div className="p-5 border-t border-gray-100 flex flex-col gap-3">
                  <Button variant="primary" fullWidth onClick={() => { navigate(ROUTES.REGISTER); setIsMobileOpen(false); }}>
                    Sign Up
                  </Button>
                  <Button variant="outline" fullWidth onClick={() => { navigate(ROUTES.LOGIN); setIsMobileOpen(false); }}>
                    Login
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div style={{ height: 'var(--navbar-height)' }} />
    </>
  );
};

export default Navbar;
