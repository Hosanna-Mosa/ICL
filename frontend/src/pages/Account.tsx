import React, { useState, useEffect } from "react";
import {
  User,
  Package,
  LogOut,
  Eye,
  EyeOff,
  ArrowLeft,

  Plus,
  Edit,
  Trash2,
  MapPin,
  Loader2,

} from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import Button from "@/components/UI/ICLButton";
import { Input } from "@/components/UI/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/UI/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/UI/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ordersAPI, userAPI, authAPI } from "@/utils/api";


const Account: React.FC = () => {
  const { user, isAuthenticated, login, register, logout, loading } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Authentication form states
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "otp" | "password">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);


  // Address management states
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    isDefault: false,
  });

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

   // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);


  // Login form data
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  // Register form data
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });


  // Fetch user addresses when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  // Populate profile data when user data changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);


 // Set default tab to orders if coming from checkout
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'orders') {
      // Show success message if coming from checkout
      toast({
        title: "Order placed successfully!",
        description: "Your order has been placed and will appear in your order history.",
      });
    }
  }, [searchParams, toast]);

  // Fetch user orders when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const response = await ordersAPI.getOrders();
      if (response.success) {
        setOrders(response.data.orders || []);
        if (response.data.orders && response.data.orders.length > 0) {
          toast({
            title: "Orders loaded",
            description: `Found ${response.data.orders.length} order(s)`,
          });
        }
      } else {
        setOrdersError(response.message || 'Failed to fetch orders');
      }
    } catch (error) {
      setOrdersError(error?.message || 'Failed to fetch orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  // Handle return request
  const handleRequestReturn = async (orderId) => {
    try {
      const response = await ordersAPI.requestReturn(orderId);
      if (response.success) {
        toast({ title: 'Return Requested', description: 'Return is pending admin approval.' });
        fetchOrders();
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to request return', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Failed to request return', variant: 'destructive' });
    }
  };

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    try {
      const response = await ordersAPI.cancelOrder(orderId);
      if (response.success) {
        toast({ title: 'Order Cancelled', description: 'Your order has been cancelled successfully.' });
        fetchOrders();
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to cancel order', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Failed to cancel order', variant: 'destructive' });
    }
  };

  // Order details dialog state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

  // Handle view order details
  const handleViewOrderDetails = (orderId: string) => {
    const order = orders.find(o => o._id === orderId);
    if (order) {
      setSelectedOrder(order);
      setOrderDetailsOpen(true);
    }
  };

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await userAPI.getAddresses();
      if (response.success) {
        setAddresses(response.data.addresses);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddAddress = async () => {
    try {
      const response = await userAPI.addAddress(newAddress);
      if (response.success) {
        setAddresses(response.data.addresses);
        setNewAddress({
          firstName: "",
          lastName: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "India",
          isDefault: false,
        });
        setShowAddAddress(false);
        toast({
          title: "Success",
          description: "Address added successfully",
        });

      }
    } catch (error: any) {
      toast({
        title: "Error",

        description: error.message || "Failed to add address",

        variant: "destructive",
      });
    }
  };

  const handleUpdateAddress = async (addressId: string, updatedAddress: any) => {
    try {
      console.log('Updating address:', { addressId, updatedAddress });
      const response = await userAPI.updateAddress(addressId, updatedAddress);
      console.log('Update response:', response);
      if (response.success) {
        setAddresses(response.data.addresses);
        setEditingAddressId(null);
        setShowAddAddress(false);
        setNewAddress({
          firstName: "",
          lastName: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "India",
          isDefault: false,
        });
        toast({
          title: "Success",
          description: "Address updated successfully",
        });
      } else {
        console.error('Update failed:', response);
        toast({
          title: "Error",
          description: response.message || "Failed to update address",

          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update address",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const response = await userAPI.deleteAddress(addressId);
      if (response.success) {
        setAddresses(response.data.addresses);
        toast({
          title: "Success",
          description: "Address deleted successfully",
        });
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
    }
  };

  // Address editing functions
  const handleStartEditAddress = (address: any) => {
    setNewAddress({
      firstName: address.firstName || "",
      lastName: address.lastName || "",
      phone: address.phone || "",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      zipCode: address.zipCode || "",
      country: address.country || "India",
      isDefault: address.isDefault || false,
    });
    setEditingAddressId(address._id);
    setShowAddAddress(true);
  };

  const handleCancelAddressEdit = () => {
    setNewAddress({
      firstName: "",
      lastName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
      isDefault: false,
    });
    setEditingAddressId(null);
    setShowAddAddress(false);
  };

  const handleSubmitAddress = async () => {
    console.log('Submit address called:', { editingAddressId, newAddress });
    if (editingAddressId) {
      // Update existing address
      console.log('Updating existing address with ID:', editingAddressId);
      await handleUpdateAddress(editingAddressId, newAddress);
    } else {
      // Add new address
      console.log('Adding new address');
      await handleAddAddress();
    }
  };

  // Profile management functions
  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      // Here you would typically call an API to update the profile
      // For now, we'll just update the local state
      setIsEditingProfile(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",

        variant: "destructive",
      });
    }
  };

  const handleCancelProfileEdit = () => {
    // Reset profile data to original user data
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
    setIsEditingProfile(false);
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    // Navigate to login page after logout
    navigate('/login');
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const validateRegisterForm = () => {
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return false;
    }

    if (registerData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(loginData.email, loginData.password);

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
      } else {
        toast({
          title: "Login Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password handlers
  const openForgot = () => {
    setForgotEmail(loginData.email || "");
    setForgotStep("email");
    setOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    setResendCooldown(0);
    setForgotOpen(true);
  };

  const requestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!forgotEmail) {
      toast({ title: "Email required", description: "Please enter your email to continue.", variant: "destructive" });
      return;
    }
    setForgotLoading(true);
    try {
      const res = await authAPI.requestResetOtp(forgotEmail);
      if (res?.success) {
        toast({ title: "OTP sent", description: "Please check your email for the OTP." });
        setForgotStep("otp");
        setResendCooldown(30);
      }
    } catch (err: any) {
      toast({ title: "Unable to send OTP", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setForgotLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    await requestOtp();
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({ title: "Invalid OTP", description: "Please enter the 6-digit OTP.", variant: "destructive" });
      return;
    }
    setForgotLoading(true);
    try {
      const res = await authAPI.verifyResetOtp(forgotEmail, otp);
      if (res?.success) {
        toast({ title: "OTP verified", description: "You can now create a new password." });
        setForgotStep("password");
      }
    } catch (err: any) {
      toast({ title: "Verification failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setForgotLoading(false);
    }
  };

  const resetPasswordWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Passwords do not match", description: "Please confirm your password.", variant: "destructive" });
      return;
    }
    setForgotLoading(true);
    try {
      const res = await authAPI.resetPasswordOtp(forgotEmail, otp, newPassword);
      if (res?.success) {
        toast({ title: "Password updated", description: "You can now sign in with your new password." });
        setForgotOpen(false);
        setLoginData((prev) => ({ ...prev, email: forgotEmail, password: "" }));
      }
    } catch (err: any) {
      toast({ title: "Update failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRegisterForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...registrationData } = registerData;
      const result = await register(registrationData);

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
      } else {
        toast({
          title: "Registration Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show authentication forms if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <div className="pt-32 pb-20 px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-card p-8 shadow-soft">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {isLoginMode ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="text-muted-foreground">
                  {isLoginMode
                            ? "Sign in to access your BRELIS account"
        : "Join the BRELIS streetwear community"}
                </p>
              </div>

              {isLoginMode ? (
                // Login Form
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-foreground">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={openForgot}
                        className="text-primary text-xs hover:underline"
                        disabled={isLoading}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginInputChange}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full btn-hero"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              ) : (
                // Register Form
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        First Name
                      </label>
                      <Input
                        type="text"
                        name="firstName"
                        value={registerData.firstName}
                        onChange={handleRegisterInputChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Last Name
                      </label>
                      <Input
                        type="text"
                        name="lastName"
                        value={registerData.lastName}
                        onChange={handleRegisterInputChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number (Optional)
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={registerData.phone || ""}
                      onChange={handleRegisterInputChange}
                      placeholder="10-digit phone number"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={registerData.password}
                        onChange={handleRegisterInputChange}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterInputChange}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full btn-hero"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              )}

              <div className="text-center mt-6">
                <button
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-primary hover:text-primary/80 text-sm"
                >
                  {isLoginMode
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>

              <div className="text-center mt-4">
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-foreground text-sm flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />

        {/* Forgot Password Dialog */}
        <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
          <DialogContent>
            {forgotStep === "email" && (
              <form onSubmit={requestOtp}>
                <DialogHeader>
                  <DialogTitle>Reset your password</DialogTitle>
                  <DialogDescription>
                    Enter the email associated with your account. We'll send a 6-digit OTP to verify it's you.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-2">
                  <label className="block text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={forgotLoading}
                  />
                </div>
                <DialogFooter className="mt-6">
                  <Button onClick={() => setForgotOpen(false)} variant="outline" disabled={forgotLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={forgotLoading}>
                    {forgotLoading ? "Sending..." : "Send OTP"}
                  </Button>
                </DialogFooter>
              </form>
            )}

            {forgotStep === "otp" && (
              <form onSubmit={verifyOtp}>
                <DialogHeader>
                  <DialogTitle>Enter OTP</DialogTitle>
                  <DialogDescription>
                    We've sent a 6-digit OTP to {forgotEmail}. Please enter it below.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 flex flex-col items-center gap-4">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={forgotLoading}>
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <InputOTPSlot key={i} index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  <div className="text-xs text-muted-foreground">
                    {resendCooldown > 0 ? (
                      <span>Resend OTP in {resendCooldown}s</span>
                    ) : (
                      <button type="button" onClick={resendOtp} className="text-primary hover:underline">
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button onClick={() => setForgotStep("email")} variant="outline" disabled={forgotLoading}>
                    Back
                  </Button>
                  <Button type="submit" disabled={forgotLoading || otp.length !== 6}>
                    {forgotLoading ? "Verifying..." : "Verify"}
                  </Button>
                </DialogFooter>
              </form>
            )}

            {forgotStep === "password" && (
              <form onSubmit={resetPasswordWithOtp}>
                <DialogHeader>
                  <DialogTitle>Create new password</DialogTitle>
                  <DialogDescription>Enter a new password for your account.</DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      disabled={forgotLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
                    <Input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      disabled={forgotLoading}
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button onClick={() => setForgotStep("otp")} variant="outline" disabled={forgotLoading}>
                    Back
                  </Button>
                  <Button type="submit" disabled={forgotLoading}>
                    {forgotLoading ? "Saving..." : "Save Password"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }


  // Show account page content if user is authenticated




  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">MY ACCOUNT</h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 btn-hover-lift"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          <Tabs defaultValue={searchParams.get('tab') || "orders"} className="w-full">
            <TabsList className="grid w-full grid-cols-3">

              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      Order History
                    </h2>
                    {orders.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {orders.length} order{orders.length !== 1 ? 's' : ''} found
                      </p>
                    )}
                  </div>
                  <Button 
                    onClick={fetchOrders} 
                    variant="outline" 
                    size="sm"
                    disabled={ordersLoading}
                  >
                    {ordersLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Refresh
                  </Button>
                </div>

                {ordersLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-spin" />
                    <p className="text-muted-foreground">Loading orders...</p>
                  </div>
                ) : ordersError ? (
                  <div className="text-center py-12 text-red-500">
                    <p>{ordersError}</p>
                    <Button onClick={fetchOrders} className="mt-4">
                      Retry
                    </Button>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <p className="text-sm text-muted-foreground">Start shopping to see your order history here</p>
                    <Link to="/shop" className="inline-block mt-4">
                      <Button className="btn-hero">Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="bg-card p-6 shadow-soft">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-foreground">
                              Order #{order.orderNumber}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Placed on{" "}
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <div className="text-right">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  order.status === "delivered"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : order.status === "shipped"
                                    ? "bg-blue-100 text-blue-800"
                                    : order.status === "processing"
                                    ? "bg-purple-100 text-purple-800"
                                    : order.status === "confirmed"
                                    ? "bg-indigo-100 text-indigo-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {order.statusDisplay || order.status}
                              </span>
                              {order.trackingNumber && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Track: {order.trackingNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex gap-3">
                              <div className="w-16 h-16 bg-muted overflow-hidden">
                                <img
                                  src={item.product?.images?.[0]?.url || '/placeholder.svg'}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-foreground">
                                  {item.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Size: {item.size} • Qty: {item.quantity}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Price: ₹{item.price.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Subtotal</span>
                              <span className="text-sm text-foreground">₹{order.subtotal.toLocaleString()}</span>
                            </div>
                            {order.shippingCost > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Shipping</span>
                                <span className="text-sm text-foreground">₹{order.shippingCost}</span>
                              </div>
                            )}
                            {order.coinsUsed > 0 && (
                              <div className="flex justify-between items-center text-primary">
                                <span className="text-sm">Coins Used</span>
                                <span className="text-sm">-₹{order.coinsUsed}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-border">
                              <span className="font-medium text-foreground">Total</span>
                              <span className="font-bold text-foreground">₹{order.total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <span className="text-xs text-muted-foreground">Payment Method</span>
                              <span className="text-xs text-foreground capitalize">
                                {order.payment?.method === 'cod' ? 'Cash on Delivery' : order.payment?.method?.toUpperCase()}
                              </span>
                            </div>
                            
                            {/* Order Actions */}
                            <div className="pt-3 border-t border-border space-y-2">
                              {["pending", "confirmed"].includes(order.status) && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleCancelOrder(order._id)}
                                >
                                  Cancel Order
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => handleViewOrderDetails(order._id)}
                              >
                                View Details
                              </Button>
                              {order.status === "delivered" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                                  onClick={() => handleRequestReturn(order._id)}
                                >
                                  Return Product
                                </Button>
                              )}
                              {order.status === "return_pending" && (
                                <div className="w-full text-center text-yellow-700 text-xs font-semibold py-2">Return Pending</div>
                              )}
                              {order.status === "returned" && (
                                <div className="w-full text-center text-gray-700 text-xs font-semibold py-2">Returned</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="profile" className="mt-8">
              <div className="max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Profile Information Section */}
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-6">
                      Profile Information
                    </h2>

                    <div className="bg-card p-6 shadow-soft">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              First Name
                            </label>
                            {isEditingProfile ? (
                              <Input
                                name="firstName"
                                value={profileData.firstName}
                                onChange={handleProfileInputChange}
                              />
                            ) : (
                              <div className="p-3 bg-muted rounded-md text-foreground">
                                {profileData.firstName || "Not provided"}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Last Name
                            </label>
                            {isEditingProfile ? (
                              <Input
                                name="lastName"
                                value={profileData.lastName}
                                onChange={handleProfileInputChange}
                              />
                            ) : (
                              <div className="p-3 bg-muted rounded-md text-foreground">
                                {profileData.lastName || "Not provided"}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Email
                          </label>
                          {isEditingProfile ? (
                            <Input
                              name="email"
                              value={profileData.email}
                              onChange={handleProfileInputChange}
                              type="email"
                            />
                          ) : (
                            <div className="p-3 bg-muted rounded-md text-foreground">
                              {profileData.email || "Not provided"}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Phone
                          </label>
                          {isEditingProfile ? (
                            <Input
                              name="phone"
                              value={profileData.phone}
                              onChange={handleProfileInputChange}
                              type="tel"
                            />
                          ) : (
                            <div className="p-3 bg-muted rounded-md text-foreground">
                              {profileData.phone || "Not provided"}
                            </div>
                          )}
                        </div>

                        {isEditingProfile ? (
                          <div className="flex gap-2">
                            <Button onClick={handleSaveProfile} className="btn-hero btn-hover-lift">
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleCancelProfileEdit}
                              className="btn-hover-lift"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={handleEditProfile}
                            variant="outline"
                            className="flex items-center gap-2 btn-hover-lift"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Profile
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address Information Section */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-foreground">
                        Delivery Addresses
                      </h2>
                      <Button
                        onClick={() => {
                          setEditingAddressId(null);
                          setNewAddress({
                            firstName: "",
                            lastName: "",
                            phone: "",
                            street: "",
                            city: "",
                            state: "",
                            zipCode: "",
                            country: "India",
                            isDefault: false,
                          });
                          setShowAddAddress(true);
                        }}
                        className="flex items-center gap-2 btn-hover-lift"
                      >
                        <Plus className="w-4 h-4" />
                        Add Address
                      </Button>
                    </div>

                    {loadingAddresses ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading addresses...</p>
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="text-center py-12 bg-card rounded-lg border-2 border-dashed border-border">
                        <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No addresses yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Add your first delivery address to get started
                        </p>
                        <Button 
                          onClick={() => {
                            setEditingAddressId(null);
                            setNewAddress({
                              firstName: "",
                              lastName: "",
                              phone: "",
                              street: "",
                              city: "",
                              state: "",
                              zipCode: "",
                              country: "India",
                              isDefault: false,
                            });
                            setShowAddAddress(true);
                          }} 
                          className="btn-hero"
                        >
                          Add First Address
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {addresses.map((address) => (
                          <div key={address._id} className="bg-card p-6 shadow-soft border-l-4 border-primary">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-foreground">
                                    {address.firstName} {address.lastName}
                                  </h3>
                                  {address.isDefault && (
                                    <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-muted-foreground mb-1">{address.phone}</p>
                                <p className="text-foreground mb-1">{address.street}</p>
                                <p className="text-foreground">
                                  {address.city}, {address.state} {address.zipCode}
                                </p>
                                <p className="text-muted-foreground">{address.country}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStartEditAddress(address)}
                                  className="flex items-center gap-1"
                                >
                                  <Edit className="w-3 h-3" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteAddress(address._id)}
                                  className="flex items-center gap-1 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Add/Edit Address Form (Modal) */}
                {showAddAddress && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-background rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                      <h3 className="text-lg font-semibold mb-4">
                        {editingAddressId ? "Edit Address" : "Add New Address"}
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              First Name
                            </label>
                            <Input
                              value={newAddress.firstName}
                              onChange={(e) => setNewAddress({...newAddress, firstName: e.target.value})}
                              placeholder="First name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Last Name
                            </label>
                            <Input
                              value={newAddress.lastName}
                              onChange={(e) => setNewAddress({...newAddress, lastName: e.target.value})}
                              placeholder="Last name"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Phone
                          </label>
                          <Input
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                            placeholder="Phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Street Address
                          </label>
                          <Input
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                            placeholder="Street address"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              City
                            </label>
                            <Input
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              State
                            </label>
                            <Input
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                              placeholder="State"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              ZIP Code
                            </label>
                            <Input
                              value={newAddress.zipCode}
                              onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value})}
                              placeholder="ZIP code"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Country
                            </label>
                            <Input
                              value={newAddress.country}
                              onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                              placeholder="Country"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={newAddress.isDefault}
                            onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor="isDefault" className="text-sm text-foreground">
                            Set as default address
                          </label>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-6">
                        <Button onClick={handleSubmitAddress} className="flex-1">
                          {editingAddressId ? "Update Address" : "Add Address"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelAddressEdit}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
                 </div>
       </div>

       {/* Order Details Dialog */}
       <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
           {selectedOrder && (
             <>
               <DialogHeader>
                 <DialogTitle className="flex items-center gap-2">
                   <Package className="w-5 h-5" />
                   Order Details - #{selectedOrder.orderNumber}
                 </DialogTitle>
                 <DialogDescription>
                   Complete order information and transaction details
                 </DialogDescription>
               </DialogHeader>

               <div className="space-y-6">
                 {/* Order Header */}
                 <div className="bg-muted/50 p-4 rounded-lg">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <h3 className="font-semibold text-foreground mb-2">Order Information</h3>
                       <div className="space-y-1 text-sm">
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">Order ID:</span>
                           <span className="font-medium">{selectedOrder._id}</span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">Order Number:</span>
                           <span className="font-medium">#{selectedOrder.orderNumber}</span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">Order Date:</span>
                           <span className="font-medium">
                             {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                               year: 'numeric',
                               month: 'long',
                               day: 'numeric',
                               hour: '2-digit',
                               minute: '2-digit'
                             })}
                           </span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">Status:</span>
                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                             selectedOrder.status === "delivered"
                               ? "bg-green-100 text-green-800"
                               : selectedOrder.status === "cancelled"
                               ? "bg-red-100 text-red-800"
                               : selectedOrder.status === "shipped"
                               ? "bg-blue-100 text-blue-800"
                               : selectedOrder.status === "processing"
                               ? "bg-purple-100 text-purple-800"
                               : selectedOrder.status === "confirmed"
                               ? "bg-indigo-100 text-indigo-800"
                               : "bg-yellow-100 text-yellow-800"
                           }`}>
                             {selectedOrder.statusDisplay || selectedOrder.status}
                           </span>
                         </div>
                         {selectedOrder.trackingNumber && (
                           <div className="flex justify-between">
                             <span className="text-muted-foreground">Tracking:</span>
                             <span className="font-medium">{selectedOrder.trackingNumber}</span>
                           </div>
                         )}
                       </div>
                     </div>
                     <div>
                       <h3 className="font-semibold text-foreground mb-2">Payment Information</h3>
                       <div className="space-y-1 text-sm">
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">Payment Method:</span>
                           <span className="font-medium capitalize">
                             {selectedOrder.payment?.method === 'cod' ? 'Cash on Delivery' : selectedOrder.payment?.method?.toUpperCase()}
                           </span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">Payment Status:</span>
                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                             selectedOrder.payment?.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                           }`}>
                             {selectedOrder.payment?.status || 'Pending'}
                           </span>
                         </div>
                         {selectedOrder.payment?.transactionId && (
                           <div className="flex justify-between">
                             <span className="text-muted-foreground">Transaction ID:</span>
                             <span className="font-medium text-xs">{selectedOrder.payment.transactionId}</span>
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Order Items */}
                 <div>
                   <h3 className="font-semibold text-foreground mb-3">Order Items</h3>
                   <div className="space-y-3">
                     {selectedOrder.items.map((item, index) => (
                       <div key={index} className="flex gap-4 p-3 bg-muted/30 rounded-lg">
                         <div className="w-20 h-20 bg-muted overflow-hidden rounded">
                           <img
                             src={item.product?.images?.[0]?.url || '/placeholder.svg'}
                             alt={item.name}
                             className="w-full h-full object-cover"
                           />
                         </div>
                         <div className="flex-1">
                           <h4 className="font-medium text-foreground">{item.name}</h4>
                           <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                             <div>
                               <span className="text-muted-foreground">Size:</span>
                               <span className="ml-2 font-medium">{item.size}</span>
                             </div>
                             <div>
                               <span className="text-muted-foreground">Quantity:</span>
                               <span className="ml-2 font-medium">{item.quantity}</span>
                             </div>
                             <div>
                               <span className="text-muted-foreground">Price:</span>
                               <span className="ml-2 font-medium">₹{item.price.toLocaleString()}</span>
                             </div>
                             <div>
                               <span className="text-muted-foreground">Total:</span>
                               <span className="ml-2 font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Coin Transaction Details */}
                 {selectedOrder.coinsUsed > 0 && (
                   <div>
                     <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                       <Coins className="w-4 h-4" />
                       Coin Transaction Details
                     </h3>
                     <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                       <div className="space-y-2 text-sm">
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">Coins Used:</span>
                           <span className="font-medium text-yellow-700">{selectedOrder.coinsUsed} coins</span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">Discount Applied:</span>
                           <span className="font-medium text-yellow-700">-₹{selectedOrder.coinsUsed}</span>
                         </div>
                         <div className="text-xs text-muted-foreground mt-2">
                           💡 Coins are automatically deducted from your balance when the order is placed
                         </div>
                       </div>
                     </div>
                   </div>
                 )}

                 {/* Pricing Breakdown */}
                 <div>
                   <h3 className="font-semibold text-foreground mb-3">Pricing Breakdown</h3>
                   <div className="bg-muted/30 p-4 rounded-lg">
                     <div className="space-y-2 text-sm">
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Subtotal:</span>
                         <span className="font-medium">₹{selectedOrder.subtotal.toLocaleString()}</span>
                       </div>
                       {selectedOrder.shippingCost > 0 && (
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">Shipping Cost:</span>
                           <span className="font-medium">₹{selectedOrder.shippingCost}</span>
                         </div>
                       )}
                       {selectedOrder.coinsUsed > 0 && (
                         <div className="flex justify-between text-yellow-700">
                           <span>Coins Discount:</span>
                           <span className="font-medium">-₹{selectedOrder.coinsUsed}</span>
                         </div>
                       )}
                       <div className="flex justify-between pt-2 border-t border-border">
                         <span className="font-semibold text-foreground">Total Amount:</span>
                         <span className="font-bold text-foreground">₹{selectedOrder.total.toLocaleString()}</span>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Shipping Address */}
                 {selectedOrder.shippingAddress && (
                   <div>
                     <h3 className="font-semibold text-foreground mb-3">Shipping Address</h3>
                     <div className="bg-muted/30 p-4 rounded-lg">
                       <div className="text-sm">
                         <div className="font-medium text-foreground">
                           {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                         </div>
                         <div className="text-muted-foreground mt-1">
                           {selectedOrder.shippingAddress.phone}
                         </div>
                         <div className="text-muted-foreground mt-1">
                           {selectedOrder.shippingAddress.street}
                         </div>
                         <div className="text-muted-foreground">
                           {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                         </div>
                         <div className="text-muted-foreground">
                           {selectedOrder.shippingAddress.country}
                         </div>
                       </div>
                     </div>
                   </div>
                 )}

                 {/* Order Timeline */}
                 <div>
                   <h3 className="font-semibold text-foreground mb-3">Order Timeline</h3>
                   <div className="space-y-3">
                     <div className="flex items-start gap-3">
                       <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                       <div className="flex-1">
                         <div className="text-sm font-medium text-foreground">Order Placed</div>
                         <div className="text-xs text-muted-foreground">
                           {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                             year: 'numeric',
                             month: 'long',
                             day: 'numeric',
                             hour: '2-digit',
                             minute: '2-digit'
                           })}
                         </div>
                       </div>
                     </div>
                     {selectedOrder.status !== 'pending' && (
                       <div className="flex items-start gap-3">
                         <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                         <div className="flex-1">
                           <div className="text-sm font-medium text-foreground">Order Confirmed</div>
                           <div className="text-xs text-muted-foreground">
                             Order has been confirmed and is being processed
                           </div>
                         </div>
                       </div>
                     )}
                     {['shipped', 'delivered'].includes(selectedOrder.status) && (
                       <div className="flex items-start gap-3">
                         <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                         <div className="flex-1">
                           <div className="text-sm font-medium text-foreground">Order Shipped</div>
                           <div className="text-xs text-muted-foreground">
                             {selectedOrder.trackingNumber ? `Tracking: ${selectedOrder.trackingNumber}` : 'Package is on its way'}
                           </div>
                         </div>
                       </div>
                     )}
                     {selectedOrder.status === 'delivered' && (
                       <div className="flex items-start gap-3">
                         <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                         <div className="flex-1">
                           <div className="text-sm font-medium text-foreground">Order Delivered</div>
                           <div className="text-xs text-muted-foreground">
                             Package has been successfully delivered
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
               </div>

               <DialogFooter className="mt-6">
                 <Button variant="outline" onClick={() => setOrderDetailsOpen(false)}>
                   Close
                 </Button>
                 {selectedOrder.status === "delivered" && (
                   <Button
                     variant="outline"
                     className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                     onClick={() => {
                       setOrderDetailsOpen(false);
                       handleRequestReturn(selectedOrder._id);
                     }}
                   >
                     Request Return
                   </Button>
                 )}
               </DialogFooter>
             </>
           )}
         </DialogContent>
       </Dialog>

       <Footer />
     </div>
   );
 };

export default Account;
