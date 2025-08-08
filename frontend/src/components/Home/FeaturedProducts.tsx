import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Button from '../UI/ICLButton';
import productHoodie from '@/assets/product-hoodie.jpg';
import productTee from '@/assets/product-tee.jpg';
import productPants from '@/assets/product-pants.jpg';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
}

const products: Product[] = [
  {
    id: '1',
    name: 'Oversized Logo Hoodie',
    price: 2999,
    originalPrice: 3499,
    image: productHoodie,
    category: 'Hoodies',
    isNew: true
  },
  {
    id: '2', 
    name: 'Essential Oversized Tee',
    price: 1299,
    image: productTee,
    category: 'Tees',
    isNew: true
  },
  {
    id: '3',
    name: 'Urban Cargo Joggers',
    price: 2499,
    originalPrice: 2899,
    image: productPants,
    category: 'Bottoms'
  }
];

const FeaturedProducts: React.FC = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-section mb-4">
            FEATURED DROPS
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hand-picked pieces that define the ICL aesthetic. Limited quantities, maximum impact.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {products.map((product) => (
            <div key={product.id} className="card-product group">
              {/* Product Image */}
              <div className="relative overflow-hidden aspect-square bg-muted">
                <img 
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="bg-accent text-accent-foreground px-3 py-1 text-xs font-medium tracking-widest uppercase">
                      NEW
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="bg-destructive text-destructive-foreground px-3 py-1 text-xs font-medium tracking-widest uppercase">
                      SALE
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button 
                  className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:text-accent"
                  aria-label="Add to wishlist"
                >
                  <Heart size={16} />
                </button>

                {/* Quick Add Overlay */}
                <div className="absolute inset-0 bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Link to={`/product/${product.id}`}>
                    <Button variant="ghost" size="lg" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                      QUICK VIEW
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-label text-muted-foreground">
                    {product.category}
                  </span>
                </div>
                
                <h3 className="font-medium text-lg leading-tight">
                  {product.name}
                </h3>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-semibold">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-muted-foreground line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <Link to={`/product/${product.id}`}>
                  <Button 
                    variant="outline" 
                    size="md" 
                    className="w-full mt-4 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  >
                    ADD TO CART
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12 lg:mt-16">
          <Link to="/shop">
            <Button variant="accent" size="lg">
              EXPLORE ALL PRODUCTS
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;