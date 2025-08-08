import React, { useState } from 'react';
import { Heart, ShoppingCart, Plus, Minus, Ruler, Star } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import Button from '@/components/UI/ICLButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Mock product images
import heroImage from '@/assets/hero-image.jpg';
import productHoodie from '@/assets/product-hoodie.jpg';
import productTee from '@/assets/product-tee.jpg';
import productPants from '@/assets/product-pants.jpg';

const ProductDetail = () => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const productImages = [heroImage, productHoodie, productTee, productPants];
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const unavailableSizes = ['S', 'XXL'];

  const product = {
    name: "Premium Oversized Hoodie",
    price: 4499,
    originalPrice: 5999,
    rating: 4.8,
    reviews: 127,
    description: "Crafted from premium 100% cotton fleece with an oversized silhouette. Features a kangaroo pocket, ribbed cuffs, and our signature embroidered logo. Perfect for layering or wearing solo for that effortless streetwear aesthetic.",
    fabric: "100% Cotton Fleece",
    gsm: "350 GSM",
    fit: "Oversized",
    washCare: "Machine wash cold, Do not bleach, Tumble dry low",
    coins: 45
  };

  const relatedProducts = [
    { id: 1, name: "Urban Cargo Pants", price: 3299, image: productPants },
    { id: 2, name: "Classic Oversized Tee", price: 1899, image: productTee },
    { id: 3, name: "Street Essential Hoodie", price: 4199, image: productHoodie }
  ];

  const sizeChart = {
    'S': { chest: '40-42', length: '27', shoulder: '20' },
    'M': { chest: '42-44', length: '28', shoulder: '21' },
    'L': { chest: '44-46', length: '29', shoulder: '22' },
    'XL': { chest: '46-48', length: '30', shoulder: '23' },
    'XXL': { chest: '48-50', length: '31', shoulder: '24' }
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Image Gallery Section */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-lg bg-surface">
                <AspectRatio ratio={1}>
                  <img
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </AspectRatio>
                {/* Wishlist Button */}
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background"
                >
                  <Heart 
                    className={`w-5 h-5 ${isWishlisted ? 'fill-accent text-accent' : 'text-foreground'}`} 
                  />
                </button>
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex gap-3 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="space-y-6">
              {/* Title and Rating */}
              <div>
                <h1 className="text-hero font-bold mb-2">{product.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-foreground">₹{product.price.toLocaleString()}</span>
                <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
                <span className="px-2 py-1 bg-accent text-accent-foreground text-sm font-medium rounded">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </span>
              </div>

              {/* Coins Notice */}
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm text-primary font-medium">
                  🪙 Earn {product.coins} coins on this purchase (worth ₹{product.coins})
                </p>
              </div>

              {/* Size Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Size</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-1 text-sm text-primary hover:underline">
                        <Ruler className="w-4 h-4" />
                        Size Chart
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Size Chart (in inches)</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <div className="grid grid-cols-4 gap-2 text-sm font-medium border-b pb-2">
                          <span>Size</span>
                          <span>Chest</span>
                          <span>Length</span>
                          <span>Shoulder</span>
                        </div>
                        {Object.entries(sizeChart).map(([size, measurements]) => (
                          <div key={size} className="grid grid-cols-4 gap-2 text-sm">
                            <span className="font-medium">{size}</span>
                            <span>{measurements.chest}</span>
                            <span>{measurements.length}</span>
                            <span>{measurements.shoulder}</span>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={unavailableSizes.includes(size)}
                      className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-primary-foreground'
                          : unavailableSizes.includes(size)
                          ? 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                          : 'border-border bg-background text-foreground hover:border-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <h3 className="font-medium">Quantity</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decrementQuantity}
                    className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 border border-border rounded-lg min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="space-y-3">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={!selectedSize}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart - ₹{(product.price * quantity).toLocaleString()}
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  <p>• Free shipping on UPI payments</p>
                  <p>• COD available (₹50 shipping charges apply)</p>
                  <p>• 7-day easy returns & exchanges</p>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4 pt-6 border-t border-border">
                <h3 className="font-medium">Product Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Fabric:</span>
                    <p className="font-medium">{product.fabric}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">GSM:</span>
                    <p className="font-medium">{product.gsm}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fit:</span>
                    <p className="font-medium">{product.fit}</p>
                  </div>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Description:</span>
                  <p className="mt-1 text-sm leading-relaxed">{product.description}</p>
                </div>

                <div>
                  <span className="text-muted-foreground">Care Instructions:</span>
                  <p className="mt-1 text-sm">{product.washCare}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <section className="mt-16">
            <h2 className="text-section font-bold mb-8 text-center">You May Also Like</h2>
            <Carousel className="w-full max-w-5xl mx-auto">
              <CarouselContent>
                {relatedProducts.map((relatedProduct) => (
                  <CarouselItem key={relatedProduct.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="group card-product p-0 overflow-hidden">
                      <AspectRatio ratio={1}>
                        <img
                          src={relatedProduct.image}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </AspectRatio>
                      <div className="p-4">
                        <h3 className="font-medium mb-2">{relatedProduct.name}</h3>
                        <p className="text-lg font-bold">₹{relatedProduct.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>
        </div>
      </main>

      {/* Mobile Sticky Add to Cart */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          variant="hero"
          size="lg"
          className="w-full"
          disabled={!selectedSize}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Add to Cart - ₹{(product.price * quantity).toLocaleString()}
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;