import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    reported: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance (removed unique constraint to allow multiple reviews per user)
reviewSchema.index({ user: 1, product: 1 });

// Index for better query performance
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ isVerified: 1 });

// Virtual for user's full name
reviewSchema.virtual("userFullName", {
  ref: "User",
  localField: "user",
  foreignField: "_id",
  justOne: true,
  get: function (user) {
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  },
});

// Pre-save middleware to update product rating
reviewSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("rating")) {
    try {
      const Product = mongoose.model("Product");
      const product = await Product.findById(this.product);
      
      if (product) {
        // Calculate new average rating
        const allReviews = await mongoose.model("Review").find({ product: this.product });
        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / allReviews.length;
        
        // Update product rating and review count
        product.rating = Math.round(averageRating * 10) / 10; // Round to 1 decimal place
        product.reviewCount = allReviews.length;
        await product.save();
      }
    } catch (error) {
      console.error("Error updating product rating:", error);
    }
  }
  next();
});

// Pre-remove middleware to update product rating when review is deleted
reviewSchema.pre("remove", async function (next) {
  try {
    const Product = mongoose.model("Product");
    const product = await Product.findById(this.product);
    
    if (product) {
      const remainingReviews = await mongoose.model("Review").find({ product: this.product });
      
      if (remainingReviews.length === 0) {
        product.rating = 0;
        product.reviewCount = 0;
      } else {
        const totalRating = remainingReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / remainingReviews.length;
        product.rating = Math.round(averageRating * 10) / 10;
        product.reviewCount = remainingReviews.length;
      }
      
      await product.save();
    }
  } catch (error) {
    console.error("Error updating product rating after review removal:", error);
  }
  next();
});

export default mongoose.model("Review", reviewSchema);
