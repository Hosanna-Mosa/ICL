import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { productsAPI, userAPI } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productsAPI.getAll({ featured: 'true', limit: '8' });
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

  // Fetch wishlist when authenticated
  useEffect(() => {
    const fetchWishlist = async () => {
      if (isAuthenticated) {
        try {
          const response = await userAPI.getWishlist();
          if (response.success) {
            const wishlistProductIds = response.data.wishlist.map((item: any) => item._id);
            setWishlistItems(wishlistProductIds);
          }
        } catch (error) {
          console.error('Error fetching wishlist:', error);
        }
      } else {
        setWishlistItems([]);
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  // Handle wishlist toggle
  const handleWishlistToggle = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save products to your wishlist",
        variant: "destructive",
      });
      return;
    }

    try {
      setWishlistLoading(productId);
      const isInWishlist = wishlistItems.includes(productId);

      if (isInWishlist) {
        // Remove from wishlist
        await userAPI.removeFromWishlist(productId);
        setWishlistItems(prev => prev.filter(id => id !== productId));
        
        // Update wishlist count in header
        try {
          const refreshed = await userAPI.getWishlist();
          if (refreshed.success) {
            window.dispatchEvent(
              new CustomEvent('wishlist:updated', {
                detail: { count: refreshed.data.wishlist.length },
              })
            );
          }
        } catch {}
        
        toast({
          title: "Removed from wishlist",
          description: "Product removed from your wishlist",
        });
      } else {
        // Add to wishlist
        await userAPI.addToWishlist(productId);
        setWishlistItems(prev => [...prev, productId]);
        
        // Update wishlist count in header
        try {
          const refreshed = await userAPI.getWishlist();
          if (refreshed.success) {
            window.dispatchEvent(
              new CustomEvent('wishlist:updated', {
                detail: { count: refreshed.data.wishlist.length },
              })
            );
          }
        } catch {}
        
        toast({
          title: "Added to wishlist",
          description: "Product added to your wishlist",
        });
      }
    } catch (error: any) {
      console.error('Error toggling wishlist:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist",
        variant: "destructive",
      });
    } finally {
      setWishlistLoading(null);
    }
  };

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
            Hand-picked pieces that define the BRELIS aesthetic. Limited quantities, maximum impact.
          </p>
        </div>

        {/* Products Grid - Updated to match image style */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-3">
          {products.map((product) => (
            <Link key={product._id} to={`/product/${product._id}`} className="group block">
              {/* Product Image */}
              <div className="relative overflow-hidden aspect-[4/5] bg-muted mb-1">
                <img 
                  src={product.images[0]?.url || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Badges */}
                <div className="absolute top-1 left-1 flex flex-col gap-1">
                  {product.isNew && (
                    <span className="bg-accent text-accent-foreground px-1.5 py-0.5 text-xs font-medium tracking-widest uppercase">
                      NEW
                    </span>
                  )}
                  {product.salePrice && (
                    <span className="bg-destructive text-destructive-foreground px-1.5 py-0.5 text-xs font-medium tracking-widest uppercase">
                      SALE
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button 
                  className="absolute top-1 right-1 p-1 bg-background/80 backdrop-blur-sm rounded-full transition-all duration-300 hover:bg-background hover:text-accent z-10 disabled:opacity-50"
                  aria-label="Add to wishlist"
                  onClick={(e) => handleWishlistToggle(product._id, e)}
                  disabled={wishlistLoading === product._id}
                >
                  {wishlistLoading === product._id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Heart 
                      size={12} 
                      className={wishlistItems.includes(product._id) ? 'fill-accent text-accent' : 'text-foreground'} 
                    />
                  )}
                </button>
              </div>

              {/* Product Info - Simplified */}
              <div className="space-y-0">
                <h3 className="font-medium text-xs leading-tight line-clamp-2">
                  {product.name}
                </h3>
                
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className="text-sm font-semibold">
                    ₹{(product.salePrice || product.basePrice).toLocaleString()}
                  </span>
                  {product.salePrice && (
                    <span className="text-muted-foreground line-through text-xs">
                      ₹{product.basePrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12 lg:mt-16">
          <Link to="/shop">
            <button className="bg-primary text-primary-foreground px-8 py-3 font-medium tracking-widest uppercase hover:bg-primary/90 transition-colors">
              EXPLORE ALL PRODUCTS
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;