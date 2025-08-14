import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  getRelatedProducts,
  getBestSellers,
  getCategoryStats,
} from "../controllers/productController.js";
import { protect, authorize } from "../middlewares/auth.js";
import {
  validateProduct,
  validateId,
  validateProductSearch,
  validatePagination,
} from "../middlewares/validation.js";

const router = express.Router();

// Public routes
router.get("/", validatePagination, getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/bestsellers", getBestSellers);
router.get("/category/:category", validatePagination, getProductsByCategory);
router.get("/search", validateProductSearch, searchProducts);
router.get("/categories/stats", getCategoryStats);
router.get("/:id", validateId, getProduct);
router.get("/:id/related", validateId, getRelatedProducts);

// Admin routes
router.post("/", protect, authorize("admin"), validateProduct, createProduct);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  validateId,
  validateProduct,
  updateProduct
);
router.delete("/:id", protect, authorize("admin"), validateId, deleteProduct);

export default router;
