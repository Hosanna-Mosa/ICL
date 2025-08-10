// Admin Panel Types for ICL Streetwear

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  coinsBalance: number;
  registeredDate: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  images: string[];
  fabricDetails?: string;
  gsm?: number;
  fitType?: string;
  washCare?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  payment: {
    method: 'cod' | 'upi' | 'card' | 'wallet';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    amount: number;
  };
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  coinsUsed: number;
  coinsEarned: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelledBy?: 'customer' | 'admin' | 'system';
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  total: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  token: string;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: Order[];
  salesData: Array<{
    date: string;
    sales: number;
  }>;
}

export interface CoinsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'spent' | 'admin_added' | 'admin_removed';
  description: string;
  orderId?: string;
  createdAt: string;
}