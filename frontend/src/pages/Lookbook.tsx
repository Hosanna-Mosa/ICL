import React, { useState, useEffect } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { lookbookAPI } from '@/utils/api';

const Lookbook: React.FC = () => {
  const [lookbookItems, setLookbookItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Street Inspirations');

  // Custom styles for desktop masonry layout
  const getDesktopHeight = (index: number) => {
    if (index % 3 === 0) return '600px';
    if (index % 4 === 1) return '500px';
    return '400px';
  };

  useEffect(() => {
    const fetchLookbookItems = async () => {
      try {
        setLoading(true);
        const response = await lookbookAPI.getByCategory(selectedCategory);
        if (response.success) {
          setLookbookItems(response.data);
        }
      } catch (err) {
        setError('Failed to load lookbook items');
        console.error('Error fetching lookbook items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLookbookItems();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <style>
        {`
          @media (min-width: 768px) {
            .desktop-masonry {
              height: var(--desktop-height) !important;
            }
          }
        `}
      </style>
      <Header />
      
      {/* Section Header */}
      <section className="pt-32 pb-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">LOOKBOOK</h1>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {['Street Inspirations', 'Urban Fits', 'Seasonal', 'Featured'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading lookbook items...</p>
          </div>
        </section>
      )}

      {/* Error State */}
      {error && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-destructive">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </section>
      )}

      {/* Lookbook Items Section */}
      {!loading && !error && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-12 text-center">
              {selectedCategory.toUpperCase()}
            </h2>
          
            {/* Masonry Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lookbookItems.map((item, index) => (
                <div 
                  key={item._id} 
                  className={`group relative overflow-hidden bg-card h-80 md:h-auto desktop-masonry ${
                    index % 3 === 0 ? 'md:row-span-2' : ''
                  } ${index % 4 === 1 ? 'lg:row-span-2' : ''}`}
                  style={{
                    '--desktop-height': getDesktopHeight(index)
                  } as React.CSSProperties}
                >
                  <div className="relative h-full overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white font-bold text-lg md:text-xl mb-1 md:mb-2">
                          {item.title}
                        </h3>
                        <p className="text-white/90 text-xs md:text-sm mb-2 md:mb-4">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap gap-1 md:gap-2">
                          {item.products.map((product, idx) => (
                            <span 
                              key={idx}
                              className="px-2 md:px-3 py-0.5 md:py-1 bg-white/20 text-white text-xs rounded-full"
                            >
                              {product}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}



      <Footer />
    </div>
  );
};

export default Lookbook;