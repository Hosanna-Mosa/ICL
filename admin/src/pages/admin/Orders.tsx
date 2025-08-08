import React, { useState } from 'react';
import { Search, Filter, Eye, Package, Truck, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Order, OrderItem } from '@/types';

// Mock data for demonstration
const mockOrders: Order[] = [
  {
    id: 'ORD-2024-001',
    userId: 'user1',
    userEmail: 'john@example.com',
    userName: 'John Smith',
    products: [
      {
        productId: 'prod1',
        productName: 'Essential Hoodie Black',
        quantity: 2,
        price: 89.99,
        size: 'M',
        color: 'Black'
      }
    ],
    total: 179.98,
    paymentMethod: 'online',
    status: 'shipped',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      phone: '+1234567890'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T09:15:00Z'
  },
  {
    id: 'ORD-2024-002',
    userId: 'user2',
    userEmail: 'sarah@example.com',
    userName: 'Sarah Wilson',
    products: [
      {
        productId: 'prod2',
        productName: 'Urban Tee White',
        quantity: 1,
        price: 45.99,
        size: 'L',
        color: 'White'
      },
      {
        productId: 'prod3',
        productName: 'Street Joggers Gray',
        quantity: 1,
        price: 79.99,
        size: 'M',
        color: 'Gray'
      }
    ],
    total: 125.98,
    paymentMethod: 'cod',
    status: 'pending',
    shippingAddress: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      phone: '+0987654321'
    },
    createdAt: '2024-01-18T14:22:00Z',
    updatedAt: '2024-01-18T14:22:00Z'
  }
];

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  shipped: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  delivered: 'bg-green-500/10 text-green-500 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20'
};

const statusIcons = {
  pending: Package,
  confirmed: CheckCircle,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle
};

const Orders = () => {
  const [orders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    toast({
      title: "Order Updated",
      description: `Order ${orderId} status updated to ${newStatus}`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Orders Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all customer orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by Order ID, customer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          <CardDescription>
            Recent orders from your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const StatusIcon = statusIcons[order.status];
                  return (
                    <TableRow key={order.id} className="border-border/50">
                      <TableCell className="font-mono text-sm">
                        {order.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.userName}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.userEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {order.products.length} item{order.products.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.products[0]?.productName}
                            {order.products.length > 1 && ` +${order.products.length - 1} more`}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.paymentMethod === 'cod' ? 'secondary' : 'outline'}>
                          {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status]}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => {
                                  e.preventDefault();
                                  setSelectedOrder(order);
                                }}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                              </DialogTrigger>
                            </Dialog>
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'confirmed')}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Confirmed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'shipped')}>
                              <Truck className="mr-2 h-4 w-4" />
                              Mark Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'delivered')}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Delivered
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder?.id} - {formatDate(selectedOrder?.createdAt || '')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Customer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{selectedOrder.userName}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.userEmail}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                      <p>{selectedOrder.shippingAddress.zipCode}</p>
                      <p>{selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.products.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-3 font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Status */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <Badge className={`${statusColors[selectedOrder.status]} mt-1`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <Badge variant={selectedOrder.paymentMethod === 'cod' ? 'secondary' : 'outline'} className="mt-1">
                    {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;