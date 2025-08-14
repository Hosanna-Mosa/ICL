import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Coins as CoinsIcon, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  Download,
  Eye,
  MoreHorizontal,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import adminApi from '@/utils/api';

interface CoinTransaction {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  type: 'earned' | 'redeemed';
  amount: number;
  description: string;
  orderNumber?: string;
  balanceAfter: number;
  createdAt: string;
}

interface UserCoins {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  coins: number;
  totalEarned: number;
  totalRedeemed: number;
  transactionCount: number;
}

interface CoinStats {
  totalCoinsInCirculation: number;
  totalUsersWithCoins: number;
  totalTransactions: number;
  totalEarned: number;
  totalRedeemed: number;
  averageCoinsPerUser: number;
}

const Coins = () => {
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [userCoins, setUserCoins] = useState<UserCoins[]>([]);
  const [stats, setStats] = useState<CoinStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<CoinTransaction | null>(null);
  const [viewMode, setViewMode] = useState<'transactions' | 'users'>('transactions');
  const { toast } = useToast();

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchTransactions(),
        fetchUserCoins(),
        fetchStats()
      ]);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await adminApi.coins.getTransactions();
      if (response.success && response.data?.transactions) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchUserCoins = async () => {
    try {
      const response = await adminApi.coins.getUserCoins();
      if (response.success && response.data?.users) {
        setUserCoins(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching user coins:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminApi.coins.getStats();
      if (response.success && response.data?.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.orderNumber && transaction.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    const matchesDate = dateFilter === 'all' || (() => {
      const transactionDate = new Date(transaction.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - transactionDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today': return diffDays === 1;
        case 'week': return diffDays <= 7;
        case 'month': return diffDays <= 30;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesType && matchesDate;
  });

  const filteredUserCoins = userCoins.filter(user => {
    return (
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const exportData = () => {
    const data = viewMode === 'transactions' ? filteredTransactions : filteredUserCoins;
    const csvContent = generateCSV(data, viewMode);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coins_${viewMode}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (data: any[], type: string) => {
    if (type === 'transactions') {
      const headers = ['User', 'Email', 'Type', 'Amount', 'Description', 'Order Number', 'Balance After', 'Date'];
      const rows = data.map(t => [
        `${t.user.firstName} ${t.user.lastName}`,
        t.user.email,
        t.type,
        t.amount,
        t.description,
        t.orderNumber || '',
        t.balanceAfter,
        formatDate(t.createdAt)
      ]);
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } else {
      const headers = ['User', 'Email', 'Current Coins', 'Total Earned', 'Total Redeemed', 'Transaction Count'];
      const rows = data.map(u => [
        `${u.firstName} ${u.lastName}`,
        u.email,
        u.coins,
        u.totalEarned,
        u.totalRedeemed,
        u.transactionCount
      ]);
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading coins data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Coins Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage the coin system
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportData}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-background border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Coins</CardTitle>
              <CoinsIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCoinsInCirculation.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                In circulation
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsersWithCoins}</div>
              <p className="text-xs text-muted-foreground">
                With coins
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalEarned.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Coins earned
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Redeemed</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalRedeemed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Coins redeemed
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center space-x-4">
        <Button
          variant={viewMode === 'transactions' ? 'default' : 'outline'}
          onClick={() => setViewMode('transactions')}
        >
          Transactions
        </Button>
        <Button
          variant={viewMode === 'users' ? 'default' : 'outline'}
          onClick={() => setViewMode('users')}
        >
          User Balances
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={`Search ${viewMode === 'transactions' ? 'transactions' : 'users'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {viewMode === 'transactions' && (
          <>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="earned">Earned</SelectItem>
                <SelectItem value="redeemed">Redeemed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {viewMode === 'transactions' ? 'Coin Transactions' : 'User Coin Balances'}
          </CardTitle>
          <CardDescription>
            {viewMode === 'transactions' 
              ? `${filteredTransactions.length} transactions found`
              : `${filteredUserCoins.length} users found`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewMode === 'transactions' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Balance After</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {transaction.user.firstName} {transaction.user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'earned' ? 'default' : 'secondary'}>
                        {transaction.type === 'earned' ? 'Earned' : 'Redeemed'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      {transaction.orderNumber ? (
                        <Badge variant="outline">{transaction.orderNumber}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{transaction.balanceAfter}</TableCell>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedTransaction(transaction)}>
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Current Coins</TableHead>
                  <TableHead>Total Earned</TableHead>
                  <TableHead>Total Redeemed</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUserCoins.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-lg">{user.coins}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-green-600">{user.totalEarned}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-red-600">{user.totalRedeemed}</span>
                    </TableCell>
                    <TableCell>{user.transactionCount}</TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">-</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Detailed information about this coin transaction
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">User</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedTransaction.user.firstName} {selectedTransaction.user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedTransaction.user.email}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Transaction Type</Label>
                <Badge variant={selectedTransaction.type === 'earned' ? 'default' : 'secondary'}>
                  {selectedTransaction.type === 'earned' ? 'Earned' : 'Redeemed'}
                </Badge>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Amount</Label>
                <p className={`text-lg font-semibold ${
                  selectedTransaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedTransaction.type === 'earned' ? '+' : '-'}{selectedTransaction.amount} coins
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedTransaction.description}
                </p>
              </div>
              
              {selectedTransaction.orderNumber && (
                <div>
                  <Label className="text-sm font-medium">Order Number</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTransaction.orderNumber}
                  </p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">Balance After Transaction</Label>
                <p className="text-lg font-semibold">{selectedTransaction.balanceAfter} coins</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Date</Label>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedTransaction.createdAt)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Coins;
