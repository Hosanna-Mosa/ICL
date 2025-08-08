import React from 'react';
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
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Eye
} from 'lucide-react';

// Mock data for dashboard
const stats = {
  totalSales: 125430,
  totalOrders: 342,
  totalUsers: 1250,
  totalProducts: 89,
};

const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    email: 'john@example.com',
    total: 2599,
    status: 'confirmed',
    date: '2024-01-15',
  },
  {
    id: 'ORD-002',
    customer: 'Jane Smith',
    email: 'jane@example.com',
    total: 1799,
    status: 'pending',
    date: '2024-01-15',
  },
  {
    id: 'ORD-003',
    customer: 'Mike Johnson',
    email: 'mike@example.com',
    total: 3299,
    status: 'shipped',
    date: '2024-01-14',
  },
  {
    id: 'ORD-004',
    customer: 'Sarah Wilson',
    email: 'sarah@example.com',
    total: 999,
    status: 'delivered',
    date: '2024-01-14',
  },
];

const statusColors = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  confirmed: 'bg-primary/10 text-primary border-primary/20',
  shipped: 'bg-accent/10 text-accent border-accent/20',
  delivered: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const Dashboard = () => {
  const statCards = [
    {
      title: 'Total Sales',
      value: `₹${stats.totalSales.toLocaleString()}`,
      description: '+12% from last month',
      icon: DollarSign,
      trend: 'up',
    },
    {
      title: 'Orders',
      value: stats.totalOrders.toString(),
      description: '+5% from last month',
      icon: ShoppingCart,
      trend: 'up',
    },
    {
      title: 'Users',
      value: stats.totalUsers.toString(),
      description: '+18% from last month',
      icon: Users,
      trend: 'up',
    },
    {
      title: 'Products',
      value: stats.totalProducts.toString(),
      description: '3 new this month',
      icon: Package,
      trend: 'neutral',
    },
  ];

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
        {statCards.map((stat, index) => (
          <Card key={index} className="glass border-border/50 hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-success" />}
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
            <Button variant="outline" size="sm">
              View All Orders
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
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
                {recentOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer}</div>
                        <div className="text-sm text-muted-foreground">{order.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{order.total.toLocaleString()}
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
                      {new Date(order.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;