import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Loader2, TrendingUp, Star } from 'lucide-react';
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
  isNew?: boolean;
  rating: number;
  reviewCount: number;
  totalSold: number;
}

const BestSellers: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await productsAPI.getBestSellers(8);
        if (response.success) {
          setProducts(response.data.bestSellers);
        }
      } catch (error) {
        console.error('Error fetching best sellers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
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
      <section className="py-16 lg:py-24 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading best sellers...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              BEST SELLERS
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Discover our most popular pieces loved by thousands of customers. 
            These trending items are flying off the shelves!
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
          {products.map((product) => (
            <Link key={product._id} to={`/product/${product._id}`} className="group block">
              {/* Product Card */}
              <div className="bg-background rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-border/50 hover:border-primary/30">
                {/* Product Image */}
                <div className="relative overflow-hidden aspect-[3/4] bg-muted">
                  <img 
                    src={product.images[0]?.url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  />
                  
                                     {/* Badges */}
                   <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5">
                     {product.isNew && (
                       <span className="bg-accent text-accent-foreground px-1.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase rounded shadow-sm">
                         NEW
                       </span>
                     )}
                     {product.salePrice && (
                       <span className="bg-destructive text-destructive-foreground px-1.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase rounded shadow-sm">
                         SALE
                       </span>
                     )}
                   </div>

                                     {/* Sold Count Badge */}
                   <div className="absolute top-1.5 right-1.5">
                     <div className="bg-primary/90 text-primary-foreground px-1.5 py-0.5 text-[10px] font-semibold rounded shadow-sm backdrop-blur-sm">
                       {product.totalSold} sold
                     </div>
                   </div>

                                     {/* Wishlist Button */}
                   <button 
                     className="absolute bottom-1.5 right-1.5 p-1.5 bg-background/90 backdrop-blur-sm rounded-full transition-all duration-300 hover:bg-background hover:text-accent z-10 disabled:opacity-50 shadow-sm"
                     aria-label="Add to wishlist"
                     onClick={(e) => handleWishlistToggle(product._id, e)}
                     disabled={wishlistLoading === product._id}
                   >
                     {wishlistLoading === product._id ? (
                       <Loader2 size={14} className="animate-spin" />
                     ) : (
                       <Heart 
                         size={14} 
                         className={wishlistItems.includes(product._id) ? 'fill-accent text-accent' : 'text-foreground'} 
                       />
                     )}
                   </button>
                </div>

                {/* Product Info */}
                <div className="p-2 space-y-1.5">
                  <h3 className="font-medium text-xs leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  
                                     {/* Rating */}
                   <div className="flex items-center gap-1">
                     <div className="flex items-center">
                       {[...Array(5)].map((_, i) => (
                         <Star
                           key={i}
                           size={10}
                           className={`${
                             i < Math.floor(product.rating)
                               ? 'fill-yellow-400 text-yellow-400'
                               : 'text-muted-foreground'
                           }`}
                         />
                       ))}
                     </div>
                     <span className="text-xs text-muted-foreground ml-1">
                       ({product.reviewCount})
                     </span>
                   </div>
                  
                                     {/* Price */}
                   <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-1.5">
                       <span className="text-sm font-bold text-primary">
                         ₹{(product.salePrice || product.basePrice).toLocaleString()}
                       </span>
                       {product.salePrice && (
                         <span className="text-muted-foreground line-through text-xs">
                           ₹{product.basePrice.toLocaleString()}
                         </span>
                       )}
                     </div>
                     
                     {/* Category */}
                     <span className="text-xs text-muted-foreground uppercase tracking-wider bg-muted px-1.5 py-0.5 rounded text-[10px]">
                       {product.category}
                     </span>
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12 lg:mt-16">
          <Link to="/shop">
            <button className="bg-primary text-primary-foreground px-8 py-4 font-semibold tracking-widest uppercase hover:bg-primary/90 transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              SHOP ALL PRODUCTS
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
