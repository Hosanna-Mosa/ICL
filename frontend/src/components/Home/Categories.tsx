import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    id: 'hoodies',
    name: 'HOODIES',
    description: 'Oversized comfort meets premium design',
    href: '/shop/hoodies',
    count: '24 pieces'
  },
  {
    id: 'tees',
    name: 'OVERSIZED TEES',
    description: 'Essential basics with elevated details',
    href: '/shop/tees',
    count: '18 pieces'
  },
  {
    id: 'bottoms',
    name: 'BOTTOMS',
    description: 'From joggers to cargos, street-ready fits',
    href: '/shop/bottoms',
    count: '16 pieces'
  },
  {
    id: 'accessories',
    name: 'ACCESSORIES',
    description: 'Complete your look with premium add-ons',
    href: '/shop/accessories',
    count: '12 pieces'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <Link 
              key={category.id}
              to={category.href}
              className="group"
            >
              <div className="card-feature hover-lift">
                {/* Category Number */}
                <div className="text-6xl lg:text-7xl font-montserrat font-black text-muted/30 mb-4 group-hover:text-accent/50 transition-colors duration-300">
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Category Info */}
                <div className="space-y-3">
                  <h3 className="text-xl lg:text-2xl font-semibold tracking-tight group-hover:text-accent transition-colors duration-300">
                    {category.name}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-label text-muted-foreground">
                      {category.count}
                    </span>
                    <ArrowRight 
                      size={20} 
                      className="text-accent transform group-hover:translate-x-2 transition-transform duration-300" 
                    />
                  </div>
                </div>
              </div>
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