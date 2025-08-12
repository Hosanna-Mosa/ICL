import React, { useState, useEffect } from 'react';
import { Filter, Grid, List, Heart, Loader2, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import Button from '@/components/UI/ICLButton';
import { Link } from 'react-router-dom';
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

const categories = ['All', 'New Drops', 'Hoodies', 'Tees', 'Bottoms', 'Accessories'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colors = ['Black', 'White', 'Grey', 'Beige', 'Navy'];
const priceRanges = [
  { label: 'Under ₹1,000', min: 0, max: 1000 },
  { label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
  { label: '₹2,000 - ₹3,000', min: 2000, max: 3000 },
  { label: 'Above ₹3,000', min: 3000, max: Infinity }
];

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Handle URL parameters on component mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // Update URL when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll();
        if (response.success) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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

  const filteredProducts = products.filter(product => {
    // Handle "New Drops" category - show products that are marked as new
    if (selectedCategory === 'New Drops') {
      return product.isNew === true;
    }
    
    // Handle other categories
    if (selectedCategory !== 'All' && product.category !== selectedCategory) return false;
    
    // Add more filter logic here
    return true;
  });

  // Sort products - for "New Drops" category, show newest first
  const sortedProducts = selectedCategory === 'New Drops' 
    ? [...filteredProducts].sort((a, b) => {
        // Sort by isNew first (true products first), then by creation date
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return 0;
      })
    : filteredProducts;

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          {/* Section Header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              {selectedCategory === 'All' ? 'SHOP ALL' : selectedCategory.toUpperCase()}
            </h1>
            {selectedCategory === 'New Drops' && (
              <p className="text-muted-foreground mt-2">
                Discover our latest releases and newest additions to the collection
              </p>
            )}
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Mobile Filter Overlay */}
            {isFilterOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setIsFilterOpen(false)}>
                <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-background shadow-strong" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6 h-full overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">FILTERS</h3>
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    {/* Categories */}
                    <div className="space-y-3 mb-6">
                      <h4 className="text-sm font-medium tracking-widest uppercase">Category</h4>
                      <div className="space-y-2">
                        {categories.map(category => (
                          <button
                            key={category}
                            onClick={() => handleCategoryChange(category)}
                            className={`block w-full text-left text-sm py-2 px-3 rounded transition-colors duration-300 ${
                              selectedCategory === category ? 'text-accent font-medium bg-accent/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Size Filter */}
                    <div className="space-y-3 mb-6 pb-6 border-b border-border">
                      <h4 className="text-sm font-medium tracking-widest uppercase">Size</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {sizes.map(size => (
                          <button
                            key={size}
                            onClick={() => {
                              setSelectedSizes(prev => 
                                prev.includes(size) 
                                  ? prev.filter(s => s !== size)
                                  : [...prev, size]
                              );
                            }}
                            className={`p-3 text-sm border transition-all duration-300 rounded ${
                              selectedSizes.includes(size)
                                ? 'border-accent bg-accent text-accent-foreground'
                                : 'border-border hover:border-accent'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-3 mb-6 pb-6 border-b border-border">
                      <h4 className="text-sm font-medium tracking-widest uppercase">Price Range</h4>
                      <div className="space-y-3">
                        {priceRanges.map(range => (
                          <label key={range.label} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-muted transition-colors">
                            <input
                              type="radio"
                              name="priceRange"
                              value={range.label}
                              checked={selectedPriceRange === range.label}
                              onChange={(e) => setSelectedPriceRange(e.target.value)}
                              className="text-accent focus:ring-accent"
                            />
                            <span className="text-sm text-muted-foreground">{range.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        handleCategoryChange('All');
                        setSelectedSizes([]);
                        setSelectedColors([]);
                        setSelectedPriceRange('');
                      }}
                    >
                      CLEAR FILTERS
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block lg:w-1/4 space-y-6">
              <div className="sticky top-24">
                <h3 className="text-lg font-semibold mb-4">FILTERS</h3>
                
                {/* Categories */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium tracking-widest uppercase">Category</h4>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => handleCategoryChange(category)}
                        className={`block w-full text-left text-sm py-1 transition-colors duration-300 ${
                          selectedCategory === category ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Filter */}
                <div className="space-y-3 pt-6 border-t border-border">
                  <h4 className="text-sm font-medium tracking-widest uppercase">Size</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSizes(prev => 
                            prev.includes(size) 
                              ? prev.filter(s => s !== size)
                              : [...prev, size]
                          );
                        }}
                        className={`p-2 text-sm border transition-all duration-300 ${
                          selectedSizes.includes(size)
                            ? 'border-accent bg-accent text-accent-foreground'
                            : 'border-border hover:border-accent'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-3 pt-6 border-t border-border">
                  <h4 className="text-sm font-medium tracking-widest uppercase">Price Range</h4>
                  <div className="space-y-2">
                    {priceRanges.map(range => (
                      <label key={range.label} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="priceRange"
                          value={range.label}
                          checked={selectedPriceRange === range.label}
                          onChange={(e) => setSelectedPriceRange(e.target.value)}
                          className="text-accent focus:ring-accent"
                        />
                        <span className="text-sm text-muted-foreground">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-6"
                  onClick={() => {
                    handleCategoryChange('All');
                    setSelectedSizes([]);
                    setSelectedColors([]);
                    setSelectedPriceRange('');
                  }}
                >
                  CLEAR FILTERS
                </Button>
              </div>
            </aside>

            {/* Products Section */}
            <main className="lg:w-3/4">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="lg:hidden flex items-center space-x-2 text-sm font-medium px-3 py-2 border border-border rounded hover:bg-muted transition-colors"
                  >
                    <Filter size={16} />
                    <span>FILTERS</span>
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  <select 
                    className="text-sm border border-border px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-accent rounded"
                    value={selectedCategory === 'New Drops' ? 'NEWEST FIRST' : 'FEATURED'}
                    onChange={(e) => {
                      // Handle sort changes here if needed
                    }}
                  >
                    <option value="FEATURED">SORT BY: FEATURED</option>
                    <option value="PRICE: LOW TO HIGH">PRICE: LOW TO HIGH</option>
                    <option value="PRICE: HIGH TO LOW">PRICE: HIGH TO LOW</option>
                    <option value="NEWEST FIRST">NEWEST FIRST</option>
                  </select>

                  <div className="flex border border-border rounded overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
                    >
                      <Grid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Grid */}

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading products...</p>
                </div>
              ) : (
                <div className={`grid gap-2 lg:gap-3 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {sortedProducts.map(product => (
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
              )}
            </main>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
