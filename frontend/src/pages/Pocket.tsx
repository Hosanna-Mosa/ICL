import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/utils/api';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Badge } from '@/components/UI/badge';
import { Button } from '@/components/UI/button';
import { Separator } from '@/components/UI/separator';
import { Skeleton } from '@/components/UI/skeleton';
import { 
  Coins, 
  TrendingUp, 
  History, 
  Gift, 
  ShoppingBag,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Pocket as PocketIcon,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';

interface CoinTransaction {
  id: string;
  type: 'earned' | 'redeemed';
  amount: number;
  description: string;
  orderNumber?: string;
  createdAt: string;
}

const Pocket: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [coins, setCoins] = useState<number>(0);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserCoins();
      fetchTransactions();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUserCoins = async () => {
    try {
      const response = await userAPI.getUserCoins();
      if (response.success) {
        setCoins(response.data.coins);
      }
    } catch (error) {
      console.error('Error fetching user coins:', error);
      setError('Failed to load coins');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await userAPI.getCoinTransactions();
      if (response.success) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="bg-gradient-to-br from-background via-background to-muted/30 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto text-center">
              <div className="mb-8">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                    <PocketIcon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <Coins className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-3">
                  My Pocket
                </h1>
                <p className="text-muted-foreground text-lg">
                  Sign in to view your coins and rewards
                </p>
              </div>
              <Button asChild className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <a href="/login">Sign In</a>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="bg-gradient-to-br from-background via-background to-muted/30 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center">
                <Skeleton className="h-12 w-64 mx-auto mb-4" />
                <Skeleton className="h-6 w-96 mx-auto" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-36 rounded-xl" />
                <Skeleton className="h-36 rounded-xl" />
                <Skeleton className="h-36 rounded-xl" />
              </div>
              <Skeleton className="h-96 rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="bg-gradient-to-br from-background via-background to-muted/30">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-amber-50 border-b border-yellow-200 pt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <PocketIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                  My Pocket
                </h1>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Track your rewards, coins, and savings from every purchase. Your loyalty pays off!
              </p>
              <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-600" />
                  <span>Earn coins on purchases</span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-orange-600" />
                  <span>Redeem for discounts</span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span>Track your progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Enhanced Header */}
            <div className="text-center mb-12">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <PocketIcon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-amber-300 to-yellow-400 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
                My Pocket
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Your rewards and coins from purchases. Every purchase brings you closer to amazing discounts!
              </p>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="group bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 border-yellow-200 hover:border-yellow-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-700 mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Total Coins
                      </p>
                      <p className="text-4xl font-bold text-yellow-800 mb-1">{coins}</p>
                      <p className="text-xs text-yellow-600 font-medium">Available for redemption</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Coins className="w-7 h-7 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200 hover:border-green-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Earned This Month
                      </p>
                      <p className="text-4xl font-bold text-green-800 mb-1">
                        {transactions
                          .filter(t => t.type === 'earned' && 
                            new Date(t.createdAt).getMonth() === new Date().getMonth())
                          .reduce((sum, t) => sum + t.amount, 0)}
                      </p>
                      <p className="text-xs text-green-600 font-medium">Keep shopping to earn more!</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-7 h-7 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        Total Value
                      </p>
                      <p className="text-4xl font-bold text-blue-800 mb-1">₹{coins}</p>
                      <p className="text-xs text-blue-600 font-medium">1 coin = ₹1 discount</p>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Gift className="w-7 h-7 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced How to Earn Section */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  How to Earn Coins
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group flex items-start gap-4 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-sm font-bold text-white">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 text-lg">Make Purchases</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        Earn 1 coin for every ₹100 spent on your orders. The more you shop, the more you earn!
                      </p>
                    </div>
                  </div>
                  <div className="group flex items-start gap-4 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-sm font-bold text-white">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 text-lg">Redeem & Save</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        Use your coins during checkout to get instant discounts on future purchases. 1 coin = ₹1 off!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Transaction History */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                    <History className="w-4 h-4 text-white" />
                  </div>
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <History className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No transactions yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start shopping to earn your first coins!
                    </p>
                                       <Button asChild>
                       <a href="/shop">Start Shopping</a>
                     </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction, index) => (
                      <div 
                        key={transaction.id} 
                        className="group flex items-center justify-between p-5 bg-gradient-to-r from-muted/30 to-muted/50 rounded-xl border border-muted/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 ${
                            transaction.type === 'earned' 
                              ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-600' 
                              : 'bg-gradient-to-br from-red-100 to-pink-100 text-red-600'
                          }`}>
                            {transaction.type === 'earned' ? (
                              <ArrowUpRight className="w-6 h-6" />
                            ) : (
                              <ArrowDownRight className="w-6 h-6" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-lg mb-1">
                              {transaction.description}
                            </p>
                            {transaction.orderNumber && (
                              <p className="text-sm text-muted-foreground font-medium">
                                Order: {transaction.orderNumber}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {formatDate(transaction.createdAt)} at {formatTime(transaction.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={transaction.type === 'earned' ? 'default' : 'secondary'}
                            className={`px-4 py-2 text-sm font-semibold shadow-md ${
                              transaction.type === 'earned' 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                            }`}
                          >
                            {transaction.type === 'earned' ? '+' : '-'}{transaction.amount} coins
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pocket;
