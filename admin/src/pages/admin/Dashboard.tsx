import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  IndianRupee, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Eye,
  Loader2
} from 'lucide-react';
import { adminOrdersAPI } from '@/utils/api';
import { Order } from '@/types';
import { useNavigate } from 'react-router-dom';

// Dashboard statistics interface
interface DashboardStats {
  sales: {
    total: number;
    delivered: number;
    notDelivered: number;
    cancelled: number;
  };
  counts: {
    orders: number;
    users: number;
    products: number;
  };
  trends: {
    recentSales: Array<{
      _id: string;
      dailySales: number;
      orderCount: number;
    }>;
    topProducts: Array<{
      productId: string;
      productName: string;
      totalSold: number;
      totalRevenue: number;
    }>;
  };
}

const statusColors = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  confirmed: 'bg-primary/10 text-primary border-primary/20',
  shipped: 'bg-accent/10 text-accent border-accent/20',
  delivered: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const Dashboard = () => {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentOrders();
    fetchDashboardStats();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminOrdersAPI.getRecent();
      
      // Validate response structure
      if (response && response.success && response.data && Array.isArray(response.data.orders)) {
        setRecentOrders(response.data.orders);
      } else {
        console.error('Invalid response format:', response);
        setError('Invalid response format from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recent orders';
      setError(errorMessage);
      console.error('Error fetching recent orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const response = await adminOrdersAPI.getDashboardStats();
      
      if (response && response.success && response.data) {
        setDashboardStats(response.data);
      } else {
        console.error('Invalid dashboard stats response:', response);
        setStatsError('Invalid response format from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard statistics';
      setStatsError(errorMessage);
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/admin/orders?orderId=${orderId}`);
  };

  const handleViewAllOrders = () => {
    navigate('/admin/orders');
  };

  const handleNavigateToOrders = () => {
    navigate('/admin/orders');
  };

  const handleNavigateToUsers = () => {
    navigate('/admin/users');
  };

  const handleNavigateToProducts = () => {
    navigate('/admin/products');
  };

  // Generate stat cards based on real data
  const getStatCards = () => {
    if (!dashboardStats) return [];

    return [
      {
        title: 'Total Sales',
        value: formatCurrency(dashboardStats.sales.total),
        description: 'All time sales',
        icon: IndianRupee,
        trend: 'neutral',
        subValue: `Delivered: ${formatCurrency(dashboardStats.sales.delivered)}`,
        onClick: undefined, // No navigation for Total Sales
      },
      {
        title: 'Orders',
        value: dashboardStats.counts.orders.toString(),
        description: 'Total orders',
        icon: ShoppingCart,
        trend: 'neutral',
        subValue: `Pending: ${dashboardStats.counts.orders - (dashboardStats.sales.delivered > 0 ? 1 : 0)}`,
        onClick: handleNavigateToOrders,
      },
      {
        title: 'Users',
        value: dashboardStats.counts.users.toString(),
        description: 'Registered users',
        icon: Users,
        trend: 'neutral',
        subValue: 'Active customers',
        onClick: handleNavigateToUsers,
      },
      {
        title: 'Products',
        value: dashboardStats.counts.products.toString(),
        description: 'Active products',
        icon: Package,
        trend: 'neutral',
        subValue: 'In catalog',
        onClick: handleNavigateToProducts,
      },
    ];
  };

  const statCards = getStatCards();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your ICL Streetwear business performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          // Loading state for stats
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="glass border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-5 w-20 bg-muted animate-pulse rounded" />
                <div className="h-5 w-5 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))
        ) : statsError ? (
          // Error state for stats
          <div className="col-span-full">
            <Card className="glass border-border/50">
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-destructive mb-2">{statsError}</p>
                  <Button variant="outline" size="sm" onClick={fetchDashboardStats}>
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Stats cards
          statCards.map((stat, index) => (
            <Card 
              key={index} 
              className={`glass border-border/50 transition-all duration-300 ${
                stat.onClick 
                  ? 'hover:shadow-glow hover:scale-105 cursor-pointer' 
                  : 'hover:shadow-glow'
              }`}
              onClick={stat.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-1">
                  {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-success" />}
                  <div className="flex items-center gap-1">
                    <span>{stat.description}</span>
                    {stat.onClick && (
                      <span className="text-primary text-xs">(Click to view)</span>
                    )}
                  </div>
                </div>
                {stat.subValue && (
                  <div className="text-xs text-muted-foreground">{stat.subValue}</div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Sales Breakdown */}
      {dashboardStats && !statsLoading && !statsError && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Sales Breakdown</CardTitle>
              <CardDescription>Revenue by order status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Delivered</span>
                <span className="font-semibold text-success">
                  {formatCurrency(dashboardStats.sales.delivered)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Not Delivered</span>
                <span className="font-semibold text-warning">
                  {formatCurrency(dashboardStats.sales.notDelivered)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cancelled</span>
                <span className="font-semibold text-destructive">
                  {formatCurrency(dashboardStats.sales.cancelled)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="glass border-border/50 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Top Selling Products</CardTitle>
              <CardDescription>Best performing items</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardStats.trends.topProducts.length > 0 ? (
                <div className="space-y-3">
                  {dashboardStats.trends.topProducts.map((product, index) => (
                    <div key={product.productId} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="font-medium">{product.productName}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{product.totalSold} sold</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(product.totalRevenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No sales data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Orders */}
      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Latest customer orders and their status
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleViewAllOrders}>
              View All Orders
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading recent orders...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-destructive mb-2">{error}</p>
                  <Button variant="outline" size="sm" onClick={fetchRecentOrders}>
                    Retry
                  </Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No recent orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentOrders.map((order) => (
                      <TableRow key={order._id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {order.user.firstName} {order.user.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">{order.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={statusColors[order.status as keyof typeof statusColors]}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewOrder(order._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;