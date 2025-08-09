import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    id: 'hoodies',
    name: 'HOODIES',
    description: 'Oversized comfort meets premium design',
    href: '/shop?category=hoodies',
    count: '24 pieces',
    backgroundImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=600&fit=crop'
  },
  {
    id: 'tees',
    name: 'OVERSIZED TEES',
    description: 'Essential basics with elevated details',
    href: '/shop?category=tshirts',
    count: '18 pieces',
    backgroundImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop'
  },
  {
    id: 'bottoms',
    name: 'BOTTOMS',
    description: 'From joggers to cargos, street-ready fits',
    href: '/shop?category=pants',
    count: '16 pieces',
    backgroundImage: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=600&fit=crop'
  },
  {
    id: 'accessories',
    name: 'ACCESSORIES',
    description: 'Complete your look with premium add-ons',
    href: '/shop?category=accessories',
    count: '12 pieces',
    backgroundImage: 'https://images.unsplash.com/photo-1556306535-38febf6782e7?w=800&h=600&fit=crop'
  }
];

const Categories: React.FC = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-section mb-4">
            SHOP BY CATEGORY
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover your perfect fit across our carefully curated collections.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
          {categories.map((category, index) => (
            <Link 
              key={category.id}
              to={category.href}
              className="group relative overflow-hidden rounded-lg aspect-[4/5] bg-muted transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={category.backgroundImage}
                  alt={category.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/70 group-hover:via-black/20 transition-all duration-500" />
                {/* Animated Border */}
                <div className="absolute inset-0 border-2 border-white/20 rounded-lg group-hover:border-accent/50 transition-all duration-500" />
              </div>

              {/* Floating Elements */}
              <div className="absolute top-3 right-3 w-8 h-8 bg-accent/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-accent/40 transition-all duration-300">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              </div>

              {/* Category Content */}
              <div className="relative z-10 h-full flex flex-col justify-end p-4 text-white">
                {/* Category Number with Glow Effect */}
                <div className="text-3xl lg:text-4xl font-montserrat font-black text-white/20 mb-2 group-hover:text-white/30 transition-all duration-300 drop-shadow-lg">
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Category Info */}
                <div className="space-y-2">
                  <h3 className="text-base lg:text-lg font-semibold tracking-tight group-hover:text-accent transition-colors duration-300 drop-shadow-lg">
                    {category.name}
                  </h3>
                  
                  <p className="text-white/80 text-xs leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-white/70 text-xs font-medium bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
                      {category.count}
                    </span>
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-accent rounded-full animate-ping" />
                      <ArrowRight 
                        size={16} 
                        className="text-accent transform group-hover:translate-x-2 transition-transform duration-300" 
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>

              {/* Corner Decoration */}
              <div className="absolute top-0 left-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-accent/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          ))}
        </div>

        {/* Premium Notice */}
        <div className="mt-16 lg:mt-20 text-center">
          <div className="inline-flex items-center space-x-4 bg-accent/10 px-8 py-4 rounded-sm">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <p className="text-sm font-medium text-accent">
              All products feature premium 320+ GSM fabric for superior quality and fit
            </p>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;