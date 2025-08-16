import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
      required: true,
    },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, default: "India", trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: "India",
      },
    },
    addresses: [addressSchema],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    coins: {
      type: Number,
      default: 0,
      min: [0, "Coins cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    resetPasswordOtp: String, // OTP for password reset
    resetPasswordOtpExpire: Date, // OTP expiry
    emailVerificationToken: String, // Token for email verification
    emailVerificationExpire: Date, // Email verification token expiry
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Index for better query performance (email is already unique in schema)
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to add coins
userSchema.methods.addCoins = async function (amount) {
  this.coins += amount;
  return await this.save();
};

// Method to redeem coins
userSchema.methods.redeemCoins = async function (amount) {
  if (this.coins < amount) {
    throw new Error("Insufficient coins");
  }
  this.coins -= amount;
  return await this.save();
};

// Method to add product to wishlist
userSchema.methods.addToWishlist = async function (productId) {
  if (!this.wishlist.includes(productId)) {
    this.wishlist.push(productId);
    return await this.save();
  }
  return this;
};

// Method to remove product from wishlist
userSchema.methods.removeFromWishlist = async function (productId) {
  this.wishlist = this.wishlist.filter(
    (id) => id.toString() !== productId.toString()
  );
  return await this.save();
};

export default mongoose.model("User", userSchema);
