import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Package,
  Calendar,
  Loader2,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { adminOrdersAPI } from '@/utils/api';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';

// Chart components with enhanced animations
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Area, AreaChart } from 'recharts';

interface AnalyticsData {
  sales: {
    total: number;
    delivered: number;
    notDelivered: number;
    cancelled: number;
    monthly: Array<{
      month: string;
      sales: number;
      orders: number;
    }>;
    daily: Array<{
      date: string;
      sales: number;
      orders: number;
    }>;
  };
  users: {
    total: number;
    newUsers: Array<{
      date: string;
      count: number;
    }>;
    activeUsers: number;
  };
  products: {
    total: number;
    topSelling: Array<{
      name: string;
      sold: number;
      revenue: number;
    }>;
    categoryBreakdown: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
  };
  orders: {
    total: number;
    statusBreakdown: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    averageOrderValue: number;
  };
}

const timeRanges = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 3 Months' },
  { value: '1y', label: 'Last Year' }
];

const chartColors = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  accent: '#8b5cf6'
};

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredChart, setHoveredChart] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  useEffect(() => {
    if (analyticsData) {
      // Animate chart data entry
      setChartData([]);
      setTimeout(() => {
        setChartData(analyticsData.sales.daily);
      }, 500);
    }
  }, [analyticsData]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminOrdersAPI.getAnalytics(timeRange);
      
      if (response && response.success && response.data) {
        setAnalyticsData(response.data);
      } else {
        console.error('Invalid analytics response:', response);
        setError('Invalid response format from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics data';
      setError(errorMessage);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Enhanced chart animations
  const chartVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
        staggerChildren: 0.1
      }
    },
    hover: { 
      scale: 1.02, 
      transition: { duration: 0.2 } 
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, rotateX: -15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    },
    hover: { 
      y: -5, 
      rotateX: 5,
      transition: { duration: 0.3 } 
    }
  };

  const metricVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "backOut" as const
      }
    },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 } 
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-lg text-destructive mb-4">{error}</p>
            <Button onClick={fetchAnalyticsData} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {/* Page Header with enhanced animations */}
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className="glass border-border/50 p-6 rounded-xl"
      >
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Comprehensive insights into your business performance
            </motion.p>
          </motion.div>
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={refreshing}
                className="relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-primary/10"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: refreshing ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Key Metrics Cards with enhanced animations */}
      <motion.div
        variants={chartVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          {
            title: "Total Sales",
            value: formatCurrency(analyticsData?.sales.total || 0),
            icon: DollarSign,
            color: "text-success",
            bgColor: "bg-success/10",
            trend: "+12.5%",
            trendColor: "text-success"
          },
          {
            title: "Total Orders",
            value: formatNumber(analyticsData?.orders.total || 0),
            icon: ShoppingCart,
            color: "text-primary",
            bgColor: "bg-primary/10",
            trend: "+8.2%",
            trendColor: "text-success"
          },
          {
            title: "Active Users",
            value: formatNumber(analyticsData?.users.activeUsers || 0),
            icon: Users,
            color: "text-accent",
            bgColor: "bg-accent/10",
            trend: "+15.3%",
            trendColor: "text-success"
          },
          {
            title: "Avg Order Value",
            value: formatCurrency(analyticsData?.orders.averageOrderValue || 0),
            icon: Package,
            color: "text-warning",
            bgColor: "bg-warning/10",
            trend: "-2.1%",
            trendColor: "text-destructive"
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            variants={metricVariants}
            whileHover="hover"
            custom={index}
            className="relative group"
          >
            <Card className="glass border-border/50 hover:shadow-2xl transition-all duration-500 overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <motion.div
                  className={`p-2 rounded-lg ${metric.bgColor}`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </motion.div>
              </CardHeader>
              <CardContent className="relative z-10">
                <motion.div 
                  className={`text-2xl font-bold ${metric.color}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5, ease: "backOut" }}
                >
                  {metric.value}
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-2 text-xs text-muted-foreground"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                >
                  <TrendingUp className={`h-3 w-3 ${metric.trendColor}`} />
                  <span>{metric.trend} from last period</span>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Enhanced Sales Trend Chart with moving animations */}
      <motion.div
        variants={chartVariants}
        whileHover="hover"
        onHoverStart={() => setHoveredChart('sales')}
        onHoverEnd={() => setHoveredChart(null)}
      >
        <Card className="glass border-border/50 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: hoveredChart === 'sales' ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          <CardHeader>
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">Sales Trend</span>
            </motion.div>
            <CardDescription>Revenue and order trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 relative">
              <AnimatePresence>
                {chartData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="hsl(var(--border))" 
                          opacity={0.3}
                        />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                          }}
                          formatter={(value: number) => [formatCurrency(value), 'Sales']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="sales" 
                          stroke={chartColors.primary} 
                          strokeWidth={3}
                          fill="url(#salesGradient)"
                          dot={{ 
                            fill: chartColors.primary, 
                            strokeWidth: 2, 
                            r: 4,
                            stroke: 'white'
                          }}
                          activeDot={{ 
                            r: 8, 
                            stroke: chartColors.primary, 
                            strokeWidth: 3,
                            fill: 'white'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="sales" 
                          stroke={chartColors.primary} 
                          strokeWidth={2}
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Charts Grid with moving animations */}
      <motion.div
        variants={chartVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Enhanced Order Status Breakdown with rotating pie chart */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          onHoverStart={() => setHoveredChart('orders')}
          onHoverEnd={() => setHoveredChart(null)}
        >
          <Card className="glass border-border/50 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-primary/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredChart === 'orders' ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
            <CardHeader>
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
              >
                <PieChart className="h-5 w-5 text-secondary" />
                <span className="text-lg font-semibold">Order Status Breakdown</span>
              </motion.div>
              <CardDescription>Distribution of orders by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 relative">
                <motion.div
                  animate={{ rotate: hoveredChart === 'orders' ? 360 : 0 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={analyticsData?.orders.statusBreakdown || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percentage }) => `${status} (${percentage}%)`}
                        outerRadius={80}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="count"
                        paddingAngle={2}
                      >
                        {(analyticsData?.orders.statusBreakdown || []).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={Object.values(chartColors)[index % Object.keys(chartColors).length]}
                            stroke="white"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: number) => [value, 'Orders']}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Top Selling Products with animated bars */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          onHoverStart={() => setHoveredChart('products')}
          onHoverEnd={() => setHoveredChart(null)}
        >
          <Card className="glass border-border/50 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-accent/5 to-warning/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredChart === 'products' ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
            <CardHeader>
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
              >
                <BarChart3 className="h-5 w-5 text-accent" />
                <span className="text-lg font-semibold">Top Selling Products</span>
              </motion.div>
              <CardDescription>Best performing products by units sold</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 relative">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData?.products.topSelling || []}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColors.primary} stopOpacity={1}/>
                          <stop offset="95%" stopColor={chartColors.accent} stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="hsl(var(--border))" 
                        opacity={0.3}
                      />
                      <XAxis 
                        dataKey="name" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: number) => [value, 'Units Sold']}
                      />
                      <Bar 
                        dataKey="sold" 
                        fill="url(#barGradient)"
                        radius={[4, 4, 0, 0]}
                        animationDuration={2000}
                        animationBegin={500}
                      >
                        {(analyticsData?.products.topSelling || []).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`}
                            fill={Object.values(chartColors)[index % Object.keys(chartColors).length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Enhanced Additional Metrics with staggered animations */}
      <motion.div
        variants={chartVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Enhanced Category Breakdown with animated progress bars */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="relative overflow-hidden"
        >
          <Card className="glass border-border/50">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-success/5 to-info/5"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <CardHeader>
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
              >
                <Activity className="h-5 w-5 text-success" />
                <span className="text-lg font-semibold">Product Categories</span>
              </motion.div>
              <CardDescription>Products by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analyticsData?.products.categoryBreakdown || []).map((category, index) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <motion.div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: Object.values(chartColors)[index % Object.keys(chartColors).length] }}
                          whileHover={{ scale: 1.5 }}
                          transition={{ duration: 0.2 }}
                        />
                        <span className="text-sm font-medium">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{category.count}</div>
                        <div className="text-xs text-muted-foreground">{category.percentage}%</div>
                      </div>
                    </div>
                    <motion.div
                      className="w-full bg-muted rounded-full h-2 overflow-hidden"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: Object.values(chartColors)[index % Object.keys(chartColors).length] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${category.percentage}%` }}
                        transition={{ delay: index * 0.1 + 0.5, duration: 1, ease: "easeOut" }}
                      />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Recent Activity with animated timeline */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="relative overflow-hidden"
        >
          <Card className="glass border-border/50">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-warning/5 to-danger/5"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <CardHeader>
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
              >
                <Calendar className="h-5 w-5 text-warning" />
                <span className="text-lg font-semibold">Recent Activity</span>
              </motion.div>
              <CardDescription>Latest business activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { status: 'success', text: 'New order received', time: '2 minutes ago' },
                  { status: 'primary', text: 'Product updated', time: '15 minutes ago' },
                  { status: 'accent', text: 'New user registered', time: '1 hour ago' }
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                    className="flex items-center space-x-3 group"
                  >
                    <motion.div 
                      className={`w-2 h-2 bg-${activity.status} rounded-full`}
                      whileHover={{ scale: 2 }}
                      transition={{ duration: 0.2 }}
                    />
                    <div className="flex-1">
                      <motion.div 
                        className="text-sm font-medium"
                        whileHover={{ color: 'hsl(var(--primary))' }}
                        transition={{ duration: 0.2 }}
                      >
                        {activity.text}
                      </motion.div>
                      <div className="text-xs text-muted-foreground">{activity.time}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Performance Summary with animated badges */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="relative overflow-hidden"
        >
          <Card className="glass border-border/50">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-info/5 to-secondary/5"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <CardHeader>
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
              >
                <TrendingUp className="h-5 w-5 text-info" />
                <span className="text-lg font-semibold">Performance Summary</span>
              </motion.div>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Conversion Rate', value: '+2.4%', variant: 'success' },
                  { label: 'Customer Retention', value: '87.2%', variant: 'success' },
                  { label: 'Inventory Turnover', value: '4.2x', variant: 'warning' }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-muted-foreground">{metric.label}</span>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge 
                        variant="secondary" 
                        className={`text-${metric.variant} border-${metric.variant}/20`}
                      >
                        {metric.value}
                      </Badge>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;
