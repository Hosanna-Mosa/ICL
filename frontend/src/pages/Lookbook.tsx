import React from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import lookbookImage from '@/assets/lookbook-1.jpg';

const Lookbook: React.FC = () => {
  const lookbookItems = [
    {
      id: 1,
      image: lookbookImage,
      title: "Urban Minimalist",
      description: "Oversized Hoodie + Cargo Pants",
      products: ["Hoodie", "Pants"]
    },
    {
      id: 2,
      image: lookbookImage,
      title: "Street Comfort",
      description: "Essential Tee + Relaxed Fit",
      products: ["T-Shirt", "Joggers"]
    },
    {
      id: 3,
      image: lookbookImage,
      title: "Weekend Vibes",
      description: "Layered Look with Accessories",
      products: ["Hoodie", "Cap"]
    },
    {
      id: 4,
      image: lookbookImage,
      title: "Downtown Ready",
      description: "Clean Streetwear Essentials",
      products: ["Jacket", "Tee"]
    },
    {
      id: 5,
      image: lookbookImage,
      title: "Night Session",
      description: "Dark Tones with Statement Pieces",
      products: ["Hoodie", "Pants"]
    },
    {
      id: 6,
      image: lookbookImage,
      title: "Classic Edge",
      description: "Timeless Street Style",
      products: ["Tee", "Jeans"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            LOOKBOOK
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Street inspirations and urban fits showcasing the ICL lifestyle. 
            Discover how to style our premium streetwear pieces.
          </p>
        </div>
      </section>

      {/* Street Inspirations Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-12 text-center">
            STREET INSPIRATIONS
          </h2>
          
          {/* Masonry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lookbookItems.map((item, index) => (
              <div 
                key={item.id} 
                className={`group relative overflow-hidden bg-card ${
                  index % 3 === 0 ? 'md:row-span-2' : ''
                } ${index % 4 === 1 ? 'lg:row-span-2' : ''}`}
                style={{
                  height: index % 3 === 0 ? '600px' : index % 4 === 1 ? '500px' : '400px'
                }}
              >
                <div className="relative h-full overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white font-bold text-xl mb-2">
                        {item.title}
                      </h3>
                      <p className="text-white/90 text-sm mb-4">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.products.map((product, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 bg-white/20 text-white text-xs rounded-full"
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

      {/* Urban Fits Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-12 text-center">
            URBAN FITS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {lookbookItems.slice(0, 4).map((item) => (
              <div key={item.id} className="group relative overflow-hidden bg-card h-80">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h4 className="text-white font-medium text-sm">
                    {item.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Lookbook;