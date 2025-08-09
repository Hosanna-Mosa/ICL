import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    },
    colors: {
      type: [String],
      default: ["black"],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["hoodies", "tshirts", "pants", "shorts", "jackets", "accessories"],
    },
    subcategory: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      default: "ICL",
      trim: true,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    sizes: [sizeSchema],
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Price cannot be negative"],
    },
    salePrice: {
      type: Number,
      min: [0, "Sale price cannot be negative"],
    },
    coinsEarned: {
      type: Number,
      default: 0,
      min: [0, "Coins earned cannot be negative"],
    },
    coinsRequired: {
      type: Number,
      default: 0,
      min: [0, "Coins required cannot be negative"],
    },
    fabric: {
      type: String,
      trim: true,
    },
    gsm: {
      type: String,
      trim: true,
    },
    fit: {
      type: String,
      enum: ["regular", "oversized", "slim", "relaxed"],
      default: "regular",
    },
    washCare: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, "Review count cannot be negative"],
    },
    totalSold: {
      type: Number,
      default: 0,
      min: [0, "Total sold cannot be negative"],
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for current price (sale price if available, otherwise base price)
productSchema.virtual("currentPrice").get(function () {
  return this.salePrice || this.basePrice;
});

// Virtual for discount percentage
productSchema.virtual("discountPercentage").get(function () {
  if (!this.salePrice || this.salePrice >= this.basePrice) return 0;
  return Math.round(((this.basePrice - this.salePrice) / this.basePrice) * 100);
});

// Virtual for total stock
productSchema.virtual("totalStock").get(function () {
  return this.sizes.reduce((total, size) => total + size.stock, 0);
});

// Virtual for isInStock
productSchema.virtual("isInStock").get(function () {
  return this.totalStock > 0;
});

// Indexes for better query performance
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ totalSold: -1 });
productSchema.index({ "sizes.size": 1 });

// Method to get available sizes
productSchema.methods.getAvailableSizes = function () {
  return this.sizes.filter((size) => size.stock > 0).map((size) => size.size);
};

// Method to check if size is available
productSchema.methods.isSizeAvailable = function (size) {
  const sizeData = this.sizes.find((s) => s.size === size);
  return sizeData && sizeData.stock > 0;
};

// Method to get stock for a specific size
productSchema.methods.getStockForSize = function (size) {
  const sizeData = this.sizes.find((s) => s.size === size);
  return sizeData ? sizeData.stock : 0;
};

// Method to update stock
productSchema.methods.updateStock = function (size, quantity) {
  const sizeData = this.sizes.find((s) => s.size === size);
  if (sizeData) {
    sizeData.stock = Math.max(0, sizeData.stock - quantity);
    return this.save();
  }
  throw new Error(`Size ${size} not found`);
};

// Method to update rating
productSchema.methods.updateRating = function (newRating) {
  const totalRating = this.rating * this.reviewCount + newRating;
  this.reviewCount += 1;
  this.rating = totalRating / this.reviewCount;
  return this.save();
};

// Static method to generate SKU
productSchema.statics.generateSKU = function (category, name) {
  const timestamp = Date.now().toString().slice(-6);
  const categoryCode = category.substring(0, 3).toUpperCase();
  const nameCode = name.substring(0, 3).toUpperCase();
  return `${categoryCode}${nameCode}${timestamp}`;
};

export default mongoose.model("Product", productSchema);
