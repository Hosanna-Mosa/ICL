import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import Button from '@/components/UI/ICLButton';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/UI/toast';
import { useCart } from '@/contexts/CartContext';

interface WishlistItem {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  salePrice?: number;
  images: Array<{ url: string; alt?: string; isPrimary: boolean }>;
  rating: number;
  reviewCount: number;
  category: string;
  isInStock: boolean;
  sizes?: Array<{ size: string; stock: number; price: number }>;
}

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getWishlist();
      if (response.success) {
        setWishlistItems(response.data.wishlist);
        window.dispatchEvent(
          new CustomEvent('wishlist:updated', {
            detail: { count: response.data.wishlist.length },
          })
        );
      }
    } catch (error: any) {
      console.error('Error fetching wishlist:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load wishlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      setRemovingItem(productId);
      const response = await userAPI.removeFromWishlist(productId);
      if (response.success) {
        // Use server response for source of truth
        const updated = response.data.wishlist || [];
        setWishlistItems(updated);
        window.dispatchEvent(
          new CustomEvent('wishlist:updated', {
            detail: { count: updated.length },
          })
        );
        toast({
          title: "Removed from wishlist",
          description: "Item removed.",
          action: (
            <ToastAction
              altText="Undo"
              onClick={async () => {
                try {
                  await userAPI.addToWishlist(productId);
                  // Refresh list and count
                  const refreshed = await userAPI.getWishlist();
                  if (refreshed.success) {
                    setWishlistItems(refreshed.data.wishlist);
                    window.dispatchEvent(
                      new CustomEvent('wishlist:updated', {
                        detail: { count: refreshed.data.wishlist.length },
                      })
                    );
                  }
                } catch (e: any) {
                  console.error('Undo failed:', e);
                  toast({
                    title: 'Error',
                    description: e?.message || 'Failed to undo remove',
                    variant: 'destructive',
                  });
                }
              }}
            >
              Undo
            </ToastAction>
          ),
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to remove product from wishlist",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove product from wishlist",
        variant: "destructive",
      });
    } finally {
      setRemovingItem(null);
    }
  };

  const addWishlistItemToCart = async (product: WishlistItem) => {
    try {
      // Pick the first available size with stock > 0
      const availableSize = product.sizes?.find((s) => s.stock > 0)?.size;
      if (!availableSize) {
        toast({
          title: 'Unavailable',
          description: 'No available sizes to add to cart',
          variant: 'destructive',
        });
        return;
      }
      const success = await addToCart(product._id, availableSize, 1);
      if (success) {
        toast({
          title: 'Added to cart',
          description: `${product.name} (${availableSize}) added to cart`,
        });
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to add product to cart',
        variant: 'destructive',
      });
    }
  };

  const getCurrentPrice = (item: WishlistItem) => {
    return item.salePrice || item.basePrice;
  };

  const getDiscountPercentage = (item: WishlistItem) => {
    if (!item.salePrice || item.salePrice >= item.basePrice) return 0;
    return Math.round(((item.basePrice - item.salePrice) / item.basePrice) * 100);
  };

  const getPrimaryImage = (item: WishlistItem) => {
    const primaryImage = item.images.find(img => img.isPrimary);
    return primaryImage?.url || item.images[0]?.url || '/placeholder.svg';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h1 className="text-2xl font-bold mb-4">Sign in to view your wishlist</h1>
              <p className="text-muted-foreground mb-8">
                Create an account or sign in to save your favorite products
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/login">
                  <Button variant="hero">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline">Create Account</Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading your wishlist...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-hero font-bold mb-2">My Wishlist</h1>
            <p className="text-muted-foreground">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>

          {wishlistItems.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-8">
                Start exploring our collection and save your favorite products
              </p>
              <Link to="/shop">
                <Button variant="hero">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            /* Wishlist Items */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <div key={item._id} className="group card-product p-0 overflow-hidden">
                  {/* Product Image */}
                  <div className="relative">
                    <Link to={`/product/${item._id}`}>
                      <img
                        src={getPrimaryImage(item)}
                        alt={item.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    
                    {/* Remove from Wishlist Button */}
                    <button
                      onClick={() => removeFromWishlist(item._id)}
                      disabled={removingItem === item._id}
                      className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                      title="Remove from wishlist"
                    >
                      {removingItem === item._id ? (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-4 h-4 text-destructive" />
                      )}
                    </button>

                    {/* Discount Badge */}
                    {getDiscountPercentage(item) > 0 && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded">
                        {getDiscountPercentage(item)}% OFF
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link to={`/product/${item._id}`}>
                      <h3 className="font-medium mb-2 hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span className="text-sm font-medium">{item.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({item.reviewCount})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg font-bold">
                        ₹{getCurrentPrice(item).toLocaleString()}
                      </span>
                      {item.salePrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{item.basePrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="hero"
                        size="sm"
                        className="flex-1"
                        onClick={() => addWishlistItemToCart(item)}
                        disabled={!item.isInStock}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {item.isInStock ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
