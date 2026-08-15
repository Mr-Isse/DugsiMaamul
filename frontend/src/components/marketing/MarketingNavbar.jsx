import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, Sun, Moon, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const links = [
  { name: 'Home', href: '/' },
  { name: 'Platform', href: '/platform' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'About', href: '/about' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
];

const MarketingNavbar = () => {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') ? localStorage.getItem('theme') === 'dark' : true
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const { pathname } = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 lg:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter">
            Dugsi<span className="text-indigo-600">Kabe</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          {links.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className={cn(
                "px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                pathname === l.href 
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {l.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleDarkMode}>
            {darkMode ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-indigo-600" />}
          </Button>

          <Link to="/login">
            <Button variant="ghost" className="rounded-xl font-black uppercase tracking-widest text-xs px-6">
              Sign In
            </Button>
          </Link>
          
          <Link to="/pricing">
            <Button className="rounded-xl font-black uppercase tracking-widest text-xs px-8 h-11 shadow-xl shadow-indigo-600/20 group">
              Get Started <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden rounded-xl" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
                    pathname === l.href 
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                  )}
                >
                  {l.name}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3">
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl font-black uppercase tracking-widest text-[10px]">Sign In</Button>
                </Link>
                <Link to="/pricing" onClick={() => setOpen(false)}>
                  <Button className="w-full rounded-xl font-black uppercase tracking-widest text-[10px]">Get Started</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default MarketingNavbar;
