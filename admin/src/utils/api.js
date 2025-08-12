// Admin API utilities
// Base URL prefers admin-specific env, then falls back to general frontend API URL
const API_BASE_URL =
  import.meta.env.VITE_ADMIN_API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000/api";
//local host : "http://localhost:8000/api"
//render host : "https://icl-zsbu.onrender.com/api"
// ----- LocalStorage keys (admin-specific) -----
const ADMIN_TOKEN_KEY = "adminAuthToken";
const ADMIN_USER_KEY = "adminUser";

// ----- Storage helpers -----
const getAdminAuthToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);
const setAdminAuthToken = (token) =>
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
const removeAdminAuthToken = () => localStorage.removeItem(ADMIN_TOKEN_KEY);

const getAdminUser = () => {
  const user = localStorage.getItem(ADMIN_USER_KEY);
  return user ? JSON.parse(user) : null;
};
const setAdminUser = (user) =>
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
const removeAdminUser = () => localStorage.removeItem(ADMIN_USER_KEY);

// ----- Utilities -----
const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((v) => query.append(key, String(v)));
    } else {
      query.set(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
};

// Generic request wrapper
const apiRequest = async (endpoint, options = {}) => {
  const token = getAdminAuthToken();

  const { method = "GET", body, headers = {}, ...rest } = options;
  const isFormData = body instanceof FormData;

  const config = {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined
      ? {
          body: isFormData
            ? body
            : typeof body === "string"
            ? body
            : JSON.stringify(body),
        }
      : {}),
    ...rest,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Auto-logout on 401
    if (response.status === 401) {
      removeAdminAuthToken();
      removeAdminUser();
    }

    if (response.status === 204) return null;

    let data;
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = text; // Non-JSON payload
    }

    if (!response.ok) {
      const message =
        (data && (data.message || data.error)) ||
        `Request failed: ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.payload = data;
      throw error;
    }

    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Admin API Error:", error);
    throw error;
  }
};

// ----- Auth (admin) -----
export const adminAuthAPI = {
  login: async (credentials) => {
    const res = await apiRequest("/auth/login", {
      method: "POST",
      body: credentials,
    });
    if (res && res.success && res.data) {
      if (res.data.token) setAdminAuthToken(res.data.token);
      if (res.data.user) setAdminUser(res.data.user);
    }
    return res;
  },
  logout: () => {
    removeAdminAuthToken();
    removeAdminUser();
  },
  isAuthenticated: () => Boolean(getAdminAuthToken()),
  getCurrentUser: () => getAdminUser(),

  // Request password reset OTP
  requestResetOtp: async (email) =>
    apiRequest("/auth/request-reset-otp", {
      method: "POST",
      body: { email },
    }),

  // Verify OTP
  verifyResetOtp: async (email, otp) =>
    apiRequest("/auth/verify-reset-otp", {
      method: "POST",
      body: { email, otp },
    }),

  // Reset password via OTP
  resetPasswordOtp: async (email, otp, password) =>
    apiRequest("/auth/reset-password-otp", {
      method: "POST",
      body: { email, otp, password },
    }),
};

// ----- Upload (admin) -----
export const adminUploadAPI = {
  uploadImage: async (imageData, folder = "icl-products") =>
    apiRequest(`/upload/image`, {
      method: "POST",
      body: { imageData, folder },
    }),
  uploadImages: async (images, folder = "icl-products") =>
    apiRequest(`/upload/images`, { method: "POST", body: { images, folder } }),
};

// ----- Products (admin) -----
export const adminProductsAPI = {
  list: async (params = {}) =>
    apiRequest(`/products${buildQueryString(params)}`),
  getById: async (id) => apiRequest(`/products/${id}`),
  create: async (product) =>
    apiRequest(`/products`, { method: "POST", body: product }),
  update: async (id, updates) =>
    apiRequest(`/products/${id}`, { method: "PUT", body: updates }),
  remove: async (id) => apiRequest(`/products/${id}`, { method: "DELETE" }),
};

// ----- Orders (admin) -----
export const adminOrdersAPI = {
  list: async (params = {}) => apiRequest(`/orders/admin/all${buildQueryString(params)}`),
  getById: async (id) => apiRequest(`/orders/${id}`),
  updateStatus: async (id, status, notes) =>
    apiRequest(`/orders/${id}/status`, { method: "PUT", body: { status, notes } }),
  getRecent: async () => apiRequest(`/orders/admin/recent`),
  getDashboardStats: async () => apiRequest(`/admin/dashboard/stats`),
  getAnalytics: async (timeRange = '30d') => apiRequest(`/admin/analytics?timeRange=${timeRange}`),
};

// ----- Users (admin) -----
export const adminUsersAPI = {
  list: async (params = {}) => apiRequest(`/admin/users${buildQueryString(params)}`),
  getById: async (id) => apiRequest(`/admin/users/${id}`),
  update: async (id, updates) =>
    apiRequest(`/admin/users/${id}`, { method: "PUT", body: updates }),
  remove: async (id) => apiRequest(`/admin/users/${id}`, { method: "DELETE" }),
  adjustCoins: async (id, { amount, action }) =>
    apiRequest(`/admin/users/${id}/coins`, {
      method: "POST",
      body: { amount, action },
    }),
};

// ----- Lookbook (admin) -----
export const adminLookbookAPI = {
  list: async (params = {}) => apiRequest(`/lookbook${buildQueryString(params)}`),
  getById: async (id) => apiRequest(`/lookbook/${id}`),
  create: async (lookbookData) =>
    apiRequest(`/lookbook`, { method: "POST", body: lookbookData }),
  update: async (id, updates) =>
    apiRequest(`/lookbook/${id}`, { method: "PUT", body: updates }),
  remove: async (id) => apiRequest(`/lookbook/${id}`, { method: "DELETE" }),
  toggleStatus: async (id) =>
    apiRequest(`/lookbook/${id}/toggle`, { method: "PATCH" }),
  getCategories: async () => apiRequest(`/lookbook/categories`),
};

// ----- Expose common utilities -----
export const adminApiUtils = {
  getAdminAuthToken,
  setAdminAuthToken,
  removeAdminAuthToken,
  getAdminUser,
  setAdminUser,
  removeAdminUser,
  buildQueryString,
};

const adminApi = {
  auth: adminAuthAPI,
  upload: adminUploadAPI,
  products: adminProductsAPI,
  orders: adminOrdersAPI,
  users: adminUsersAPI,
  lookbook: adminLookbookAPI,
  utils: adminApiUtils,
  request: apiRequest,
  baseUrl: API_BASE_URL,
};

export default adminApi;
