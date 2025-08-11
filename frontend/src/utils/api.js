// API Configuration
const API_BASE_URL =

  import.meta.env.VITE_API_URL || "http://localhost:8000/api";


// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// Helper function to set auth token in localStorage
const setAuthToken = (token) => {
  localStorage.setItem("authToken", token);
};

// Helper function to remove auth token from localStorage
const removeAuthToken = () => {
  localStorage.removeItem("authToken");
};

// Helper function to get user data from localStorage
const getUserData = () => {
  const userData = localStorage.getItem("userData");
  return userData ? JSON.parse(userData) : null;
};

// Helper function to set user data in localStorage
const setUserData = (userData) => {
  localStorage.setItem("userData", JSON.stringify(userData));
};

// Helper function to remove user data from localStorage
const removeUserData = () => {
  localStorage.removeItem("userData");
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Auto-handle unauthorized responses by clearing auth and notifying app
    if (response.status === 401 || response.status === 403) {
      try {
        removeAuthToken();
        removeUserData();
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("auth:changed", {
              detail: { isAuthenticated: false, reason: "unauthorized" },
            })
          );
        }
      } catch {}
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

// Authentication API functions
export const authAPI = {
  // Register user
  register: async (userData) => {
    const response = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.success) {
      setAuthToken(response.data.token);
      setUserData(response.data.user);
    }

    return response;
  },

  // Login user
  login: async (credentials) => {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.success) {
      setAuthToken(response.data.token);
      setUserData(response.data.user);
    }

    return response;
  },

  // Logout user
  logout: () => {
    removeAuthToken();
    removeUserData();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("auth:changed", {
          detail: { isAuthenticated: false, reason: "logout" },
        })
      );
    }
  },

  // Get current user
  getCurrentUser: () => {
    return getUserData();
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  },

  // Request password reset OTP
  requestResetOtp: async (email) => {
    return await apiRequest("/auth/request-reset-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  // Verify password reset OTP
  verifyResetOtp: async (email, otp) => {
    return await apiRequest("/auth/verify-reset-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
  },

  // Reset password with OTP
  resetPasswordOtp: async (email, otp, password) => {
    return await apiRequest("/auth/reset-password-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp, password }),
    });
  },
};

// Products API functions
export const productsAPI = {
  // Get all products
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/products${queryString ? `?${queryString}` : ""}`);
  },

  // Get single product
  getById: async (id) => {
    return await apiRequest(`/products/${id}`);
  },

  // Get products by category
  getByCategory: async (category) => {
    return await apiRequest(`/products/category/${category}`);
  },

  // Search products
  search: async (query) => {
    return await apiRequest(`/products/search?q=${encodeURIComponent(query)}`);
  },
};

// Cart API functions
export const cartAPI = {
  // Get user's cart
  getCart: async () => {
    return await apiRequest("/cart");
  },

  // Add item to cart
  addToCart: async (productId, size, quantity = 1) => {
    return await apiRequest("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, size, quantity }),
    });
  },

  // Update cart item quantity
  updateCartItem: async (productId, size, quantity) => {
    return await apiRequest(`/cart/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ size, quantity }),
    });
  },

  // Remove item from cart
  removeFromCart: async (productId, size) => {
    const response = await apiRequest(`/cart/${productId}`, {
      method: "DELETE",
      body: JSON.stringify({ size }),
    });
    return response;
  },

  // Clear cart
  clearCart: async () => {
    return await apiRequest("/cart", {
      method: "DELETE",
    });
  },

  // Apply coupon
  applyCoupon: async (couponCode) => {
    return await apiRequest("/cart/coupon", {
      method: "POST",
      body: JSON.stringify({ couponCode }),
    });
  },

  // Remove coupon
  removeCoupon: async () => {
    return await apiRequest("/cart/coupon", {
      method: "DELETE",
    });
  },

  // Apply coins discount
  applyCoinsDiscount: async (coinsUsed) => {
   return await apiRequest("/cart/coins", {
      method: "POST",
      body: JSON.stringify({ coinsUsed }),
    });
  },

  // Remove coins discount
  removeCoinsDiscount: async () => {
    return await apiRequest("/cart/coins", {
      method: "DELETE",
    });
  },
};

// Orders API functions
export const ordersAPI = {
  // Get user's orders
  getOrders: async () => {
    return await apiRequest("/orders");
  },

  // Get single order
  getOrderById: async (orderId) => {
    return await apiRequest(`/orders/${orderId}`);
  },

  // Create new order
  createOrder: async (orderData) => {
    return await apiRequest("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    return await apiRequest(`/orders/${orderId}/cancel`, {
      method: "PUT",
    });
  },

  // Request return
  requestReturn: async (orderId) => {
    return await apiRequest(`/orders/${orderId}/return`, {
      method: "PUT",
    });
  },
};

// User API functions
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return await apiRequest("/user/profile");
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await apiRequest("/user/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  // Change password
  changePassword: async (passwordData) => {
    return await apiRequest("/user/change-password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
  },

  // Get user's wishlist
  getWishlist: async () => {
    return await apiRequest("/user/wishlist");
  },

  // Add item to wishlist
  addToWishlist: async (productId) => {
    return await apiRequest("/user/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId }),
    });
  },

  // Remove item from wishlist
  removeFromWishlist: async (productId) => {
    return await apiRequest(`/user/wishlist/${productId}`, {
      method: "DELETE",
    });
  },

  // Get user coins
  getUserCoins: async () => {
    return await apiRequest("/user/coins");
  },

  // Redeem coins
  redeemCoins: async (amount) => {
    return await apiRequest("/user/coins/redeem", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  },

  // Get coin transactions
  getCoinTransactions: async (page = 1, limit = 20) => {
    return await apiRequest(`/user/coins/transactions?page=${page}&limit=${limit}`);
  },

  // Address book
  getAddresses: async () => {
    return await apiRequest("/user/addresses");
  },
  addAddress: async (address) => {
    return await apiRequest("/user/addresses", {
      method: "POST",
      body: JSON.stringify(address),
    });
  },
  updateAddress: async (addressId, address) => {
    return await apiRequest(`/user/addresses/${addressId}`, {
      method: "PUT",
      body: JSON.stringify(address),
    });
  },
  deleteAddress: async (addressId) => {
    return await apiRequest(`/user/addresses/${addressId}`, {
      method: "DELETE",
    });
  },
};

// Export utility functions
export const apiUtils = {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getUserData,
  setUserData,
  removeUserData,
  isAuthenticated: authAPI.isAuthenticated,
  getCurrentUser: authAPI.getCurrentUser,
};

export default {
  auth: authAPI,
  products: productsAPI,
  cart: cartAPI,
  orders: ordersAPI,
  user: userAPI,
  utils: apiUtils,
};
