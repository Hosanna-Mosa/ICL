import React, { useState } from 'react';
import { Trash2, ShoppingBag, Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/UI/toast';

const Cart: React.FC = () => {
  const { cart, loading, removeFromCart, clearCart, addToCart, updateItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [clearingCart, setClearingCart] = useState(false);
  const { toast } = useToast();

  

  const handleRemoveItem = async (productId: string, size: string) => {
    const itemKey = `${productId}-${size}`;
    setUpdatingItems(prev => new Set(prev).add(itemKey));
    const removedItem = cart?.items.find(
      (i) => i.product._id === productId && i.size === size
    );
    const removedQuantity = removedItem?.quantity ?? 1;
    const removedName = removedItem?.product.name ?? 'Item';
    
    try {
      const success = await removeFromCart(productId, size);
      if (success) {
        toast({
          title: 'Removed from cart',
          description: `${removedName} removed from your cart`,
          action: (
            <ToastAction
              altText="Undo"
              onClick={async () => {
                try {
                  await addToCart(productId, size, removedQuantity);
                } catch (e: any) {
                  console.error('Undo add to cart failed:', e);
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
      }
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    setClearingCart(true);
    try {
      await clearCart();
    } finally {
      setClearingCart(false);
    }
  };

  // Calculate shipping based on subtotal
  const shipping = cart && cart.subtotal > 2000 ? 0 : 150;
  const total = cart ? cart.total + shipping : 0;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your cart...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Sign in to view your cart
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Please sign in to access your shopping cart and continue shopping.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/login">
                  <Button className="btn-hero">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline">Create Account</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show empty cart
  if (!cart || cart.items.length === 0) {
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
      <Header />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">SHOPPING CART</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCart}
              disabled={clearingCart}
              className="text-destructive hover:text-destructive border-destructive hover:border-destructive"
            >
              {clearingCart ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Clear Cart
                </>
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {cart.items.map((item) => {
                  const itemKey = `${item.product._id}-${item.size}`;
                  const isUpdating = updatingItems.has(itemKey);
                  const currentPrice = item.price;
                  
                  return (
                    <div key={itemKey} className="bg-card p-6 shadow-soft">
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* Product Image */}
                        <div className="w-full sm:w-32 h-40 bg-muted overflow-hidden">
                          <img 
                            src={item.product.images[0]?.url || '/placeholder.svg'} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="font-bold text-foreground text-lg">
                              {item.product.name}
                            </h3>
                            <p className="text-muted-foreground">Size: {item.size}</p>
                            <p className="text-foreground font-bold text-lg">
                              ₹{currentPrice.toLocaleString()}
                            </p>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => updateItemQuantity(item.product._id, item.size, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center select-none">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => updateItemQuantity(item.product._id, item.size, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>

                            {/* Remove */}
                            <div className="flex items-center">
                            <button
                              onClick={() => handleRemoveItem(item.product._id, item.size)}
                              disabled={isUpdating}
                              className="text-destructive hover:text-destructive/80 p-2 disabled:opacity-50"
                              title="Remove item"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </button>
                            </div>
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
                  );
                })}
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
                    <span className="text-foreground">₹{cart.subtotal.toLocaleString()}</span>
                  </div>
                  
                  {cart.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount</span>
                      <span>-₹{cart.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {cart.coinsDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coins Discount</span>
                      <span>-₹{cart.coinsDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  
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