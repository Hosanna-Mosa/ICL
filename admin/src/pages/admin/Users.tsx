import React, { useState, useEffect } from 'react';
import { Search, Filter, User, Coins, Plus, Minus, MoreHorizontal, Trash2, Eye, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { adminUsersAPI } from '@/utils/api';

interface UserType {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  coins: number;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface CoinsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'admin_added' | 'admin_removed' | 'redeemed';
  description: string;
  orderId?: string;
  createdAt: string;
}

const Users = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [viewUserProfile, setViewUserProfile] = useState<UserType | null>(null);
  const [coinsAmount, setCoinsAmount] = useState<number>(0);
  const [coinsAction, setCoinsAction] = useState<'add' | 'remove'>('add');
  const [updatingCoins, setUpdatingCoins] = useState(false);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const [allUsers, setAllUsers] = useState<UserType[]>([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminUsersAPI.list({
        limit: 1000, // Get all users for local filtering
      });
      
      if (response.success && response.data?.users) {
        setAllUsers(response.data.users);
        setUsers(response.data.users);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter users locally based on search term and role filter
  useEffect(() => {
    const filteredUsers = allUsers.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm));
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
    
    setUsers(filteredUsers);
  }, [searchTerm, roleFilter, allUsers]);



  const updateCoinsBalance = async (userId: string, amount: number, action: 'add' | 'remove') => {
    try {
      setUpdatingCoins(true);
      const response = await adminUsersAPI.adjustCoins(userId, { amount, action });
      
      if (response.success) {
        const actionText = action === 'add' ? 'added to' : 'removed from';
        toast({
          title: "Coins Updated",
          description: `${amount} coins ${actionText} user account`,
        });
        
        // Refresh users list to get updated coins
        await fetchUsers();
        
        setSelectedUser(null);
        setCoinsAmount(0);
      } else {
        throw new Error(response.message || 'Failed to update coins');
      }
    } catch (error: any) {
      console.error('Error updating coins:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update coins",
        variant: "destructive",
      });
    } finally {
      setUpdatingCoins(false);
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    try {
      setDeletingUser(userId);
      const response = await adminUsersAPI.remove(userId);
      
      if (response.success) {
        toast({
          title: "User Deleted",
          description: `User ${userName} has been removed from the system`,
          variant: "destructive"
        });
        
        // Refresh users list
        await fetchUsers();
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setDeletingUser(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserTransactions = (userId: string) => {
    // For now, return empty array since we don't have transaction history endpoint
    // This can be implemented later when backend supports it
    return [];
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Users Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage customers and their accounts
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Users Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage customers and their accounts
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-subtle border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'user').length}</div>
            <p className="text-xs text-muted-foreground">
              Active customers
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-subtle border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coins</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.reduce((sum, user) => sum + user.coins, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Coins in circulation
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-subtle border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Coins</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'user').length > 0 
                ? Math.round(users.filter(u => u.role === 'user').reduce((sum, user) => sum + user.coins, 0) / users.filter(u => u.role === 'user').length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Per user
            </p>
          </CardContent>
        </Card>
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
          <CardDescription>
            Registered customers and administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Coins Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id} className="border-border/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-semibold text-sm">
                            {user.firstName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{user.firstName} {user.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">{user.coins.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.createdAt)}
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
                                setViewUserProfile(user);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                            </DialogTrigger>
                          </Dialog>
                          
                          {user.role !== 'admin' && (
                            <>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault();
                                    setSelectedUser(user);
                                    setCoinsAction('add');
                                  }}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Coins
                                  </DropdownMenuItem>
                                </DialogTrigger>
                              </Dialog>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault();
                                    setSelectedUser(user);
                                    setCoinsAction('remove');
                                  }}>
                                    <Minus className="mr-2 h-4 w-4" />
                                    Remove Coins
                                  </DropdownMenuItem>
                                </DialogTrigger>
                              </Dialog>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete User
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {user.firstName} {user.lastName}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                                      className="bg-destructive hover:bg-destructive/90"
                                      disabled={deletingUser === user._id}
                                    >
                                      {deletingUser === user._id ? (
                                        <>
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                          Deleting...
                                        </>
                                      ) : (
                                        'Delete'
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Profile Modal */}
      <Dialog open={!!viewUserProfile} onOpenChange={() => setViewUserProfile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              Account details and transaction history
            </DialogDescription>
          </DialogHeader>
          
          {viewUserProfile && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Account Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p className="font-medium">{viewUserProfile.firstName} {viewUserProfile.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="font-medium">{viewUserProfile.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      <p className="font-medium">{viewUserProfile.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Role</Label>
                      <Badge variant={viewUserProfile.role === 'admin' ? 'default' : 'secondary'} className="mt-1">
                        {viewUserProfile.role.charAt(0).toUpperCase() + viewUserProfile.role.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Coins & Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Coins Balance</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold text-lg">{viewUserProfile.coins.toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Member Since</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(viewUserProfile.createdAt)}</span>
                      </div>
                    </div>
                    {viewUserProfile.lastLogin && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Last Login</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(viewUserProfile.lastLogin)}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getUserTransactions(viewUserProfile._id).length > 0 ? (
                      getUserTransactions(viewUserProfile._id).map((transaction) => (
                        <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                          <div>
                            <p className="font-medium text-sm">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(transaction.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${transaction.type === 'earned' || transaction.type === 'admin_added' ? 'text-green-500' : 'text-red-500'}`}>
                              {transaction.type === 'earned' || transaction.type === 'admin_added' ? '+' : '-'}{transaction.amount}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {transaction.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Coins className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No transaction history available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Coins Management Modal */}
      <Dialog open={!!selectedUser && (coinsAction === 'add' || coinsAction === 'remove')} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {coinsAction === 'add' ? 'Add' : 'Remove'} Coins
            </DialogTitle>
            <DialogDescription>
              {coinsAction === 'add' ? 'Add' : 'Remove'} coins {coinsAction === 'add' ? 'to' : 'from'} {selectedUser?.firstName} {selectedUser?.lastName}'s account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="coins-amount">Amount</Label>
              <Input
                id="coins-amount"
                type="number"
                placeholder="Enter coins amount"
                value={coinsAmount || ''}
                onChange={(e) => setCoinsAmount(Number(e.target.value))}
                min="1"
                className="mt-1"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => selectedUser && updateCoinsBalance(selectedUser._id, coinsAmount, coinsAction)}
                disabled={!coinsAmount || coinsAmount <= 0 || updatingCoins}
                className="flex-1"
              >
                {updatingCoins ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  `${coinsAction === 'add' ? 'Add' : 'Remove'} Coins`
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedUser(null)}
                className="flex-1"
                disabled={updatingCoins}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;