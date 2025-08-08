import React, { useState } from 'react';
import { Filter, Grid, List, Heart } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import Button from '@/components/UI/ICLButton';
import { Link } from 'react-router-dom';

// Mock product data
const products = [
  {
    id: '1',
    name: 'Oversized Logo Hoodie',
    price: 2999,
    originalPrice: 3499,
    image: '/src/assets/product-hoodie.jpg',
    category: 'Hoodies',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'White', 'Grey'],
    isNew: true
  },
  {
    id: '2',
    name: 'Essential Oversized Tee',
    price: 1299,
    image: '/src/assets/product-tee.jpg',
    category: 'Tees',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Black', 'Beige'],
    isNew: true
  },
  // Add more products as needed
];

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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'All' && product.category !== selectedCategory) return false;
    // Add more filter logic here
    return true;
  });

  return (
    <div className="min-h-screen">
      <Header cartItemsCount={0} />
      
      <main className="pt-20">
        {/* Page Header */}
        <section className="py-12 bg-secondary">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center">
              <h1 className="text-section mb-4">SHOP ALL</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover the complete ICL collection. Premium streetwear designed for the urban lifestyle.
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Filters Sidebar */}
            <aside className={`lg:w-1/4 space-y-6 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-24">
                <h3 className="text-lg font-semibold mb-4">FILTERS</h3>
                
                {/* Categories */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium tracking-widest uppercase">Category</h4>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
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
                    setSelectedCategory('All');
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
                    className="lg:hidden flex items-center space-x-2 text-sm font-medium"
                  >
                    <Filter size={16} />
                    <span>FILTERS</span>
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {filteredProducts.length} products
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <select className="text-sm border border-border px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-accent">
                    <option>SORT BY: FEATURED</option>
                    <option>PRICE: LOW TO HIGH</option>
                    <option>PRICE: HIGH TO LOW</option>
                    <option>NEWEST FIRST</option>
                  </select>

                  <div className="flex border border-border">
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
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map(product => (
                  <div key={product.id} className="card-product group">
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
            </main>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;