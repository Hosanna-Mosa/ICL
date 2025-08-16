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
  const [visibleTransactions, setVisibleTransactions] = useState<number>(5);

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

  const handleShowMore = () => {
    setVisibleTransactions(prev => prev + 5);
    // Smooth scroll to show the new transactions
    setTimeout(() => {
      const transactionSection = document.querySelector('[data-transaction-section]');
      if (transactionSection) {
        transactionSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const handleShowLess = () => {
    setVisibleTransactions(5);
    // Smooth scroll to top of transaction section
    const transactionSection = document.querySelector('[data-transaction-section]');
    if (transactionSection) {
      transactionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="bg-gradient-to-br from-background via-background to-muted/30 pt-20">
          <div className="container mx-auto px-4 py-6 md:py-8">
            <div className="max-w-md mx-auto text-center">
              <div className="mb-6 md:mb-8">
                <div className="relative inline-block mb-4 md:mb-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                    <PocketIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <Coins className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-3">
                  My Pocket
                </h1>
                <p className="text-muted-foreground text-base md:text-lg">
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
          <div className="container mx-auto px-4 py-6 md:py-8">
            <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
              <div className="text-center">
                <Skeleton className="h-10 md:h-12 w-48 md:w-64 mx-auto mb-4" />
                <Skeleton className="h-5 md:h-6 w-80 md:w-96 mx-auto" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <Skeleton className="h-28 md:h-36 rounded-xl" />
                <Skeleton className="h-28 md:h-36 rounded-xl" />
                <Skeleton className="h-28 md:h-36 rounded-xl" />
              </div>
              <Skeleton className="h-80 md:h-96 rounded-xl" />
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
        {/* Compact Mobile Header */}
        <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-amber-50 border-b border-yellow-200 pt-20">
          <div className="container mx-auto px-4 py-6 md:py-12">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <PocketIcon className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                  My Pocket
                </h1>
              </div>
              <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-3 md:mb-6">
                Track your rewards, coins, and savings from every purchase.
              </p>
              {/* Compact feature list for mobile */}
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs md:text-sm text-gray-500">
                <div className="flex items-center gap-1 md:gap-2">
                  <Coins className="w-3 h-3 md:w-4 md:h-4 text-yellow-600" />
                  <span>Earn coins</span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="flex items-center gap-1 md:gap-2">
                  <Gift className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
                  <span>Redeem discounts</span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="flex items-center gap-1 md:gap-2">
                  <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-amber-600" />
                  <span>Track progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
            {/* Compact Stats Cards - Mobile Optimized */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <Card className="group bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 border-yellow-200 hover:border-yellow-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-yellow-700 mb-1 md:mb-2 flex items-center gap-1 md:gap-2">
                        <Target className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Total Coins</span>
                        <span className="sm:hidden">Coins</span>
                      </p>
                      <p className="text-2xl md:text-4xl font-bold text-yellow-800 mb-1">{coins}</p>
                      <p className="text-xs text-yellow-600 font-medium hidden md:block">Available for redemption</p>
                    </div>
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Coins className="w-5 h-5 md:w-7 md:h-7 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200 hover:border-green-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-green-700 mb-1 md:mb-2 flex items-center gap-1 md:gap-2">
                        <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Earned This Month</span>
                        <span className="sm:hidden">This Month</span>
                      </p>
                      <p className="text-2xl md:text-4xl font-bold text-green-800 mb-1">
                        {transactions
                          .filter(t => t.type === 'earned' && 
                            new Date(t.createdAt).getMonth() === new Date().getMonth())
                          .reduce((sum, t) => sum + t.amount, 0)}
                      </p>
                      <p className="text-xs text-green-600 font-medium hidden md:block">Keep shopping to earn more!</p>
                    </div>
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-5 h-5 md:w-7 md:h-7 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-blue-700 mb-1 md:mb-2 flex items-center gap-1 md:gap-2">
                        <Gift className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Total Value</span>
                        <span className="sm:hidden">Value</span>
                      </p>
                      <p className="text-2xl md:text-4xl font-bold text-blue-800 mb-1">₹{coins}</p>
                      <p className="text-xs text-blue-600 font-medium hidden md:block">1 coin = ₹1 discount</p>
                    </div>
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Gift className="w-5 h-5 md:w-7 md:h-7 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compact How to Earn Section */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20 py-4 md:py-6">
                <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                    <Zap className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                  How to Earn Coins
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="group flex items-start gap-3 md:gap-4 p-4 md:p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-xs md:text-sm font-bold text-white">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1 md:mb-2 text-base md:text-lg">Make Purchases</h4>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                        Earn 1 coin for every ₹100 spent on your orders.
                      </p>
                    </div>
                  </div>
                  <div className="group flex items-start gap-3 md:gap-4 p-4 md:p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-xs md:text-sm font-bold text-white">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1 md:mb-2 text-base md:text-lg">Redeem & Save</h4>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                        Use your coins during checkout to get instant discounts. 1 coin = ₹1 off!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compact Transaction History */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300" data-transaction-section>
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20 py-4 md:py-6">
                <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                    <History className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 md:py-12">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                      <History className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">No transactions yet</h3>
                    <p className="text-sm md:text-base text-muted-foreground mb-4">
                      Start shopping to earn your first coins!
                    </p>
                    <Button asChild size="sm" className="md:hidden">
                      <a href="/shop">Start Shopping</a>
                    </Button>
                    <Button asChild className="hidden md:inline-flex">
                      <a href="/shop">Start Shopping</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {transactions.slice(0, visibleTransactions).map((transaction, index) => (
                      <div 
                        key={transaction.id} 
                        className="group flex items-center justify-between p-3 md:p-5 bg-gradient-to-r from-muted/30 to-muted/50 rounded-xl border border-muted/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ${
                            transaction.type === 'earned' 
                              ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-600' 
                              : 'bg-gradient-to-br from-red-100 to-pink-100 text-red-600'
                          }`}>
                            {transaction.type === 'earned' ? (
                              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground text-xs sm:text-sm md:text-lg mb-1 truncate">
                              {transaction.description}
                            </p>
                            {transaction.orderNumber && (
                              <p className="text-xs text-muted-foreground font-medium hidden sm:block">
                                Order: {transaction.orderNumber}
                              </p>
                            )}
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                              <span className="truncate text-xs sm:text-sm">{formatDate(transaction.createdAt)} at {formatTime(transaction.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <Badge 
                            variant={transaction.type === 'earned' ? 'default' : 'secondary'}
                            className={`px-1.5 sm:px-2 md:px-4 py-0.5 sm:py-1 md:py-2 text-xs font-semibold shadow-md ${
                              transaction.type === 'earned' 
                                ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white' 
                                : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                            }`}
                          >
                            {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {/* Pagination Controls */}
                    {transactions.length > 5 && (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-muted/30">
                        {visibleTransactions < transactions.length ? (
                                                     <Button
                             onClick={handleShowMore}
                             variant="outline"
                             size="sm"
                             className="w-full sm:w-auto px-6 py-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                           >
                             Show More
                           </Button>
                        ) : (
                          <Button
                            onClick={handleShowLess}
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto px-6 py-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                          >
                            Show Less
                          </Button>
                        )}
                        
                        <div className="text-xs text-muted-foreground">
                          Showing {Math.min(visibleTransactions, transactions.length)} of {transactions.length} transactions
                        </div>
                      </div>
                    )}
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
