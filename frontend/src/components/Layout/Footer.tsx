import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Instagram, MessageCircle, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="text-3xl font-montserrat font-black tracking-tighter">
              BRELIS
            </div>
            <p className="text-sm text-primary-foreground/80 max-w-xs">
              Urban Spirit. Elite Streetwear.
            </p>
            <div className="flex space-x-4">
                             <a 
                 href="https://www.instagram.com/brelis.club/?igsh=aGlzOHFiMmxicGh0&utm_source=qr#" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="p-2 hover:text-accent transition-colors duration-300"
                 aria-label="Follow us on Instagram"
               >
                <Instagram size={20} />
              </a>
              <a 
                href="https://wa.me/919381032323" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 hover:text-accent transition-colors duration-300"
                aria-label="WhatsApp us"
              >
                <MessageCircle size={20} />
              </a>
              <a 
                href="mailto:brelisbrelis1@gmail.com" 
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
                <li><button onClick={() => handleNavigation('/shop?category=new')} className="hover:text-primary-foreground transition-colors duration-300 text-left">New Drops</button></li>
                <li><button onClick={() => handleNavigation('/shop?category=hoodies')} className="hover:text-primary-foreground transition-colors duration-300 text-left">Hoodies</button></li>
                <li><button onClick={() => handleNavigation('/shop?category=tshirts')} className="hover:text-primary-foreground transition-colors duration-300 text-left">Oversized Tees</button></li>
                <li><button onClick={() => handleNavigation('/shop?category=pants')} className="hover:text-primary-foreground transition-colors duration-300 text-left">Bottoms</button></li>
                <li><button onClick={() => handleNavigation('/shop?category=accessories')} className="hover:text-primary-foreground transition-colors duration-300 text-left">Accessories</button></li>
              </ul>
            </div>

                                           {/* Support Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium tracking-widest uppercase">SUPPORT</h3>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li><button onClick={() => handleNavigation('/account?tab=orders')} className="hover:text-primary-foreground transition-colors duration-300 text-left">Orders</button></li>
                <li><button onClick={() => handleNavigation('/account?tab=orders')} className="hover:text-primary-foreground transition-colors duration-300 text-left">Returns</button></li>
                <li><button onClick={() => handleNavigation('/contact')} className="hover:text-primary-foreground transition-colors duration-300 text-left">Contact Us</button></li>
              </ul>
            </div>


        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-primary-foreground/60">
            © 2025 BRELIS. All rights reserved.
          </div>
                     <div className="flex space-x-6 text-sm text-primary-foreground/60">
             <button onClick={() => handleNavigation('/privacy')} className="hover:text-primary-foreground transition-colors duration-300">
               Privacy Policy
             </button>
             <button onClick={() => handleNavigation('/terms')} className="hover:text-primary-foreground transition-colors duration-300">
               Terms of Service
             </button>
           </div>
        </div>

        {/* Special Notices */}
        <div className="mt-8 p-4 bg-accent/10 border border-accent/20 rounded text-center">
          <p className="text-sm text-primary-foreground/80">
            🎯 <strong>First-time buyers:</strong> Use your welcome coins for instant discount at checkout!
          </p>
        </div>

        {/* Developer Credit */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 border border-white/30 rounded-full backdrop-blur-sm shadow-lg hover:bg-white/30 transition-all duration-300 cursor-pointer group">
            <span className="text-xs text-white/90 font-medium tracking-wide">
              Developed by
            </span>
            <a 
              href="https://www.buildyourvision.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-bold text-yellow-300 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent animate-pulse hover:from-yellow-200 hover:to-orange-300 transition-all duration-1500"
            >
              BUILD YOUR VISION
            </a>
            <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-bounce shadow-sm group-hover:bg-yellow-200 transition-colors duration-1000"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;