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
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  products: OrderItem[];
  total: number;
  paymentMethod: 'cod' | 'online';
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
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