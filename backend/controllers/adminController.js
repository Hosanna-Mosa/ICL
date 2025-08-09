import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
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
