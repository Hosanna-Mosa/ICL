import React, { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Smartphone,
  Coins,
  ShoppingBag,
  Loader2,
  Shield,
} from "lucide-react";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Checkbox } from "@/components/UI/checkbox";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ordersAPI, userAPI, paymentAPI } from "@/utils/api";
import { Link, useNavigate } from "react-router-dom";
import { CheckoutSkeleton } from "@/components/skeletons";

const Checkout: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<
    "razorpay" | "upi" | "cod"
  >("razorpay");
  const [useCoins, setUseCoins] = useState(false);
  const [userCoins, setUserCoins] = useState(0);
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [loadingCoins, setLoadingCoins] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const {
    cart,
    loading,
    applyCoinsDiscount,
    removeCoinsDiscount,
    refreshCart,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);

  // Load user's coin balance
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserCoins();
    }
  }, [isAuthenticated]);

  // Note: Do not auto-apply or auto-remove coins here to avoid loops/log spam

  // Keep coins toggle in sync with cart state
  useEffect(() => {
    const cartHasCoins = (cart?.coinsUsed || 0) > 0;
    setUseCoins(cartHasCoins);
    if (cartHasCoins && cart?.coinsUsed) {
      setCoinsToUse(cart.coinsUsed);
         } else if (!cartHasCoins) {
       // Reset local state when cart has no coins
       setUseCoins(false);
       setCoinsToUse(0);
     }
  }, [cart?.coinsUsed, cart?.coinsDiscount]);

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

  const fetchUserCoins = async () => {
    try {
      setLoadingCoins(true);
      const response = await userAPI.getUserCoins();
      if (response.success) {
        setUserCoins(response.data.coins);
        // Don't automatically set default coins - let user choose manually
      }
    } catch (error) {
      console.error("Error fetching user coins:", error);
      toast({
        title: "Error",
        description: "Failed to load your coin balance",
        variant: "destructive",
      });
    } finally {
      setLoadingCoins(false);
    }
  };

  const cartItems = useMemo(() => cart?.items || [], [cart?.items]);
  const subtotal = cart?.subtotal || 0;
  // Shipping policy: free if subtotal > 2000 (aligns with backend)
  const shipping = cart && cart.subtotal > 2000 ? 0 : 150;
  // Use local state for coins to ensure UI updates immediately
  const coinsAreUsed = useCoins && (cart?.coinsUsed || 0) > 0;
  const coinDiscount = coinsAreUsed ? cart?.coinsDiscount || 0 : 0;
  // Calculate GST (18%) on subtotal after coin discount
  const gstAmount = Math.round((subtotal - coinDiscount) * 0.18);
  const total = subtotal - coinDiscount + gstAmount + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to place your order",
        variant: "destructive",
      });
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before checking out",
        variant: "destructive",
      });
      return;
    }

    // Validate that user has selected an address or filled in the form
    if (
      !selectedAddressId &&
      (!formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.phone ||
        !formData.address ||
        !formData.city ||
        !formData.state ||
        !formData.pincode)
    ) {
      toast({
        title: "Address required",
        description:
          "Please select a saved address or fill in all shipping details including email",
        variant: "destructive",
      });
      return;
    }

    // Validate email format if provided
    if (!selectedAddressId && formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate phone number format if provided
    if (!selectedAddressId && formData.phone) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast({
          title: "Invalid phone number",
          description: "Please enter a valid 10-digit Indian phone number",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate PIN code format if provided
    if (!selectedAddressId && formData.pincode) {
      const pincodeRegex = /^[1-9][0-9]{5}$/;
      if (!pincodeRegex.test(formData.pincode)) {
        toast({
          title: "Invalid PIN code",
          description: "Please enter a valid 6-digit PIN code",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate coins usage
    if (useCoins && coinsToUse > userCoins) {
      toast({
        title: "Insufficient coins",
        description: "You don't have enough coins for this purchase",
        variant: "destructive",
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

      if (paymentMethod === "razorpay") {
        // Handle Razorpay payment
        await handleRazorpayPayment(shippingAddress);
      } else {
        // Handle regular order (UPI/COD)
        const response = await ordersAPI.createOrder({
          shippingAddress,
          payment: { method: paymentMethod },
        });

        if (response.success) {
          setPlacedOrder(response.data.order);
          setOrderPlaced(true);
          toast({
            title: "Order placed successfully! 🎉",
            description: `Order #${response.data.order.orderNumber} has been placed. You will receive a confirmation email shortly.`,
          });
          await refreshCart();
          // Redirect after a short delay to show the success message
          setTimeout(() => {
            navigate("/account?tab=orders");
          }, 2000);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to place order",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleRazorpayPayment = async (shippingAddress: any) => {
    try {
      // Ensure a valid Razorpay key is configured
      const keyId =
        (import.meta as any).env.VITE_RAZORPAY_KEY_ID ||
        "rzp_test_R5DtKTSP8JHmK7";
      if (!keyId || typeof keyId !== "string" || !keyId.startsWith("rzp_")) {
        toast({
          title: "Razorpay key missing/invalid",
          description:
            "Set VITE_RAZORPAY_KEY_ID in your frontend .env (use your Razorpay Test Key ID) and restart the dev server.",
          variant: "destructive",
        });
        return;
      }

      // Amount to pay in paise (sub-total after coin discount + gst + shipping)
      let amountPaise = Math.round(total * 100);
      // Razorpay requires minimum ₹1 (100 paise)
      if (amountPaise < 100) amountPaise = 100;

      const options = {
        key: keyId,
        amount: amountPaise,
        currency: "INR",
        name: "BRELIS",
        description: `Checkout Payment`,
        handler: async function (response: any) {
          try {
            // Directly create the order on backend with gateway info
            const orderResponse = await ordersAPI.createOrder({
              shippingAddress,
              payment: {
                method: "razorpay",
                transactionId: response.razorpay_payment_id,
                gateway: "razorpay",
                gatewayResponse: response,
              },
            });

            if (orderResponse.success) {
              setPlacedOrder(orderResponse.data.order);
              setOrderPlaced(true);
              toast({
                title: "Payment successful! 🎉",
                description: `Order #${orderResponse.data.order.orderNumber} has been placed and payment received.`,
              });
              await refreshCart();
              setTimeout(() => {
                navigate("/account?tab=orders");
              }, 2000);
            } else {
              throw new Error(
                orderResponse.message || "Failed to create order after payment"
              );
            }
          } catch (error: any) {
            toast({
              title: "Order Creation Error",
              description:
                error.message || "Failed to create order after payment",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          email: formData.email || "",
          contact: shippingAddress.phone,
        },
        theme: { color: "#000000" },
        modal: {
          ondismiss: function () {
            toast({
              title: "Payment cancelled",
              description:
                "You can try again or choose a different payment method",
              variant: "destructive",
            });
          },
        },
      } as any;

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      throw new Error(error.message || "Failed to initialize payment");
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
        toast({ title: "Address saved" });
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to save address",
        variant: "destructive",
      });
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
        toast({ title: "Address deleted" });
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to delete address",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAddress = async (addressId: string, update: any) => {
    try {
      const res = await userAPI.updateAddress(addressId, update);
      if (res.success) {
        setAddresses(res.data.addresses);
        toast({ title: "Address updated" });
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to update address",
        variant: "destructive",
      });
    }
  };

    const handleCoinsToggle = async (checked: boolean) => {
    setUseCoins(checked);
    try {
      if (checked) {
        // Apply the selected coin amount
        await applyCoinsDiscount(coinsToUse);
      } else {
        // Remove coins discount and reset local state
        await removeCoinsDiscount();
        setCoinsToUse(0); // Reset to 0
      }
    } catch (error) {
      // Re-sync if anything failed
      await refreshCart();
      // Reset local state on error
      setUseCoins(false);
      setCoinsToUse(0);
    }
  };

  const handleCoinsAmountChange = async () => {
    if (!useCoins) return;

    try {
      await applyCoinsDiscount(coinsToUse);
    } catch (error) {
      // Re-sync if anything failed
      await refreshCart();
      // Reset local state on error
      setUseCoins(false);
      setCoinsToUse(0);
    }
  };

  // Handle coin submission
  const handleCoinSubmit = async () => {
    if (!useCoins) return;

    try {
      await applyCoinsDiscount(coinsToUse);
      toast({
        title: "Coins applied successfully!",
        description: `₹${coinsToUse} discount applied to your order`,
      });
    } catch (error) {
      // Re-sync if anything failed
      await refreshCart();
      // Reset local state on error
      setUseCoins(false);
      setCoinsToUse(0);
      toast({
        title: "Error applying coins",
        description: "Failed to apply coins. Please try again.",
        variant: "destructive",
      });
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
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Sign in to checkout
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Please sign in to continue to checkout.
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
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Your cart is empty
            </h1>
            <Link to="/shop">
              <Button className="btn-hero">Continue Shopping</Button>
            </Link>
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6 lg:mb-8">
            Checkout
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Shipping Details */}
              <div className="space-y-6 lg:space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4 lg:mb-6">
                    Shipping Details
                  </h2>
                  {/* Saved addresses list */}
                  {addresses.length > 0 && (
                    <div className="mb-6 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Select a saved address:
                      </p>
                      <div className="space-y-2">
                        {addresses.map((a) => (
                          <div
                            key={a._id}
                            className={`border rounded-lg p-4 transition-all duration-200 ${
                              selectedAddressId === a._id
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-border/60"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <label className="flex items-start gap-3 cursor-pointer flex-1 min-w-0">
                                <input
                                  type="radio"
                                  name="selectedAddress"
                                  checked={selectedAddressId === a._id}
                                  onChange={() =>
                                    !placingOrder && setSelectedAddressId(a._id)
                                  }
                                  disabled={placingOrder}
                                  className="mt-1 text-primary"
                                />
                                <div className="text-sm min-w-0 flex-1">
                                  <div className="font-medium text-foreground mb-1 break-words">
                                    {a.firstName} {a.lastName}
                                  </div>
                                  <div className="text-muted-foreground mb-1 break-words">
                                    {a.phone}
                                  </div>
                                  <div className="text-muted-foreground text-xs leading-relaxed break-words">
                                    {a.street}, {a.city}, {a.state} {a.zipCode}
                                  </div>
                                </div>
                              </label>
                              
                              {/* Action buttons - responsive layout */}
                              <div className="flex flex-col sm:flex-row gap-2 sm:ml-3 sm:flex-shrink-0">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    !placingOrder &&
                                    handleUpdateAddress(a._id, {
                                      isDefault: !a.isDefault,
                                    })
                                  }
                                  disabled={placingOrder}
                                  className="w-full sm:w-auto text-xs sm:text-sm px-3 py-2 h-auto"
                                >
                                  {a.isDefault ? "Default" : "Make Default"}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    !placingOrder &&
                                    (() => {
                                      setEditingAddressId(a._id);
                                      setFormData({
                                        firstName: a.firstName,
                                        lastName: a.lastName,
                                        email: formData.email,
                                        phone: a.phone,
                                        address: a.street,
                                        city: a.city,
                                        state: a.state,
                                        pincode: a.zipCode,
                                      });
                                    })()
                                  }
                                  disabled={placingOrder}
                                  className="w-full sm:w-auto text-xs sm:text-sm px-3 py-2 h-auto"
                                >
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    !placingOrder && handleDeleteAddress(a._id)
                                  }
                                  disabled={placingOrder}
                                  className="w-full sm:w-auto text-xs sm:text-sm px-3 py-2 h-auto"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add new address button */}
                      <div className="pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            !placingOrder && setShowAddAddressForm(true)
                          }
                          disabled={placingOrder}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 text-primary border-primary hover:bg-primary/5 hover:border-primary/80 transition-all duration-200 py-3 px-4"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Add New Address
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Show message when no saved addresses */}
                  {addresses.length === 0 && (
                    <div className="mb-6 p-4 bg-muted/30 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        No saved addresses found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Please add your shipping address below
                      </p>
                    </div>
                  )}

                  {/* Address form - only show if no saved addresses or if user wants to add new */}
                  {(addresses.length === 0 ||
                    editingAddressId ||
                    showAddAddressForm) && (
                    <div>
                      {(addresses.length === 0 || showAddAddressForm) && (
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                          {addresses.length === 0
                            ? "Add Shipping Address"
                            : "Add New Address"}
                        </h3>
                      )}
                      {editingAddressId && (
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                          Edit Address
                        </h3>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                            className="w-full"
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
                            className="w-full"
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                              className="w-full"
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
                              className="w-full"
                            />
                          </div>
                          <div className="sm:col-span-2 lg:col-span-1">
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
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSaveAddress}
                          disabled={placingOrder}
                          className="w-full sm:w-auto order-2 sm:order-1"
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
                              setFormData({
                                firstName: "",
                                lastName: "",
                                email: formData.email,
                                phone: "",
                                address: "",
                                city: "",
                                state: "",
                                pincode: "",
                              });
                            }}
                            disabled={placingOrder}
                            className="w-full sm:w-auto order-1 sm:order-2"
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
                  <h2 className="text-xl font-bold text-foreground mb-4 lg:mb-6">
                    Payment Method
                  </h2>

                  <div className="space-y-4">
                    {/* Razorpay Payment */}
                    <div
                      className={`border-2 rounded-lg p-4 transition-colors ${
                        paymentMethod === "razorpay"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-border/60"
                      } ${
                        placingOrder
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      onClick={() =>
                        !placingOrder && setPaymentMethod("razorpay")
                      }
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="razorpay"
                          checked={paymentMethod === "razorpay"}
                          onChange={() => setPaymentMethod("razorpay")}
                          className="text-primary"
                          disabled={placingOrder}
                        />
                        <Shield className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">
                            Secure Payment Gateway
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Credit/Debit Cards, UPI, Net Banking • Free shipping
                          </p>
                        </div>
                      </div>

                      {paymentMethod === "razorpay" && (
                        <div className="mt-4 p-4 bg-muted/30 rounded">
                          <p className="text-sm text-muted-foreground mb-3">
                            Pay securely via Razorpay gateway
                          </p>
                          <div className="bg-white p-4 rounded inline-block">
                            <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/60 rounded flex items-center justify-center">
                              <Shield className="w-12 h-12 text-white" />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Supports all major payment methods
                          </p>
                        </div>
                      )}
                    </div>

                    {/* UPI Payment */}
                    <div
                      className={`border-2 rounded-lg p-4 transition-colors ${
                        paymentMethod === "upi"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-border/60"
                      } ${
                        placingOrder
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      onClick={() => !placingOrder && setPaymentMethod("upi")}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="upi"
                          checked={paymentMethod === "upi"}
                          onChange={() => setPaymentMethod("upi")}
                          className="text-primary"
                          disabled={placingOrder}
                        />
                        <Smartphone className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">
                            UPI Payment
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Pay via PhonePe, GPay, Paytm • Free shipping
                          </p>
                        </div>
                      </div>

                      {paymentMethod === "upi" && (
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
                            UPI ID: brelis@paytm
                          </p>
                        </div>
                      )}
                    </div>

                    {/* COD Payment */}
                    <div
                      className={`border-2 rounded-lg p-4 transition-colors ${
                        paymentMethod === "cod"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-border/60"
                      } ${
                        placingOrder
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      onClick={() => !placingOrder && setPaymentMethod("cod")}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                          className="text-primary"
                          disabled={placingOrder}
                        />
                        <CreditCard className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">
                            Cash on Delivery
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Pay when you receive • ₹150 shipping charge
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coin Discount */}
                {userCoins > 0 && (
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Coins className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id="useCoins"
                            checked={useCoins}
                            onCheckedChange={(checked) =>
                              !placingOrder && handleCoinsToggle(!!checked)
                            }
                            disabled={placingOrder || loadingCoins}
                          />
                          <label
                            htmlFor="useCoins"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <span className="font-semibold text-foreground">
                              Use Coins for Discount
                            </span>
                          </label>
                        </div>
                        <p className="text-sm text-muted-foreground ml-7">
                          Redeem your earned coins for instant discounts
                        </p>
                      </div>
                    </div>

                    {loadingCoins ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground ml-7">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading your coin balance...
                      </div>
                    ) : (
                      <div className="space-y-4 ml-7">
                        {/* Coin Balance Display */}
                        <div className="bg-white/50 border border-primary/20 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                Available Coins
                              </p>
                              <p className="text-xs text-muted-foreground">
                                1 coin = ₹1 discount
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">
                                {userCoins}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                coins
                              </p>
                            </div>
                          </div>
                        </div>

                        {useCoins && (
                          <div className="space-y-3">
                            <div className="bg-white/50 border border-primary/20 rounded-lg p-3">
                              <label className="text-sm font-medium text-foreground mb-2 block">
                                How many coins to use? *
                              </label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="1"
                                  max={Math.min(userCoins, subtotal)}
                                  value={coinsToUse}
                                  onChange={(e) =>
                                    setCoinsToUse(Number(e.target.value))
                                  }
                                  className="flex-1 h-10 text-sm"
                                  disabled={placingOrder}
                                  placeholder="Enter coins amount (1 coin = ₹1)"
                                />
                                <div className="text-xs text-muted-foreground mt-1">
                                  Enter the number of coins you want to use for discount
                                </div>
                                <Button
                                  type="button"
                                  onClick={handleCoinSubmit}
                                  disabled={
                                    placingOrder ||
                                    coinsToUse <= 0 ||
                                    coinsToUse > Math.min(userCoins, subtotal)
                                  }
                                  size="sm"
                                  className="h-10 px-4"
                                >
                                  Apply Coins
                                </Button>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">
                                  Max: {Math.min(userCoins, subtotal)} coins
                                </span>
                                {coinsToUse > 0 ? (
                                  <span className="text-sm font-semibold text-green-600">
                                    = ₹{coinsToUse.toLocaleString()} discount
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    Enter amount above to see discount
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Usage Guidelines */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <h4 className="text-xs font-semibold text-blue-700 mb-2">
                                💡 Usage Guidelines
                              </h4>
                              <ul className="text-xs text-blue-600 space-y-1">
                                <li>
                                  • You can use up to{" "}
                                  {Math.min(userCoins, subtotal)} coins
                                </li>
                                <li>• Each coin gives you ₹1 discount</li>
                                <li>
                                  • Coins are deducted from your balance after
                                  order
                                </li>
                                <li>• Unused coins remain in your account</li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div>
                <div
                  className={`bg-card p-6 shadow-soft sticky top-32 ${
                    placingOrder ? "opacity-75" : ""
                  }`}
                >
                  <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Order Summary
                  </h2>

                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-foreground">
                        Items ({cartItems.length})
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        Total Items
                      </span>
                    </div>

                    {cartItems.map((item) => (
                      <div
                        key={`${item.product._id}-${item.size}`}
                        className="flex gap-3 p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="w-16 h-16 bg-white overflow-hidden rounded-md border">
                          <img
                            src={
                              item.product.images[0]?.url || "/placeholder.svg"
                            }
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground text-sm truncate">
                            {item.product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              Size: {item.size}
                            </span>
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                              Qty: {item.quantity}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              ₹{item.price.toLocaleString()} each
                            </span>
                            <span className="text-sm font-semibold text-foreground">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="border-border mb-4" />

                  {/* Transaction Breakdown */}
                  <div className="space-y-4 mb-6">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Transaction Details
                    </h3>

                    {/* Subtotal */}
                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-foreground">
                          Subtotal
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Before taxes & discounts
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        ₹{subtotal.toLocaleString()}
                      </span>
                    </div>

                    {/* Coin Discount */}
                    {coinsAreUsed && coinDiscount > 0 && (
                      <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-green-600" />
                          <div>
                            <span className="text-sm font-medium text-green-700">
                              Coin Discount
                            </span>
                            <p className="text-xs text-green-600">
                              Applied from your coin balance
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-green-700">
                          -₹{coinDiscount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* GST */}
                    <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-blue-700">
                          GST (18%)
                        </span>
                        <p className="text-xs text-blue-600">
                          Government tax on subtotal
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-blue-700">
                        ₹{gstAmount.toLocaleString()}
                      </span>
                    </div>

                    {/* Shipping */}
                    <div className="flex justify-between items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-orange-700">
                          Shipping
                        </span>
                        <p className="text-xs text-orange-600">
                          {shipping === 0
                            ? "Free shipping on orders above ₹2,000"
                            : "Standard delivery charge"}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-orange-700">
                        {shipping === 0 ? "FREE" : `₹${shipping}`}
                      </span>
                    </div>
                  </div>

                  <hr className="border-border mb-4" />

                  {/* Final Total */}
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-lg font-bold text-foreground">
                          Total Amount
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Amount to be paid
                        </p>
                      </div>
                      <span className="text-xl font-bold text-primary">
                        ₹{total.toLocaleString()}
                      </span>
                    </div>

                    {/* Savings Summary */}
                    {coinsAreUsed && coinDiscount > 0 && (
                      <div className="mt-3 pt-3 border-t border-primary/20">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            You Save:
                          </span>
                          <span className="text-sm font-semibold text-green-600">
                            ₹{coinDiscount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full btn-hero"
                    disabled={placingOrder}
                  >
                    {placingOrder ? (
                      <span className="inline-flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {paymentMethod === "razorpay"
                          ? "Processing Payment..."
                          : "Placing Order..."}
                      </span>
                    ) : paymentMethod === "razorpay" ? (
                      "PAY SECURELY"
                    ) : (
                      "PLACE ORDER"
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
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Order Placed!
            </h2>
            <p className="text-muted-foreground mb-4">
              Your order #{placedOrder.orderNumber} has been successfully
              placed.
            </p>
            <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-medium text-foreground mb-2">
                Order Details:
              </p>
              <p className="text-sm text-muted-foreground">
                Total: ₹{placedOrder.total.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Payment: {placedOrder.payment.method.toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground">
                Items: {placedOrder.items.length}
              </p>
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
