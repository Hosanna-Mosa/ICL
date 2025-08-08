import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="text-3xl font-montserrat font-black tracking-tighter">
              ICL
            </div>
            <p className="text-sm text-primary-foreground/80 max-w-xs">
              Urban Spirit. Elite Streetwear.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/icl.streetwear" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 hover:text-accent transition-colors duration-300"
                aria-label="Follow us on Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://wa.me/919876543210" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 hover:text-accent transition-colors duration-300"
                aria-label="WhatsApp us"
              >
                <MessageCircle size={20} />
              </a>
              <a 
                href="mailto:hello@icl.in" 
                className="p-2 hover:text-accent transition-colors duration-300"
                aria-label="Email us"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium tracking-widest uppercase">SHOP</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/shop/new-drops" className="hover:text-primary-foreground transition-colors duration-300">New Drops</Link></li>
              <li><Link to="/shop/hoodies" className="hover:text-primary-foreground transition-colors duration-300">Hoodies</Link></li>
              <li><Link to="/shop/tees" className="hover:text-primary-foreground transition-colors duration-300">Oversized Tees</Link></li>
              <li><Link to="/shop/bottoms" className="hover:text-primary-foreground transition-colors duration-300">Bottoms</Link></li>
              <li><Link to="/shop/accessories" className="hover:text-primary-foreground transition-colors duration-300">Accessories</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium tracking-widest uppercase">SUPPORT</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/size-guide" className="hover:text-primary-foreground transition-colors duration-300">Size Guide</Link></li>
              <li><Link to="/shipping" className="hover:text-primary-foreground transition-colors duration-300">Shipping Info</Link></li>
              <li><Link to="/returns" className="hover:text-primary-foreground transition-colors duration-300">Returns</Link></li>
              <li><Link to="/faq" className="hover:text-primary-foreground transition-colors duration-300">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-primary-foreground transition-colors duration-300">Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium tracking-widest uppercase">STAY UPDATED</h3>
            <p className="text-sm text-primary-foreground/80">
              Get exclusive drops and early access to new collections.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Your email"
                className="w-full bg-primary-foreground/10 border border-primary-foreground/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
              />
              <button 
                type="submit"
                className="w-full btn-accent text-sm py-2"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-primary-foreground/60">
            © 2024 ICL. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm text-primary-foreground/60">
            <Link to="/privacy" className="hover:text-primary-foreground transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary-foreground transition-colors duration-300">
              Terms of Service
            </Link>
          </div>
        </div>

        {/* Special Notices */}
        <div className="mt-8 p-4 bg-accent/10 border border-accent/20 rounded text-center">
          <p className="text-sm text-primary-foreground/80">
            🎯 <strong>First-time buyers:</strong> Use your welcome coins for instant discount at checkout!
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;