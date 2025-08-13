import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import CoinTransaction from "../models/CoinTransaction.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { sendEmail } from "../utils/emailService.js";

// @desc    Create order (checkout)
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, payment } = req.body;

  // Get user cart
  const cart = await Cart.getOrCreateCart(req.user.id);

  if (cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cart is empty",
    });
  }

  // Validate stock for all items
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      return res.status(400).json({
        success: false,
        message: `Product ${product?.name || "Unknown"} is no longer available`,
      });
    }

    if (!product.isSizeAvailable(item.size)) {
      return res.status(400).json({
        success: false,
        message: `Size ${item.size} is not available for ${product.name}`,
      });
    }

    const stock = product.getStockForSize(item.size);
    if (stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${stock} items available in size ${item.size} for ${product.name}`,
      });
    }
  }

  // Calculate shipping cost
  const shippingCost = cart.subtotal > 2000 ? 0 : 150;

  // Create order items
  const orderItems = cart.items.map((item) => ({
    product: item.product,
    name: item.product.name,
    size: item.size,
    quantity: item.quantity,
    price: item.price,
    total: item.price * item.quantity,
  }));

  // Calculate coins to be earned from assigned product coins
  // Sum of each product's coinsEarned multiplied by quantity
  const coinsEarnedFromProducts = cart.items.reduce((sum, item) => {
    const productCoins = (item.product && item.product.coinsEarned) || 0;
    return sum + productCoins * item.quantity;
  }, 0);

  // Create order
  const order = await Order.create({
    orderNumber: Order.generateOrderNumber(),
    user: req.user.id,
    items: orderItems,
    shippingAddress,
    payment: {
      method: payment.method,
      amount: cart.total + shippingCost,
      status: payment.method === "cod" ? "pending" : "pending",
    },
    subtotal: cart.subtotal,
    shippingCost,
    discountAmount: cart.discountAmount,
    coinsUsed: cart.coinsUsed,
    total: cart.total + shippingCost,
    // If product-assigned coins exist, use them; otherwise the Order pre-save
    // hook will fallback to percentage-based calculation.
    ...(coinsEarnedFromProducts > 0 ? { coinsEarned: coinsEarnedFromProducts } : {}),
  });

  // Update product stock
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    await product.updateStock(item.size, item.quantity);
  }

  // Update user coins if coins were used
  if (cart.coinsUsed > 0) {
    await req.user.redeemCoins(cart.coinsUsed);
    
    // Create coin transaction record
    await CoinTransaction.createRedeemedTransaction(
      req.user.id,
      cart.coinsUsed,
      "Applied to order",
      order.orderNumber,
      order._id
    );
  }

  // Clear cart
  await cart.clearCart();

  console.log("Order created", {
    orderId: order._id,
    orderNumber: order.orderNumber,
    userId: req.user.id,
    total: order.total,
  });

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: { order },
  });

  // Send order confirmation email
  try {
    await sendEmail({
      to: req.user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `<h2>Thank you for your order!</h2><p>Your order <b>${order.orderNumber}</b> has been placed successfully.</p>`
    });
  } catch (e) {
    console.error("Failed to send order confirmation email", e);
  }
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { user: req.user.id };
  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("items.product"),
    Order.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  console.log("User orders fetched", {
    userId: req.user.id,
    count: orders.length,
    total,
  });

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

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("items.product")
    .populate("user", "firstName lastName email");

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Check if user owns this order or is admin
  if (order.user._id.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  console.log("Order fetched", {
    orderId: order._id,
    orderNumber: order.orderNumber,
    userId: req.user.id,
  });

  res.json({
    success: true,
    data: { order },
  });
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  const previousStatus = order.status;

  // Update status
  await order.updateStatus(status, notes);

  // If order is delivered, add coins to user (only if not already credited)
  if (
    status === "delivered" &&
    previousStatus !== "delivered" &&
    order.coinsEarned > 0 &&
    !order.coinsCredited
  ) {
    try {
      const user = await User.findById(order.user);
      if (!user) {
        console.error(`User not found for order ${order.orderNumber} when processing delivery`);
        return res.status(404).json({
          success: false,
          message: "User not found for this order",
        });
      }
      
      // Check if transaction already exists to prevent duplicates
      const existingTransaction = await CoinTransaction.findOne({
        user: order.user,
        order: order._id,
        type: 'earned',
        description: 'Purchase completed'
      });
      
      if (existingTransaction) {
        console.log(`Transaction already exists for order ${order.orderNumber}, skipping coin credit`);
      } else {
        // Add coins to user
        await user.addCoins(order.coinsEarned);
        
        // Mark order as credited
        order.coinsCredited = true;
        await order.save();
        
        // Create coin transaction record
        await CoinTransaction.createEarnedTransaction(
          order.user,
          order.coinsEarned,
          "Purchase completed",
          order.orderNumber,
          order._id
        );
        
        console.log(`Successfully credited ${order.coinsEarned} coins for delivered order ${order.orderNumber}`);
      }
    } catch (error) {
      console.error(`Error processing coin credit for delivered order ${order.orderNumber}:`, error);
      return res.status(500).json({
        success: false,
        message: "Error processing coin credit for delivery",
      });
    }
  }

  // If order is returned, debit coins from user (only if previously credited and not already debited)
  if (
    status === "returned" &&
    previousStatus !== "returned" &&
    order.coinsEarned > 0 &&
    order.coinsCredited &&
    !order.coinsDebited
  ) {
    try {
      const user = await User.findById(order.user);
      if (!user) {
        console.error(`User not found for order ${order.orderNumber} when processing return`);
        return res.status(404).json({
          success: false,
          message: "User not found for this order",
        });
      }
      
      if (user.coins < order.coinsEarned) {
        console.error(`Insufficient coins for user ${user.email} when processing return for order ${order.orderNumber}`);
        return res.status(400).json({
          success: false,
          message: "User has insufficient coins to process return",
        });
      }
      
      // Check if transaction already exists to prevent duplicates
      const existingTransaction = await CoinTransaction.findOne({
        user: order.user,
        order: order._id,
        type: 'redeemed',
        description: 'Order returned - coins debited'
      });
      
      if (existingTransaction) {
        console.log(`Transaction already exists for order ${order.orderNumber}, skipping coin debit`);
      } else {
        // Create coin transaction record for debit first (before debiting coins)
        await CoinTransaction.createRedeemedTransaction(
          order.user,
          order.coinsEarned,
          "Order returned - coins debited",
          order.orderNumber,
          order._id
        );
        
        // Debit coins from user
        await user.redeemCoins(order.coinsEarned);
        
        // Mark order as debited
        order.coinsDebited = true;
        await order.save();
        
        console.log(`Successfully debited ${order.coinsEarned} coins for returned order ${order.orderNumber}`);
      }
    } catch (error) {
      console.error(`Error processing coin debit for returned order ${order.orderNumber}:`, error);
      return res.status(500).json({
        success: false,
        message: "Error processing coin debit for return",
      });
    }
  }

  console.log("Order status updated", {
    orderId: order._id,
    orderNumber: order.orderNumber,
    status,
    adminId: req.user.id,
  });

  res.json({
    success: true,
    message: "Order status updated successfully",
    data: { order },
  });

  // Send order status update email
  try {
    const user = await User.findById(order.user);
    await sendEmail({
      to: user.email,
      subject: `Order Status Updated - ${order.orderNumber}`,
      html: `<h2>Your order status has been updated</h2><p>Order <b>${order.orderNumber}</b> is now <b>${status}</b>.</p>`
    });
  } catch (e) {
    console.error("Failed to send order status update email", e);
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Check if user owns this order
  if (order.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  // Check if order can be cancelled
  if (!["pending", "confirmed"].includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: "Order cannot be cancelled at this stage",
    });
  }

  // Update order
  order.status = "cancelled";
  order.cancelledBy = "customer";
  order.cancellationReason = reason;
  order.cancelledAt = new Date();

  await order.save();

  // Restore stock
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      const sizeData = product.sizes.find((s) => s.size === item.size);
      if (sizeData) {
        sizeData.stock += item.quantity;
        await product.save();
      }
    }
  }

  // Refund coins if any were used
  if (order.coinsUsed > 0) {
    const user = await User.findById(order.user);
    await user.addCoins(order.coinsUsed);
    
    // Create coin transaction record for refund
    await CoinTransaction.createEarnedTransaction(
      order.user,
      order.coinsUsed,
      "Order cancelled - coins refunded",
      order.orderNumber,
      order._id
    );
  }

  console.log("Order cancelled", {
    orderId: order._id,
    orderNumber: order.orderNumber,
    userId: req.user.id,
    reason,
  });

  res.json({
    success: true,
    message: "Order cancelled successfully",
    data: { order },
  });
});

// @desc    Request return (user)
// @route   PUT /api/orders/:id/return
// @access  Private
export const requestReturn = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  if (order.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  if (order.status !== 'delivered') {
    return res.status(400).json({ success: false, message: 'Only delivered orders can be returned' });
  }
  order.status = 'return_pending';
  await order.save();
  res.json({ success: true, message: 'Return requested. Awaiting admin approval.', data: { order } });
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
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

  console.log("All orders fetched by admin", {
    adminId: req.user.id,
    count: orders.length,
    total,
  });

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

// @desc    Get recent orders for dashboard (Admin only)
// @route   GET /api/orders/admin/recent
// @access  Private/Admin
export const getRecentOrders = asyncHandler(async (req, res) => {
  try {
    // Simple query without populate to test
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(); // Use lean() for better performance

    console.log("Recent orders fetched for dashboard", {
      adminId: req.user.id,
      count: orders.length,
    });

    res.json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    console.error("Error in getRecentOrders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent orders",
      error: error.message,
    });
  }
});
