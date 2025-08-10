import React, { useEffect, useMemo, useState } from 'react';
import { CreditCard, Smartphone, Coins, ShoppingBag, Loader2 } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/UI/checkbox';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ordersAPI, userAPI } from '@/utils/api';
import { Link, useNavigate } from 'react-router-dom';

const Checkout: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');
  const [useCoins, setUseCoins] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const { cart, loading, applyCoinsDiscount, removeCoinsDiscount, refreshCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);

  // Keep coins toggle in sync with cart state
  useEffect(() => {
    setUseCoins((cart?.coinsUsed || 0) > 0);
  }, [cart?.coinsUsed]);

  // Load saved addresses
  useEffect(() => {
    (async () => {
      if (!isAuthenticated) return;
      try {
        const res = await userAPI.getAddresses();
        if (res.success) {
          setAddresses(res.data.addresses || []);
          const def = (res.data.addresses || []).find((a: any) => a.isDefault);
          if (def) setSelectedAddressId(def._id);
        }
      } catch (e) {
        /* ignore */
      }
    })();
  }, [isAuthenticated]);

  const cartItems = useMemo(() => cart?.items || [], [cart?.items]);
  const subtotal = cart?.subtotal || 0;
  // Shipping policy: free if subtotal > 2000 (aligns with backend)
  const shipping = cart && cart.subtotal > 2000 ? 0 : 150;
  const coinDiscount = cart?.coinsDiscount || 0;
  const total = (cart?.total || 0) + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to place your order',
        variant: 'destructive',
      });
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Add items to your cart before checking out',
        variant: 'destructive',
      });
      return;
    }

    // Validate that user has selected an address or filled in the form
    if (!selectedAddressId && (!formData.firstName || !formData.lastName || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode)) {
      toast({
        title: 'Address required',
        description: 'Please select a saved address or fill in the shipping details',
        variant: 'destructive',
      });
      return;
    }

    setPlacingOrder(true);
    try {
      const shippingAddress = selectedAddressId
        ? addresses.find((a) => a._id === selectedAddressId)
        : {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            street: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.pincode,
          };

      const response = await ordersAPI.createOrder({
        shippingAddress,
        payment: { method: paymentMethod },
      });

      if (response.success) {
        setPlacedOrder(response.data.order);
        setOrderPlaced(true);
        toast({ 
          title: 'Order placed successfully! 🎉', 
          description: `Order #${response.data.order.orderNumber} has been placed. You will receive a confirmation email shortly.` 
        });
        await refreshCart();
        // Redirect after a short delay to show the success message
        setTimeout(() => {
          navigate('/account?tab=orders');
        }, 2000);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to place order',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to place order', variant: 'destructive' });
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleSaveAddress = async () => {
    try {
      const addr = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.pincode,
        isDefault: addresses.length === 0,
      };
      const res = editingAddressId
        ? await userAPI.updateAddress(editingAddressId, addr)
        : await userAPI.addAddress(addr);
      if (res.success) {
        setAddresses(res.data.addresses);
        const last = res.data.addresses[res.data.addresses.length - 1];
        setSelectedAddressId(editingAddressId || (last && last._id) || null);
        setEditingAddressId(null);
        setShowAddAddressForm(false);
        toast({ title: 'Address saved' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to save address', variant: 'destructive' });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const res = await userAPI.deleteAddress(addressId);
      if (res.success) {
        setAddresses(res.data.addresses);
        if (selectedAddressId === addressId) setSelectedAddressId(null);
        // If no addresses left, show the add address form
        if (res.data.addresses.length === 0) {
          setShowAddAddressForm(true);
        }
        toast({ title: 'Address deleted' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to delete address', variant: 'destructive' });
    }
  };

  const handleUpdateAddress = async (addressId: string, update: any) => {
    try {
      const res = await userAPI.updateAddress(addressId, update);
      if (res.success) {
        setAddresses(res.data.addresses);
        toast({ title: 'Address updated' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to update address', variant: 'destructive' });
    }
  };

  const handleCoinsToggle = async (checked: boolean) => {
    setUseCoins(checked);
    try {
      if (checked) {
        // Apply a flat 100 coin discount if supported
        await applyCoinsDiscount(100);
      } else {
        await removeCoinsDiscount();
      }
    } catch (error) {
      // Re-sync if anything failed
      await refreshCart();
    }
  };

  // Loading and access states
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Sign in to checkout</h1>
            <p className="text-muted-foreground text-lg mb-8">Please sign in to continue to checkout.</p>
            <div className="flex gap-4 justify-center">
              <Link to="/login"><Button className="btn-hero">Sign In</Button></Link>
              <Link to="/register"><Button variant="outline">Create Account</Button></Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Your cart is empty</h1>
            <Link to="/shop"><Button className="btn-hero">Continue Shopping</Button></Link>
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
                  {/* Saved addresses list */}
                  {addresses.length > 0 && (
                    <div className="mb-6 space-y-3">
                      <p className="text-sm text-muted-foreground">Select a saved address:</p>
                      <div className="space-y-2">
                        {addresses.map((a) => (
                          <div key={a._id} className={`border rounded p-3 flex items-start justify-between ${selectedAddressId === a._id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                            <label className="flex items-start gap-3 cursor-pointer w-full">
                              <input 
                                type="radio" 
                                name="selectedAddress" 
                                checked={selectedAddressId === a._id} 
                                onChange={() => !placingOrder && setSelectedAddressId(a._id)} 
                                disabled={placingOrder}
                              />
                              <div className="text-sm">
                                <div className="font-medium text-foreground">{a.firstName} {a.lastName} • {a.phone}</div>
                                <div className="text-muted-foreground">
                                  {a.street}, {a.city}, {a.state} {a.zipCode}
                                </div>
                              </div>
                            </label>
                            <div className="flex gap-2 ml-3">
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => !placingOrder && handleUpdateAddress(a._id, { isDefault: !a.isDefault })}
                                disabled={placingOrder}
                              >
                                {a.isDefault ? 'Default' : 'Make Default'}
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => !placingOrder && (() => { setEditingAddressId(a._id); setFormData({ firstName: a.firstName, lastName: a.lastName, email: formData.email, phone: a.phone, address: a.street, city: a.city, state: a.state, pincode: a.zipCode }); })()}
                                disabled={placingOrder}
                              >
                                Edit
                              </Button>
                              <Button 
                                type="button" 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => !placingOrder && handleDeleteAddress(a._id)}
                                disabled={placingOrder}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Add new address button */}
                      <div className="pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => !placingOrder && setShowAddAddressForm(true)}
                          disabled={placingOrder}
                          className="flex items-center gap-2 text-primary border-primary hover:bg-primary/5 hover:border-primary/80 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add New Address
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Show message when no saved addresses */}
                  {addresses.length === 0 && (
                    <div className="mb-6 p-4 bg-muted/30 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-2">No saved addresses found</p>
                      <p className="text-xs text-muted-foreground">Please add your shipping address below</p>
                    </div>
                  )}
                  
                  {/* Address form - only show if no saved addresses or if user wants to add new */}
                  {(addresses.length === 0 || editingAddressId || showAddAddressForm) && (
                    <div>
                      {(addresses.length === 0 || showAddAddressForm) && (
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                          {addresses.length === 0 ? 'Add Shipping Address' : 'Add New Address'}
                        </h3>
                      )}
                      {editingAddressId && (
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                          Edit Address
                        </h3>
                      )}
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
                        disabled={placingOrder}
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
                        disabled={placingOrder}
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
                        disabled={placingOrder}
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
                        disabled={placingOrder}
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
                        disabled={placingOrder}
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
                          disabled={placingOrder}
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
                          disabled={placingOrder}
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
                          disabled={placingOrder}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleSaveAddress}
                      disabled={placingOrder}
                    >
                      Save Address
                    </Button>
                    {(editingAddressId || showAddAddressForm) && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setEditingAddressId(null);
                          setShowAddAddressForm(false);
                          setFormData({ firstName: '', lastName: '', email: formData.email, phone: '', address: '', city: '', state: '', pincode: '' });
                        }}
                        disabled={placingOrder}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
                  )}
                </div>
                
                {/* Payment Method */}
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-6">
                    Payment Method
                  </h2>
                  
                  <div className="space-y-4">
                    {/* UPI Payment */}
                    <div 
                      className={`border-2 rounded-lg p-4 transition-colors ${
                        paymentMethod === 'upi' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-border/60'
                      } ${placingOrder ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={() => !placingOrder && setPaymentMethod('upi')}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="upi"
                          checked={paymentMethod === 'upi'}
                          onChange={() => setPaymentMethod('upi')}
                          className="text-primary"
                          disabled={placingOrder}
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
                      className={`border-2 rounded-lg p-4 transition-colors ${
                        paymentMethod === 'cod' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-border/60'
                      } ${placingOrder ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={() => !placingOrder && setPaymentMethod('cod')}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="text-primary"
                          disabled={placingOrder}
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
                      onCheckedChange={(checked) => !placingOrder && handleCoinsToggle(!!checked)}
                      disabled={placingOrder}
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
                <div className={`bg-card p-6 shadow-soft sticky top-32 ${placingOrder ? 'opacity-75' : ''}`}>
                  <h2 className="text-xl font-bold text-foreground mb-6">
                    Order Summary
                  </h2>
                  
                   {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={`${item.product._id}-${item.size}`} className="flex gap-3">
                        <div className="w-16 h-16 bg-muted overflow-hidden">
                          <img
                            src={item.product.images[0]?.url || '/placeholder.svg'}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground text-sm">
                            {item.product.name}
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
                    
                    {coinDiscount > 0 && (
                      <div className="flex justify-between text-primary">
                        <span>Coin Discount</span>
                        <span>-₹{coinDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    <hr className="border-border" />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full btn-hero" disabled={placingOrder}>
                    {placingOrder ? (
                      <span className="inline-flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                        Placing Order...
                      </span>
                    ) : (
                      'PLACE ORDER'
                    )}
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
      
      {/* Order Success Overlay */}
      {orderPlaced && placedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-8 rounded-lg shadow-soft max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Order Placed!</h2>
            <p className="text-muted-foreground mb-4">
              Your order #{placedOrder.orderNumber} has been successfully placed.
            </p>
            <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-medium text-foreground mb-2">Order Details:</p>
              <p className="text-sm text-muted-foreground">Total: ₹{placedOrder.total.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Payment: {placedOrder.payment.method.toUpperCase()}</p>
              <p className="text-sm text-muted-foreground">Items: {placedOrder.items.length}</p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Redirecting to your account page to view order details...
            </p>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;