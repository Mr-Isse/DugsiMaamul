import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { GraduationCap, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-cyan-400" />
            <span className="text-xl font-bold text-foreground">Dugsimaamul</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-indigo-600 dark:text-cyan-400' 
                  : 'text-foreground hover:text-indigo-600 dark:hover:text-cyan-400'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/pricing" 
              className={`text-sm font-medium transition-colors ${
                isActive('/pricing') 
                  ? 'text-indigo-600 dark:text-cyan-400' 
                  : 'text-foreground hover:text-indigo-600 dark:hover:text-cyan-400'
              }`}
            >
              Pricing
            </Link>
            <Link 
              to="/contact" 
              className={`text-sm font-medium transition-colors ${
                isActive('/contact') 
                  ? 'text-indigo-600 dark:text-cyan-400' 
                  : 'text-foreground hover:text-indigo-600 dark:hover:text-cyan-400'
              }`}
            >
              Contact
            </Link>
            <Link 
              to="/faq" 
              className={`text-sm font-medium transition-colors ${
                isActive('/faq') 
                  ? 'text-indigo-600 dark:text-cyan-400' 
                  : 'text-foreground hover:text-indigo-600 dark:hover:text-cyan-400'
              }`}
            >
              FAQ
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="sm">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background">
          <div className="px-4 py-4 space-y-3">
            <Link 
              to="/" 
              className={`block text-sm font-medium py-2 transition-colors ${
                isActive('/') 
                  ? 'text-indigo-600 dark:text-cyan-400' 
                  : 'text-foreground hover:text-indigo-600 dark:hover:text-cyan-400'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/pricing" 
              className={`block text-sm font-medium py-2 transition-colors ${
                isActive('/pricing') 
                  ? 'text-indigo-600 dark:text-cyan-400' 
                  : 'text-foreground hover:text-indigo-600 dark:hover:text-cyan-400'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/contact" 
              className={`block text-sm font-medium py-2 transition-colors ${
                isActive('/contact') 
                  ? 'text-indigo-600 dark:text-cyan-400' 
                  : 'text-foreground hover:text-indigo-600 dark:hover:text-cyan-400'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link 
              to="/faq" 
              className={`block text-sm font-medium py-2 transition-colors ${
                isActive('/faq') 
                  ? 'text-indigo-600 dark:text-cyan-400' 
                  : 'text-foreground hover:text-indigo-600 dark:hover:text-cyan-400'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            <div className="pt-4 space-y-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="sm" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
