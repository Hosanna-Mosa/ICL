import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, Heart } from 'lucide-react';

interface HeaderProps {
  cartItemsCount?: number;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'SHOP', href: '/shop', dropdown: ['NEW DROPS', 'HOODIES', 'TEES', 'BOTTOMS', 'ACCESSORIES'] },
    { label: 'LOOKBOOK', href: '/lookbook' },
    { label: 'ABOUT', href: '/about' },
    { label: 'CONTACT', href: '/contact' }
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-soft' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.slice(0, 2).map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`text-sm font-medium tracking-widest transition-colors duration-300 relative group ${
                  isActivePath(item.href) ? 'text-primary' : 'text-foreground hover:text-primary'
                }`}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <div className="text-2xl lg:text-3xl font-montserrat font-black tracking-tighter transition-transform duration-300 group-hover:scale-105">
              ICL
            </div>
          </Link>

          {/* Desktop Navigation (Right) */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.slice(2).map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`text-sm font-medium tracking-widest transition-colors duration-300 relative group ${
                  isActivePath(item.href) ? 'text-primary' : 'text-foreground hover:text-primary'
                }`}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/wishlist" 
              className="p-2 hover:text-accent transition-colors duration-300"
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </Link>
            <Link 
              to="/account" 
              className="p-2 hover:text-accent transition-colors duration-300"
              aria-label="Account"
            >
              <User size={20} />
            </Link>
            <Link 
              to="/cart" 
              className="relative p-2 hover:text-accent transition-colors duration-300"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background border-t border-border shadow-medium">
            <nav className="flex flex-col p-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium tracking-widest py-2 transition-colors duration-300 ${
                    isActivePath(item.href) ? 'text-primary' : 'text-foreground hover:text-primary'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;