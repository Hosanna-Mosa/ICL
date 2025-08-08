import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import productHoodie from '@/assets/product-hoodie.jpg';
import productTee from '@/assets/product-tee.jpg';

interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: 'Oversized Black Hoodie',
      image: productHoodie,
      price: 2499,
      size: 'L',
      quantity: 1
    },
    {
      id: 2,
      name: 'Essential White Tee',
      image: productTee,
      price: 1299,
      size: 'M',
      quantity: 2
    }
  ]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id);
      return;
    }
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 2000 ? 0 : 150;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Your Cart is Empty
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Looks like you haven't added anything to your cart yet. 
                Start shopping and discover our latest streetwear collection.
              </p>
              <Link to="/shop">
                <Button className="btn-hero">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Shopping Cart
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-card p-6 shadow-soft">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Product Image */}
                      <div className="w-full sm:w-32 h-40 bg-muted overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="font-bold text-foreground text-lg">
                            {item.name}
                          </h3>
                          <p className="text-muted-foreground">Size: {item.size}</p>
                          <p className="text-foreground font-bold text-lg">
                            ₹{item.price.toLocaleString()}
                          </p>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Qty:</span>
                            <div className="flex items-center border rounded">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-2 hover:bg-muted transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-2 hover:bg-muted transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:text-destructive/80 p-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {/* Subtotal */}
                        <div className="text-right">
                          <p className="font-bold text-foreground">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card p-6 shadow-soft sticky top-32">
                <h2 className="text-xl font-bold text-foreground mb-6">
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">₹{subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  
                  <hr className="border-border" />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">₹{total.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Shipping Info */}
                <div className="bg-muted/30 p-4 rounded mb-6">
                  <p className="text-sm text-muted-foreground">
                    <strong>Free shipping</strong> on UPI payments
                  </p>
                  <p className="text-sm text-muted-foreground">
                    COD charges: ₹150 extra
                  </p>
                </div>
                
                {/* Coin Discount */}
                <div className="bg-primary/10 border border-primary/20 p-4 rounded mb-6">
                  <p className="text-sm text-primary font-medium mb-2">
                    🪙 First-time buyer?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Get 100 coins worth ₹100 off on your first order!
                  </p>
                </div>
                
                <Link to="/checkout" className="block">
                  <Button className="w-full btn-hero">
                    Proceed to Checkout
                  </Button>
                </Link>
                
                <Link to="/shop" className="block mt-4">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart;