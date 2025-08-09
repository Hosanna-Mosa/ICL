import React, { useState } from "react";
import {
  User,
  Package,
  Heart,
  LogOut,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import Button from "@/components/UI/ICLButton";
import { Input } from "@/components/UI/input";
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

  const wishlistItems = [
    {
      id: 1,
      name: "Oversized Black Hoodie",
      price: 2499,
      image: productHoodie,
    },
    {
      id: 2,
      name: "Essential White Tee",
      price: 1299,
      image: productTee,
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
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Wishlist
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

            <TabsContent value="wishlist" className="mt-8">
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-foreground">
                  My Wishlist
                </h2>

                {wishlistItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No items in wishlist
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-card shadow-soft overflow-hidden group"
                      >
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-foreground mb-2">
                            {item.name}
                          </h3>
                          <p className="text-lg font-bold text-foreground mb-4">
                            ₹{item.price.toLocaleString()}
                          </p>
                          <Button className="w-full btn-hero">
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="profile" className="mt-8">
              <div className="max-w-2xl">
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
                        <Input defaultValue={user?.firstName || ""} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Last Name
                        </label>
                        <Input defaultValue={user?.lastName || ""} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <Input defaultValue={user?.email || ""} type="email" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone
                      </label>
                      <Input defaultValue={user?.phone || ""} type="tel" />
                    </div>

                    <Button className="btn-hero">Update Profile</Button>
                  </div>
                </div>
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
