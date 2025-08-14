import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.getOrCreateCart(req.user.id);

  console.log("Cart fetched", {
    userId: req.user.id,
    itemCount: cart.itemCount,
  });

  res.json({
    success: true,
    data: { cart },
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, size, quantity } = req.body;

  // Check if product exists and is active
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({
      success: false,
      message: "Product not found or unavailable",
    });
  }

  // Check if size is available
  if (!product.isSizeAvailable(size)) {
    return res.status(400).json({
      success: false,
      message: `Size ${size} is not available for this product`,
    });
  }

  // Check stock
  const stock = product.getStockForSize(size);
  if (stock < quantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${stock} items available in size ${size}`,
    });
  }

  // Get or create cart
  const cart = await Cart.getOrCreateCart(req.user.id);

  // Get current price
  const currentPrice = product.currentPrice;

  // Add item to cart
  await cart.addItem(productId, size, quantity, currentPrice);

  // Ensure populated cart is returned
  await cart.populate("items.product");

  console.log("Item added to cart", {
    userId: req.user.id,
    productId,
    size,
    quantity,
  });

  res.json({
    success: true,
    message: "Item added to cart successfully",
    data: { cart },
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { size, quantity } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({
      success: false,
      message: "Product not found or unavailable",
    });
  }

  // Check stock if increasing quantity
  if (quantity > 0) {
    const stock = product.getStockForSize(size);
    if (stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${stock} items available in size ${size}`,
      });
    }
  }

  // Get cart
  const cart = await Cart.getOrCreateCart(req.user.id);

  // Update item quantity
  let updatedCart = await cart.updateItemQuantity(productId, size, quantity);

  // Ensure populated cart is returned
  updatedCart = await updatedCart.populate("items.product");

  console.log("Cart item updated", {
    userId: req.user.id,
    productId,
    size,
    quantity,
  });

  res.json({
    success: true,
    message: "Cart updated successfully",
    data: { cart: updatedCart },
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { size } = req.body;

  // Get cart
  const cart = await Cart.getOrCreateCart(req.user.id);

  // Remove item
  let updatedCart = await cart.removeItem(productId, size);

  // Ensure populated cart is returned
  updatedCart = await updatedCart.populate("items.product");

  console.log("Item removed from cart", {
    userId: req.user.id,
    productId,
    size,
  });

  res.json({
    success: true,
    message: "Item removed from cart successfully",
    data: { cart: updatedCart },
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.getOrCreateCart(req.user.id);

  let updatedCart = await cart.clearCart();

  // Ensure populated cart is returned (items array will be empty, but keep response consistent)
  updatedCart = await updatedCart.populate("items.product");

  console.log("Cart cleared", { userId: req.user.id });

  res.json({
    success: true,
    message: "Cart cleared successfully",
    data: { cart: updatedCart },
  });
});

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
// @access  Private
export const applyCoupon = asyncHandler(async (req, res) => {
  const { couponCode } = req.body;

  // Simple coupon logic (can be extended)
  const coupons = {
    WELCOME10: { discount: 10, minAmount: 1000 },
    SAVE20: { discount: 20, minAmount: 2000 },
    FREESHIP: { discount: 0, minAmount: 1500, freeShipping: true },
  };

  const coupon = coupons[couponCode];
  if (!coupon) {
    return res.status(400).json({
      success: false,
      message: "Invalid coupon code",
    });
  }

  const cart = await Cart.getOrCreateCart(req.user.id);

  if (cart.subtotal < coupon.minAmount) {
    return res.status(400).json({
      success: false,
      message: `Minimum order amount of ₹${coupon.minAmount} required for this coupon`,
    });
  }

  const discountAmount =
    coupon.discount > 0 ? (cart.subtotal * coupon.discount) / 100 : 0;

  await cart.applyCoupon(couponCode, discountAmount);
  await cart.populate("items.product");

  console.log("Coupon applied", {
    userId: req.user.id,
    couponCode,
    discountAmount,
  });

  res.json({
    success: true,
    message: "Coupon applied successfully",
    data: { cart },
  });
});

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon
// @access  Private
export const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await Cart.getOrCreateCart(req.user.id);

  await cart.removeCoupon();
  await cart.populate("items.product");

  console.log("Coupon removed", { userId: req.user.id });

  res.json({
    success: true,
    message: "Coupon removed successfully",
    data: { cart },
  });
});

// @desc    Apply coins discount
// @route   POST /api/cart/coins
// @access  Private
export const applyCoinsDiscount = asyncHandler(async (req, res) => {
  const { coinsUsed } = req.body;

  if (coinsUsed < 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid coins amount",
    });
  }

  // If coinsUsed is 0, remove coins discount
  if (coinsUsed === 0) {
    const cart = await Cart.getOrCreateCart(req.user.id);
    await cart.removeCoinsDiscount();
    await cart.populate("items.product");
    
    console.log("Coins discount removed", { userId: req.user.id });
    
    return res.json({
      success: true,
      message: "Coins discount removed successfully",
      data: { cart },
    });
  }

  // Check if user has enough coins
  if (req.user.coins < coinsUsed) {
    return res.status(400).json({
      success: false,
      message: "Insufficient coins",
    });
  }

  const cart = await Cart.getOrCreateCart(req.user.id);

  // Calculate discount (1 coin = ₹1)
  const discountAmount = Math.min(coinsUsed, cart.subtotal);

  await cart.applyCoinsDiscount(coinsUsed, discountAmount);
  await cart.populate("items.product");

  console.log("Coins discount applied", {
    userId: req.user.id,
    coinsUsed,
    discountAmount,
  });

  res.json({
    success: true,
    message: "Coins discount applied successfully",
    data: { cart },
  });
});

// @desc    Remove coins discount
// @route   DELETE /api/cart/coins
// @access  Private
export const removeCoinsDiscount = asyncHandler(async (req, res) => {
  const cart = await Cart.getOrCreateCart(req.user.id);

  await cart.removeCoinsDiscount();
  await cart.populate("items.product");

  console.log("Coins discount removed", { userId: req.user.id });

  res.json({
    success: true,
    message: "Coins discount removed successfully",
    data: { cart },
  });
});
