import express from "express";
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getUserReviews,
  getReviewStats,
  getProductWithReviews,
} from "../controllers/reviewController.js";
import { protect } from "../middlewares/auth.js";
import {
  validateProductIdParam,
  validateReviewIdParam,
} from "../middlewares/validation.js";
const router = express.Router();

// Public routes
router.get("/product/:productId", validateProductIdParam, getProductReviews);
router.get(
  "/product/:productId/with-reviews",
  validateProductIdParam,
  getProductWithReviews
);
router.get("/product/:productId/stats", validateProductIdParam, getReviewStats);

// Protected routes (require authentication)
router.use(protect);

router.post("/product/:productId", validateProductIdParam, createReview);
router.get("/product/:productId/user", validateProductIdParam, getUserReviews);
router.put("/:reviewId", validateReviewIdParam, updateReview);
router.delete("/:reviewId", validateReviewIdParam, deleteReview);

export default router;
