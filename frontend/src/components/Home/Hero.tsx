import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../UI/ICLButton';
import heroImage from '@/assets/hero-image.jpg';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage}
          alt="ICL Streetwear Collection"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 gradient-hero" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-primary-foreground px-4 lg:px-8 max-w-4xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-hero mb-6 lg:mb-8">
            URBAN SPIRIT.<br />
            <span className="text-accent">ELITE STREETWEAR.</span>
          </h1>
          
          <p className="text-lg lg:text-xl mb-8 lg:mb-12 text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
            Redefining street culture with premium craftsmanship and bold designs. 
            Every piece tells a story of rebellion and refinement.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/shop">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                SHOP NOW
              </Button>
            </Link>
            <Link to="/lookbook">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                VIEW LOOKBOOK
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-1 h-8 bg-primary-foreground/50 rounded-full" />
        </div>
      </div>

      {/* Side Banner */}
      <div className="absolute right-4 lg:right-8 top-1/2 transform -translate-y-1/2 bg-accent text-accent-foreground px-3 py-6 rotate-90 origin-center z-20">
        <p className="text-xs font-medium tracking-widest uppercase whitespace-nowrap">
          NEW DROP LIVE
        </p>
      </div>
    </section>
  );
};

export default Hero;