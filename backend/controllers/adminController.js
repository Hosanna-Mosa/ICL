import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import CoinTransaction from "../models/CoinTransaction.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import {
  createProduct as createProductController,
  updateProduct as updateProductController,
  deleteProduct as deleteProductController,
} from "./productController.js";
import { updateOrderStatus as updateOrderStatusController } from "./orderController.js";

// ----- Users -----
export const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;

  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    },
  });
});

export const getUserByIdAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.json({ success: true, data: { user } });
});

export const updateUserAdmin = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, role, isActive, coins } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (role) user.role = role;
  if (typeof isActive === "boolean") user.isActive = isActive;
  if (typeof coins === "number") user.coins = coins;

  await user.save();

  res.json({
    success: true,
    message: "User updated successfully",
    data: { user },
  });
});

export const deleteUserAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  user.isActive = false;
  await user.save();
  res.json({ success: true, message: "User deactivated successfully" });
});

export const adjustUserCoins = asyncHandler(async (req, res) => {
  const { amount, action } = req.body; // action: 'add' | 'remove'
  if (!amount || amount <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "Amount must be a positive number" });
  }
  if (!["add", "remove"].includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Invalid action. Use 'add' or 'remove'",
    });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (action === "add") {
    await user.addCoins(amount);
  } else {
    await user.redeemCoins(amount);
  }

  res.json({
    success: true,
    message: `Coins ${action}ed successfully`,
    data: { coins: user.coins },
  });
});

// ----- Orders -----
export const listOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, userId } = req.query;

  const query = {};
  if (status) query.status = status;
  if (userId) query.user = userId;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user", "firstName lastName email"),
    Order.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    },
  });
});

export const getOrderByIdAdmin = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("items.product")
    .populate("user", "firstName lastName email");

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.json({ success: true, data: { order } });
});

export const updateOrderStatusAdmin = updateOrderStatusController;

// ----- Products -----
export const listProductsAdmin = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    sort = "newest",
    search,
    includeInactive,
  } = req.query;

  const query = {};
  if (!includeInactive || includeInactive === "false") {
    query.isActive = true;
  }
  if (category) query.category = category;
  if (search) {
    query.$text = { $search: search };
  }

  let sortOption = {};
  switch (sort) {
    case "price_asc":
      sortOption = { basePrice: 1 };
      break;
    case "price_desc":
      sortOption = { basePrice: -1 };
      break;
    case "rating":
      sortOption = { rating: -1 };
      break;
    case "popularity":
      sortOption = { totalSold: -1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortOption).skip(skip).limit(parseInt(limit)),
    Product.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    },
  });
});

export const getProductByIdAdmin = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }
  res.json({ success: true, data: { product } });
});

export const createProductAdmin = createProductController;
export const updateProductAdmin = updateProductController;
export const deleteProductAdmin = deleteProductController;

// ----- Dashboard Statistics -----
export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Get total sales breakdown by status
    const salesStats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          totalSales: { $sum: "$total" },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    // Initialize sales breakdown
    let deliveredSales = 0;
    let notDeliveredSales = 0;
    let cancelledSales = 0;
    let totalSales = 0;

    // Process sales stats
    salesStats.forEach(stat => {
      totalSales += stat.totalSales;
      
      if (stat._id === "delivered") {
        deliveredSales = stat.totalSales;
      } else if (stat._id === "cancelled") {
        cancelledSales = stat.totalSales;
      } else {
        // All other statuses (pending, confirmed, processing, shipped, returned)
        notDeliveredSales += stat.totalSales;
      }
    });

    // Get total counts
    const [totalOrders, totalUsers, totalProducts] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: "user" }), // Only count regular users, not admins
      Product.countDocuments({ isActive: true }) // Only count active products
    ]);

    // Get recent sales trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: "cancelled" } // Exclude cancelled orders
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          dailySales: { $sum: "$total" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
      {
        $unwind: "$items"
      },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      {
        $sort: { totalSold: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      {
        $unwind: "$productInfo"
      },
      {
        $project: {
          productId: "$_id",
          productName: "$productInfo.name",
          totalSold: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        sales: {
          total: totalSales,
          delivered: deliveredSales,
          notDelivered: notDeliveredSales,
          cancelled: cancelledSales
        },
        counts: {
          orders: totalOrders,
          users: totalUsers,
          products: totalProducts
        },
        trends: {
          recentSales,
          topProducts
        }
      }
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message
    });
  }
});

// ----- Analytics -----
export const getAnalytics = asyncHandler(async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range based on timeRange parameter
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get sales data for the time range
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: "cancelled" }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$total" },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get total sales breakdown by status
    const salesStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$status",
          totalSales: { $sum: "$total" },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    // Initialize sales breakdown
    let deliveredSales = 0;
    let notDeliveredSales = 0;
    let cancelledSales = 0;
    let totalSales = 0;

    // Process sales stats
    salesStats.forEach(stat => {
      totalSales += stat.totalSales;
      
      if (stat._id === "delivered") {
        deliveredSales = stat.totalSales;
      } else if (stat._id === "cancelled") {
        cancelledSales = stat.totalSales;
      } else {
        // All other statuses (pending, confirmed, processing, shipped, returned)
        notDeliveredSales += stat.totalSales;
      }
    });

    // Get user analytics
    const userStats = await User.aggregate([
      {
        $match: {
          role: "user",
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get total user counts
    const [totalUsers, activeUsers] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ 
        role: "user", 
        lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      })
    ]);

    // Get product analytics
    const productStats = await Product.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Calculate category percentages
    const totalProducts = productStats.reduce((sum, cat) => sum + cat.count, 0);
    const categoryBreakdown = productStats.map(cat => ({
      category: cat._id,
      count: cat.count,
      percentage: Math.round((cat.count / totalProducts) * 100)
    }));

    // Get top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: "cancelled" }
        }
      },
      {
        $unwind: "$items"
      },
      {
        $group: {
          _id: "$items.product",
          sold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      {
        $sort: { sold: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      {
        $unwind: "$productInfo"
      },
      {
        $project: {
          name: "$productInfo.name",
          sold: 1,
          revenue: 1
        }
      }
    ]);

    // Get order status breakdown
    const orderStatusStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate order status percentages
    const totalOrders = orderStatusStats.reduce((sum, status) => sum + status.count, 0);
    const statusBreakdown = orderStatusStats.map(status => ({
      status: status._id,
      count: status.count,
      percentage: Math.round((status.count / totalOrders) * 100)
    }));

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Format daily sales data
    const dailySales = salesData.map(item => ({
      date: item._id,
      sales: item.sales,
      orders: item.orders
    }));

    // Format new users data
    const newUsers = userStats.map(item => ({
      date: item._id,
      count: item.count
    }));

    res.json({
      success: true,
      data: {
        sales: {
          total: totalSales,
          delivered: deliveredSales,
          notDelivered: notDeliveredSales,
          cancelled: cancelledSales,
          daily: dailySales
        },
        users: {
          total: totalUsers,
          activeUsers: activeUsers,
          newUsers: newUsers
        },
        products: {
          total: totalProducts,
          categoryBreakdown: categoryBreakdown,
          topSelling: topProducts
        },
        orders: {
          total: totalOrders,
          statusBreakdown: statusBreakdown,
          averageOrderValue: averageOrderValue
        }
      }
    });
  } catch (error) {
    console.error("Error getting analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
      error: error.message
    });
  }
});

// ----- Coins -----

// @desc    Get all coin transactions (Admin)
// @route   GET /api/admin/coins/transactions
// @access  Private/Admin
export const getCoinTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [transactions, total] = await Promise.all([
    CoinTransaction.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    CoinTransaction.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.json({
    success: true,
    data: {
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    },
  });
});

// @desc    Get user coin balances and statistics (Admin)
// @route   GET /api/admin/coins/users
// @access  Private/Admin
export const getUserCoins = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get users with their coin statistics
  const users = await User.aggregate([
    {
      $lookup: {
        from: 'cointransactions',
        localField: '_id',
        foreignField: 'user',
        as: 'transactions'
      }
    },
    {
      $addFields: {
        totalEarned: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$transactions',
                  cond: { $eq: ['$$this.type', 'earned'] }
                }
              },
              as: 'tx',
              in: '$$tx.amount'
            }
          }
        },
        totalRedeemed: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$transactions',
                  cond: { $eq: ['$$this.type', 'redeemed'] }
                }
              },
              as: 'tx',
              in: '$$tx.amount'
            }
          }
        },
        transactionCount: { $size: '$transactions' }
      }
    },
    {
      $project: {
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        coins: 1,
        totalEarned: 1,
        totalRedeemed: 1,
        transactionCount: 1
      }
    },
    {
      $sort: { coins: -1 }
    },
    {
      $skip: skip
    },
    {
      $limit: parseInt(limit)
    }
  ]);

  const total = await User.countDocuments();

  const totalPages = Math.ceil(total / parseInt(limit));

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    },
  });
});

// @desc    Get coin system statistics (Admin)
// @route   GET /api/admin/coins/stats
// @access  Private/Admin
export const getCoinStats = asyncHandler(async (req, res) => {
  // Get overall coin statistics
  const stats = await CoinTransaction.aggregate([
    {
      $group: {
        _id: null,
        totalEarned: {
          $sum: {
            $cond: [{ $eq: ['$type', 'earned'] }, '$amount', 0]
          }
        },
        totalRedeemed: {
          $sum: {
            $cond: [{ $eq: ['$type', 'redeemed'] }, '$amount', 0]
          }
        },
        totalTransactions: { $sum: 1 }
      }
    }
  ]);

  // Get users with coins
  const usersWithCoins = await User.countDocuments({ coins: { $gt: 0 } });

  // Get total coins in circulation
  const totalCoinsInCirculation = await User.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: '$coins' }
      }
    }
  ]);

  const coinStats = stats[0] || { totalEarned: 0, totalRedeemed: 0, totalTransactions: 0 };
  const totalCoins = totalCoinsInCirculation[0]?.total || 0;
  const averageCoinsPerUser = usersWithCoins > 0 ? totalCoins / usersWithCoins : 0;

  res.json({
    success: true,
    data: {
      stats: {
        totalCoinsInCirculation: totalCoins,
        totalUsersWithCoins: usersWithCoins,
        totalTransactions: coinStats.totalTransactions,
        totalEarned: coinStats.totalEarned,
        totalRedeemed: coinStats.totalRedeemed,
        averageCoinsPerUser: Math.round(averageCoinsPerUser * 100) / 100
      }
    }
  });
});
