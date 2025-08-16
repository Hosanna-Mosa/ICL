import User from "../models/User.js";
import Product from "../models/Product.js";
import CoinTransaction from "../models/CoinTransaction.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        coins: user.coins,
        fullName: user.fullName,
        address: user.address,
        addresses: user.addresses || [],
        lastLogin: user.lastLogin,
      },
    },
  });
});

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, address } = req.body;
  const user = await User.findById(req.user.id);

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;
  if (address) user.address = address;

  await user.save();

  console.log("User profile updated", { userId: user._id });

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        coins: user.coins,
        fullName: user.fullName,
        address: user.address,
        addresses: user.addresses || [],
      },
    },
  });
});

// Address book CRUD
// @route GET /api/user/addresses
export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, data: { addresses: user.addresses || [] } });
});

// @route POST /api/user/addresses
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const address = req.body;
  if (address.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses.push(address);
  await user.save();
  res.status(201).json({ success: true, message: "Address added", data: { addresses: user.addresses } });
});

// @route PUT /api/user/addresses/:addressId
export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const { addressId } = req.params;
  const update = req.body;
  const address = user.addresses.id(addressId);
  if (!address) {
    return res.status(404).json({ success: false, message: "Address not found" });
  }
  if (update.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  Object.assign(address, update);
  await user.save();
  res.json({ success: true, message: "Address updated", data: { addresses: user.addresses } });
});

// @route DELETE /api/user/addresses/:addressId
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const { addressId } = req.params;
  const address = user.addresses.id(addressId);
  if (!address) {
    return res.status(404).json({ success: false, message: "Address not found" });
  }
  // Mongoose v7 removed remove(); use deleteOne() or pull()
  if (typeof address.deleteOne === 'function') {
    await address.deleteOne();
  } else {
    user.addresses.pull({ _id: addressId });
  }
  await user.save();
  res.json({ success: true, message: "Address removed", data: { addresses: user.addresses } });
});

// @desc    Get user wishlist
// @route   GET /api/user/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: "wishlist",
    match: { isActive: true },
  });

  console.log("Wishlist fetched", {
    userId: req.user.id,
    count: user.wishlist.length,
  });

  res.json({
    success: true,
    data: {
      wishlist: user.wishlist,
    },
  });
});

// @desc    Add product to wishlist
// @route   POST /api/user/wishlist
// @access  Private
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  // Check if product exists and is active
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({
      success: false,
      message: "Product not found or unavailable",
    });
  }

  const user = await User.findById(req.user.id);
  await user.addToWishlist(productId);

  console.log("Product added to wishlist", {
    userId: req.user.id,
    productId,
  });

  res.json({
    success: true,
    message: "Product added to wishlist successfully",
    data: {
      wishlist: user.wishlist,
    },
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/user/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user.id);
  await user.removeFromWishlist(productId);

  console.log("Product removed from wishlist", {
    userId: req.user.id,
    productId,
  });

  res.json({
    success: true,
    message: "Product removed from wishlist successfully",
    data: {
      wishlist: user.wishlist,
    },
  });
});

// @desc    Get user coins
// @route   GET /api/user/coins
// @access  Private
export const getUserCoins = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    data: {
      coins: user.coins,
    },
  });
});

// @desc    Add coins to user (Admin only)
// @route   POST /api/user/coins/add
// @access  Private/Admin
export const addCoinsToUser = asyncHandler(async (req, res) => {
  const { userId, amount } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  await user.addCoins(amount);

  console.log("Coins added to user", {
    userId,
    amount,
    adminId: req.user.id,
  });

  res.json({
    success: true,
    message: "Coins added successfully",
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        coins: user.coins,
      },
    },
  });
});

// @desc    Redeem coins
// @route   POST /api/user/coins/redeem
// @access  Private
export const redeemCoins = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid amount",
    });
  }

  const user = await User.findById(req.user.id);

  if (user.coins < amount) {
    return res.status(400).json({
      success: false,
      message: "Insufficient coins",
    });
  }

  await user.redeemCoins(amount);

  console.log("Coins redeemed", {
    userId: req.user.id,
    amount,
  });

  res.json({
    success: true,
    message: "Coins redeemed successfully",
    data: {
      coins: user.coins,
    },
  });
});

// @desc    Get all users (Admin only)
// @route   GET /api/user/admin/all
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
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

  console.log("All users fetched by admin", {
    adminId: req.user.id,
    count: users.length,
    total,
  });

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

// @desc    Get user by ID (Admin only)
// @route   GET /api/user/admin/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.json({
    success: true,
    data: { user },
  });
});

// @desc    Update user (Admin only)
// @route   PUT /api/user/admin/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, role, isActive, coins } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (role) user.role = role;
  if (typeof isActive === "boolean") user.isActive = isActive;
  if (typeof coins === "number") user.coins = coins;

  await user.save();

  console.log("User updated by admin", {
    userId: user._id,
    adminId: req.user.id,
  });

  res.json({
    success: true,
    message: "User updated successfully",
    data: { user },
  });
});

// @desc    Get user coin transactions
// @route   GET /api/user/coins/transactions
// @access  Private
export const getCoinTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [transactions, total] = await Promise.all([
    CoinTransaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    CoinTransaction.countDocuments({ user: req.user.id }),
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  console.log("Coin transactions fetched", {
    userId: req.user.id,
    count: transactions.length,
    total,
  });

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

// @desc    Add welcome coins for first-time buyers
// @route   POST /api/user/welcome-coins
// @access  Private
export const addWelcomeCoins = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  // Check if user has already received welcome coins
  const hasWelcomeCoins = await CoinTransaction.findOne({
    user: req.user.id,
    type: "welcome_bonus"
  });

  if (hasWelcomeCoins) {
    return res.status(400).json({
      success: false,
      message: "Welcome coins already received"
    });
  }

  // Add 100 welcome coins
  user.coins += 100;
  await user.save();

  // Create transaction record
  await CoinTransaction.create({
    user: req.user.id,
    type: "welcome_bonus",
    amount: 100,
    description: "First-time buyer welcome bonus",
    balance: user.coins
  });

  console.log("Welcome coins added for first-time buyer", {
    userId: user._id,
    coinsAdded: 100,
    newBalance: user.coins
  });

  res.json({
    success: true,
    message: "Welcome coins added successfully",
    data: {
      coins: user.coins,
      coinsAdded: 100
    }
  });
});
