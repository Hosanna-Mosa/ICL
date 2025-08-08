import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../UI/ICLButton';
import lookbookImage from '@/assets/lookbook-1.jpg';

const BrandStory: React.FC = () => {
  return (
    <section className="py-16 lg:py-24 bg-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
            <div className="space-y-4">
              <span className="text-label text-accent uppercase">
                OUR STORY
              </span>
              <h2 className="text-section">
                WHERE STREET MEETS<br />
                <span className="text-accent">SOPHISTICATION</span>
              </h2>
            </div>
            
            <div className="space-y-4 text-foreground/80 leading-relaxed">
              <p>
                Born from the concrete jungles and neon-lit streets, ICL represents the evolution of streetwear. 
                We don't just make clothes – we craft statements.
              </p>
              <p>
                Every stitch, every cut, every detail is meticulously designed to embody the spirit of urban culture 
                while maintaining the highest standards of quality and craftsmanship.
              </p>
              <p>
                From oversized silhouettes that speak to comfort and confidence, to premium fabrics that stand the 
                test of time – ICL is where authenticity meets aspiration.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/about">
                <Button variant="accent" size="lg" className="w-full sm:w-auto">
                  READ OUR STORY
                </Button>
              </Link>
              <Link to="/lookbook">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  VIEW LOOKBOOK
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-accent">10K+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-accent">500+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Unique Designs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-accent">2019</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Established</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2">
            <div className="relative group">
              <img 
                src={lookbookImage}
                alt="ICL Brand Story"
                className="w-full aspect-[4/5] object-cover object-center shadow-strong transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              
              {/* Floating Quote */}
              <div className="absolute bottom-6 left-6 right-6 bg-background/95 backdrop-blur-sm p-4 lg:p-6">
                <blockquote className="text-sm lg:text-base font-medium italic">
                  "Fashion fades, but style is eternal. ICL is about creating pieces that transcend trends."
                </blockquote>
                <cite className="text-xs text-muted-foreground mt-2 block not-italic">
                  — ICL Design Team
                </cite>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;