import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    size: {
      type: String,
      required: true,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      max: [10, "Quantity cannot exceed 10"],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    couponCode: {
      type: String,
      trim: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, "Discount amount cannot be negative"],
    },
    coinsUsed: {
      type: Number,
      default: 0,
      min: [0, "Coins used cannot be negative"],
    },
    coinsDiscount: {
      type: Number,
      default: 0,
      min: [0, "Coins discount cannot be negative"],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for subtotal
cartSchema.virtual("subtotal").get(function () {
  return this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
});

// Virtual for total items count
cartSchema.virtual("itemCount").get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for total after discounts
cartSchema.virtual("total").get(function () {
  const subtotal = this.subtotal;
  const totalDiscount = this.discountAmount + this.coinsDiscount;
  return Math.max(0, subtotal - totalDiscount);
});

// Index for better query performance (user is already unique in schema)
cartSchema.index({ "items.product": 1 });

// Method to add item to cart
cartSchema.methods.addItem = async function (productId, size, quantity, price) {
  const existingItem = this.items.find(
    (item) =>
      item.product.toString() === productId.toString() && item.size === size
  );

  if (existingItem) {
    existingItem.quantity = Math.min(10, existingItem.quantity + quantity);
    existingItem.price = price; // Update price in case it changed
  } else {
    this.items.push({
      product: productId,
      size,
      quantity,
      price,
    });
  }

  this.lastUpdated = new Date();
  return await this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function (
  productId,
  size,
  quantity
) {
  const item = this.items.find(
    (item) =>
      item.product.toString() === productId.toString() && item.size === size
  );

  if (!item) {
    throw new Error("Item not found in cart");
  }

  if (quantity <= 0) {
    this.items = this.items.filter(
      (item) =>
        !(
          item.product.toString() === productId.toString() && item.size === size
        )
    );
  } else {
    item.quantity = Math.min(10, quantity);
  }

  this.lastUpdated = new Date();
  return await this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function (productId, size) {
  console.log('removeItem called with:', { productId, size });
  console.log('Before filtering - items count:', this.items.length);
  console.log('Items before:', this.items.map(item => ({ product: item.product.toString(), size: item.size })));
  
  this.items = this.items.filter(
    (item) =>
      !(item.product.toString() === productId.toString() && item.size === size)
  );
  
  console.log('After filtering - items count:', this.items.length);
  console.log('Items after:', this.items.map(item => ({ product: item.product.toString(), size: item.size })));

  this.lastUpdated = new Date();
  const savedCart = await this.save();
  console.log('Cart saved successfully, items count:', savedCart.items.length);
  return savedCart;
};

// Method to clear cart
cartSchema.methods.clearCart = async function () {
  this.items = [];
  this.couponCode = null;
  this.discountAmount = 0;
  this.coinsUsed = 0;
  this.coinsDiscount = 0;
  this.lastUpdated = new Date();
  return await this.save();
};

// Method to apply coupon
cartSchema.methods.applyCoupon = async function (couponCode, discountAmount) {
  this.couponCode = couponCode;
  this.discountAmount = discountAmount;
  this.lastUpdated = new Date();
  return await this.save();
};

// Method to remove coupon
cartSchema.methods.removeCoupon = async function () {
  this.couponCode = null;
  this.discountAmount = 0;
  this.lastUpdated = new Date();
  return await this.save();
};

// Method to apply coins discount
cartSchema.methods.applyCoinsDiscount = async function (
  coinsUsed,
  discountAmount
) {
  this.coinsUsed = coinsUsed;
  this.coinsDiscount = discountAmount;
  this.lastUpdated = new Date();
  return await this.save();
};

// Method to remove coins discount
cartSchema.methods.removeCoinsDiscount = async function () {
  this.coinsUsed = 0;
  this.coinsDiscount = 0;
  this.lastUpdated = new Date();
  return await this.save();
};

// Static method to get or create cart for user
cartSchema.statics.getOrCreateCart = async function (userId) {
  let cart = await this.findOne({ user: userId }).populate("items.product");

  if (!cart) {
    cart = new this({ user: userId, items: [] });
    await cart.save();
  }

  return cart;
};

export default mongoose.model("Cart", cartSchema);
