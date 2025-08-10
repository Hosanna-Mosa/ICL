import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Package, Truck, CheckCircle, XCircle, MoreHorizontal, Loader2, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
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
import { adminOrdersAPI } from '@/utils/api';

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  processing: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  shipped: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  delivered: 'bg-green-500/10 text-green-500 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  returned: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
};

const statusIcons = {
  pending: Package,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  returned: XCircle
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [changingPage, setChangingPage] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [pageInputValue, setPageInputValue] = useState('1');
  
  const { toast } = useToast();

  // Fetch orders from backend
  const fetchOrders = async (page = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setChangingPage(true);
      }
      setError(null);
      
      const params: any = {
        page,
        limit: ordersPerPage
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const response = await adminOrdersAPI.list(params);
      if (response.success) {
        setOrders(response.data.orders);
        setTotalOrders(response.data.total || response.data.orders.length);
        setTotalPages(Math.ceil((response.data.total || response.data.orders.length) / ordersPerPage));
        setCurrentPage(page);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setChangingPage(false);
    }
  };

  // Load orders on component mount and when filters change
  useEffect(() => {
    setCurrentPage(1);
    setPageInputValue('1');
    fetchOrders(1);
  }, [statusFilter]);

  // Recalculate total pages when ordersPerPage changes
  useEffect(() => {
    setTotalPages(Math.ceil(totalOrders / ordersPerPage));
  }, [totalOrders, ordersPerPage]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPageInputValue(page.toString());
      fetchOrders(page);
    }
  };

  // Handle search with pagination reset
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setPageInputValue('1');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.user.firstName} ${order.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const updateOrderStatus = async (orderId: string, newStatus: Order['status'], notes?: string) => {
    try {
      setUpdatingStatus(orderId);
      const response = await adminOrdersAPI.updateStatus(orderId, newStatus, notes);
      
      if (response.success) {
        // Update the order in local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
        
        toast({
          title: "Order Updated",
          description: `Order ${orderId} status updated to ${newStatus}`,
        });
      } else {
        throw new Error(response.message || 'Failed to update order');
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
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

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      cod: 'Cash on Delivery',
      upi: 'UPI',
      card: 'Card',
      wallet: 'Wallet'
    };
    return labels[method as keyof typeof labels] || method;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading orders...</span>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => fetchOrders(1)}>Retry</Button>
      </div>
    );
  }

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
                placeholder="Search by Order Number, customer name, email, or product name..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
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
                {/* <SelectItem value="processing">Processing</SelectItem> */}
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle>Orders ({totalOrders})</CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} of {totalOrders} orders (Page {currentPage} of {totalPages})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
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
                    <TableRow key={order._id} className="border-border/50">
                      <TableCell className="font-mono text-sm">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.user.firstName} {order.user.lastName}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </p>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {order.items.slice(0, 2).map((item, index) => (
                              <p key={index} className={searchTerm && item.name.toLowerCase().includes(searchTerm.toLowerCase()) ? 'font-medium text-primary' : ''}>
                                {item.name}
                                {searchTerm && item.name.toLowerCase().includes(searchTerm.toLowerCase()) && (
                                  <span className="ml-1 text-xs bg-primary/10 text-primary px-1 py-0.5 rounded">Match</span>
                                )}
                              </p>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-xs text-muted-foreground">
                                +{order.items.length - 2} more
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.payment.method === 'cod' ? 'secondary' : 'outline'}>
                          {getPaymentMethodLabel(order.payment.method)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-auto p-2 hover:bg-transparent">
                              <Badge className={`${statusColors[order.status]} cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 group`}>
                                <StatusIcon className="h-3 w-3" />
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                <ChevronDown className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                              </Badge>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem 
                              onClick={() => updateOrderStatus(order._id, 'confirmed')}
                              disabled={updatingStatus === order._id}
                            >
                              {updatingStatus === order._id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                              )}
                              Mark Confirmed
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateOrderStatus(order._id, 'shipped')}
                              disabled={updatingStatus === order._id}
                            >
                              {updatingStatus === order._id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Truck className="mr-2 h-4 w-4" />
                              )}
                              Mark Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateOrderStatus(order._id, 'delivered')}
                              disabled={updatingStatus === order._id}
                            >
                              {updatingStatus === order._id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                              )}
                              Mark Delivered
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4 sm:px-6">
          <div className="flex-1 text-sm text-muted-foreground">
            {changingPage ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading page {currentPage}...</span>
              </div>
            ) : (
              `Showing ${currentPage * ordersPerPage - ordersPerPage + 1} to ${Math.min(currentPage * ordersPerPage, totalOrders)} of ${totalOrders} orders`
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* First Page */}
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || changingPage}
              title="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            
            {/* Previous Page */}
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || changingPage}
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                if (pageNum < 1 || pageNum > totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    className="h-8 w-8 p-0 text-sm"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={changingPage}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            {/* Next Page */}
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || changingPage}
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {/* Last Page */}
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || changingPage}
              title="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
            
            {/* Page size selector */}
            <div className="flex items-center space-x-2 ml-4">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select value={ordersPerPage.toString()} onValueChange={(value) => {
                const newSize = parseInt(value);
                setOrdersPerPage(newSize);
                setCurrentPage(1);
                setPageInputValue('1');
                fetchOrders(1);
              }} disabled={changingPage}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Go to page input for many pages */}
            {totalPages > 10 && (
              <div className="flex items-center space-x-2 ml-4">
                <span className="text-sm text-muted-foreground">Go to:</span>
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={pageInputValue}
                  onChange={(e) => setPageInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const page = parseInt(e.currentTarget.value);
                      if (page >= 1 && page <= totalPages) {
                        handlePageChange(page);
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      handlePageChange(page);
                    } else {
                      setPageInputValue(currentPage.toString());
                    }
                  }}
                  className="w-16 h-8 text-center"
                  disabled={changingPage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber} - {formatDate(selectedOrder?.createdAt || '')}
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
                    <p className="font-medium">{selectedOrder.user.firstName} {selectedOrder.user.lastName}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.user.email}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <p>{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                      <p>{selectedOrder.shippingAddress.zipCode}, {selectedOrder.shippingAddress.country}</p>
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
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Size: {item.size} | Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">{formatCurrency(item.total)}</p>
                      </div>
                    ))}
                    <div className="space-y-2 pt-3 border-t border-border/50">
                      <div className="flex justify-between items-center text-sm">
                        <span>Subtotal</span>
                        <span>{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      {selectedOrder.shippingCost > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span>Shipping</span>
                          <span>{formatCurrency(selectedOrder.shippingCost)}</span>
                        </div>
                      )}
                      {selectedOrder.discountAmount > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span>Discount</span>
                          <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                        </div>
                      )}
                      {selectedOrder.coinsUsed > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span>Coins Used</span>
                          <span>-{formatCurrency(selectedOrder.coinsUsed)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 font-bold text-lg border-t border-border/50">
                        <span>Total</span>
                        <span>{formatCurrency(selectedOrder.total)}</span>
                      </div>
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
                  <Badge variant={selectedOrder.payment.method === 'cod' ? 'secondary' : 'outline'} className="mt-1">
                    {getPaymentMethodLabel(selectedOrder.payment.method)}
                  </Badge>
                </div>
              </div>

              {/* Additional Info */}
              {selectedOrder.notes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}

              {selectedOrder.trackingNumber && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Tracking Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Tracking Number:</span> {selectedOrder.trackingNumber}</p>
                      {selectedOrder.estimatedDelivery && (
                        <p><span className="font-medium">Estimated Delivery:</span> {formatDate(selectedOrder.estimatedDelivery)}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;