import React, { useState } from 'react';
import { CreditCard, Smartphone, Coins } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import productHoodie from '@/assets/product-hoodie.jpg';
import productTee from '@/assets/product-tee.jpg';

const Checkout: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');
  const [useCoins, setUseCoins] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const cartItems = [
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
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = paymentMethod === 'upi' ? 0 : 150;
  const coinDiscount = useCoins ? 100 : 0;
  const total = subtotal + shipping - coinDiscount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Order placed:', { formData, paymentMethod, cartItems, total });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Checkout
          </h1>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Shipping Details */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-6">
                    Shipping Details
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        First Name *
                      </label>
                      <Input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Last Name *
                      </label>
                      <Input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone Number *
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Address *
                      </label>
                      <Input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Street address, building, apartment"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          City *
                        </label>
                        <Input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          State *
                        </label>
                        <Input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          PIN Code *
                        </label>
                        <Input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Payment Method */}
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-6">
                    Payment Method
                  </h2>
                  
                  <div className="space-y-4">
                    {/* UPI Payment */}
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        paymentMethod === 'upi' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-border/60'
                      }`}
                      onClick={() => setPaymentMethod('upi')}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="upi"
                          checked={paymentMethod === 'upi'}
                          onChange={() => setPaymentMethod('upi')}
                          className="text-primary"
                        />
                        <Smartphone className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">UPI Payment</p>
                          <p className="text-sm text-muted-foreground">
                            Pay via PhonePe, GPay, Paytm • Free shipping
                          </p>
                        </div>
                      </div>
                      
                      {paymentMethod === 'upi' && (
                        <div className="mt-4 p-4 bg-muted/30 rounded">
                          <p className="text-sm text-muted-foreground mb-3">
                            Scan QR code or pay via UPI ID
                          </p>
                          <div className="bg-white p-4 rounded inline-block">
                            <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/60 rounded flex items-center justify-center">
                              <CreditCard className="w-12 h-12 text-white" />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            UPI ID: icl@paytm
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* COD Payment */}
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        paymentMethod === 'cod' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-border/60'
                      }`}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="text-primary"
                        />
                        <CreditCard className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">
                            Pay when you receive • ₹150 shipping charge
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Coin Discount */}
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Checkbox
                      id="useCoins"
                      checked={useCoins}
                      onCheckedChange={(checked) => setUseCoins(checked as boolean)}
                    />
                    <label htmlFor="useCoins" className="flex items-center gap-2 cursor-pointer">
                      <Coins className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">Use 100 Coins (₹100 off)</span>
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You have 100 coins available. First-time buyer bonus!
                  </p>
                </div>
              </div>
              
              {/* Order Summary */}
              <div>
                <div className="bg-card p-6 shadow-soft sticky top-32">
                  <h2 className="text-xl font-bold text-foreground mb-6">
                    Order Summary
                  </h2>
                  
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-muted overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground text-sm">
                            {item.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Size: {item.size} • Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <hr className="border-border mb-4" />
                  
                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6">
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
                    
                    {useCoins && (
                      <div className="flex justify-between text-primary">
                        <span>Coin Discount</span>
                        <span>-₹{coinDiscount}</span>
                      </div>
                    )}
                    
                    <hr className="border-border" />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full btn-hero">
                    Place Order
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    By placing this order, you agree to our Terms & Conditions
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;