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
import { Link } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import Button from "@/components/UI/ICLButton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import productHoodie from "@/assets/product-hoodie.jpg";
import productTee from "@/assets/product-tee.jpg";

const Account: React.FC = () => {
  const { user, isAuthenticated, login, register, logout, loading } = useAuth();
  const { toast } = useToast();

  // Authentication form states
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // Register form data
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
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
                    ? "Sign in to access your ICL account"
                    : "Join the ICL streetwear community"}
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
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Password
                    </label>
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
      </div>
    );
  }

  // Show account page content if user is authenticated
  const orders = [
    {
      id: "ICL001",
      date: "2024-01-15",
      status: "Delivered",
      total: 2499,
      items: [
        {
          name: "Oversized Black Hoodie",
          size: "L",
          quantity: 1,
          image: productHoodie,
        },
      ],
    },
    {
      id: "ICL002",
      date: "2024-01-10",
      status: "Shipped",
      total: 2598,
      items: [
        {
          name: "Essential White Tee",
          size: "M",
          quantity: 2,
          image: productTee,
        },
      ],
    },
  ];



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
                <h2 className="text-xl font-bold text-foreground">
                  Order History
                </h2>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-card p-6 shadow-soft">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-foreground">
                              Order #{order.id}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Placed on{" "}
                              {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                order.status === "Delivered"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex gap-3">
                              <div className="w-16 h-16 bg-muted overflow-hidden">
                                <img
                                  src={item.image}
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
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-foreground">
                              Total
                            </span>
                            <span className="font-bold text-foreground">
                              ₹{order.total.toLocaleString()}
                            </span>
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

      <Footer />
    </div>
  );
};

export default Account;
