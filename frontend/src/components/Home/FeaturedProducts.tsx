import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Button from '../UI/ICLButton';
import { productsAPI } from '@/utils/api';

interface Product {
  _id: string;
  name: string;
  basePrice: number;
  salePrice?: number;
  images: Array<{ url: string; alt?: string; isPrimary: boolean }>;
  category: string;
  isFeatured?: boolean;
  isNew?: boolean;
}

const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productsAPI.getAll({ featured: 'true', limit: '6' });
        if (response.success) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading featured products...</p>
          </div>
        </div>
      </section>
    );
  }

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
            <div key={product._id} className="card-product group">
              {/* Product Image */}
              <div className="relative overflow-hidden aspect-square bg-muted">
                <img 
                  src={product.images[0]?.url || '/placeholder.svg'}
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
                  {product.salePrice && (
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
                                  <Link to={`/product/${product._id}`}>
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
                    ₹{(product.salePrice || product.basePrice).toLocaleString()}
                  </span>
                  {product.salePrice && (
                    <span className="text-muted-foreground line-through">
                      ₹{product.basePrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <Link to={`/product/${product._id}`}>
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