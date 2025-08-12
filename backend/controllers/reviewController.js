import Review from "../models/Review.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a new review
const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Users can now add multiple reviews for the same product
  // No need to check for existing reviews

  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  // Create review
  const review = await Review.create({
    user: userId,
    product: productId,
    rating,
    comment,
  });

  // Populate user details
  await review.populate("user", "firstName lastName");

  res.status(201).json(
    new ApiResponse(201, review, "Review created successfully")
  );
});

// Get all reviews for a product
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sort = "newest" } = req.query;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Build sort object
  let sortObj = {};
  switch (sort) {
    case "newest":
      sortObj = { createdAt: -1 };
      break;
    case "oldest":
      sortObj = { createdAt: 1 };
      break;
    case "highest":
      sortObj = { rating: -1 };
      break;
    case "lowest":
      sortObj = { rating: 1 };
      break;
    default:
      sortObj = { createdAt: -1 };
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  // Get reviews with pagination
  const reviews = await Review.find({ product: productId })
    .populate("user", "firstName lastName")
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum);

  // Get total count
  const totalReviews = await Review.countDocuments({ product: productId });

  // Calculate pagination info
  const totalPages = Math.ceil(totalReviews / limitNum);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.status(200).json(
    new ApiResponse(200, {
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews,
        hasNextPage,
        hasPrevPage,
        limit: limitNum,
      },
    }, "Reviews fetched successfully")
  );
});

// Update user's own review
const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  // Find review and check ownership
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only edit your own reviews");
  }

  // Validate rating
  if (rating && (rating < 1 || rating > 5)) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  // Update review
  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    {
      rating: rating || review.rating,
      comment: comment || review.comment,
    },
    { new: true, runValidators: true }
  ).populate("user", "firstName lastName");

  res.status(200).json(
    new ApiResponse(200, updatedReview, "Review updated successfully")
  );
});

// Delete user's own review
const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  // Find review and check ownership
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only delete your own reviews");
  }

  // Delete review
  await Review.findByIdAndDelete(reviewId);

  res.status(200).json(
    new ApiResponse(200, {}, "Review deleted successfully")
  );
});

// Get user's reviews for a specific product
const getUserReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  const reviews = await Review.find({ user: userId, product: productId })
    .populate("user", "firstName lastName")
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, { reviews }, "User reviews fetched successfully")
  );
});

// Get review statistics for a product
const getReviewStats = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Get rating distribution
  const ratingStats = await Review.aggregate([
    { $match: { product: product._id } },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  // Get total reviews and average rating
  const totalReviews = await Review.countDocuments({ product: productId });
  const averageRating = product.rating || 0;

  // Calculate rating distribution percentages
  const ratingDistribution = {};
  for (let i = 5; i >= 1; i--) {
    const ratingCount = ratingStats.find(stat => stat._id === i)?.count || 0;
    ratingDistribution[i] = {
      count: ratingCount,
      percentage: totalReviews > 0 ? Math.round((ratingCount / totalReviews) * 100) : 0,
    };
  }

  res.status(200).json(
    new ApiResponse(200, {
      totalReviews,
      averageRating,
      ratingDistribution,
    }, "Review statistics fetched successfully")
  );
});

export {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getUserReviews,
  getReviewStats,
};
