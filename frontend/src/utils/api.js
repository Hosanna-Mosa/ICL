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
  },

  // Get current user
  getCurrentUser: () => {
    return getUserData();
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
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
  addToCart: async (productId, quantity = 1) => {
    return await apiRequest("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  },

  // Update cart item quantity
  updateQuantity: async (itemId, quantity) => {
    return await apiRequest("/cart/update", {
      method: "PUT",
      body: JSON.stringify({ itemId, quantity }),
    });
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    return await apiRequest("/cart/remove", {
      method: "DELETE",
      body: JSON.stringify({ itemId }),
    });
  },

  // Clear cart
  clearCart: async () => {
    return await apiRequest("/cart/clear", {
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
    return await apiRequest("/user/wishlist", {
      method: "DELETE",
      body: JSON.stringify({ productId }),
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
