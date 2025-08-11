import express from "express";
import { protect, authorize } from "../middlewares/auth.js";
import {
  validateId,
  validateProduct,
  validatePagination,
  validateCoins,
  validate,
} from "../middlewares/validation.js";
import { body } from "express-validator";
import {
  // Users
  listUsers,
  getUserByIdAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  adjustUserCoins,
  // Orders
  listOrders,
  getOrderByIdAdmin,
  updateOrderStatusAdmin,
  // Products
  listProductsAdmin,
  getProductByIdAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  // Dashboard
  getDashboardStats,
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes are protected and require admin role
router.use(protect, authorize("admin"));

// ----- Dashboard -----
router.get("/dashboard/stats", getDashboardStats);

// ----- Users -----
router.get("/users", validatePagination, listUsers);
router.get("/users/:id", validateId, getUserByIdAdmin);
router.put("/users/:id", validateId, updateUserAdmin);
router.delete("/users/:id", validateId, deleteUserAdmin);
router.post(
  "/users/:id/coins",
  [
    validateId,
    validateCoins,
    body("action")
      .isIn(["add", "remove"])
      .withMessage("action must be 'add' or 'remove'"),
    validate,
  ],
  adjustUserCoins
);

// ----- Orders -----
router.get("/orders", validatePagination, listOrders);
router.get("/orders/:id", validateId, getOrderByIdAdmin);
router.put(
  "/orders/:id/status",
  [
    validateId,
    body("status")
        .isIn([
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "return_pending",
          "cancelled",
          "returned",
        ])
      .withMessage("Invalid status"),
    validate,
  ],
  updateOrderStatusAdmin
);

// ----- Products -----
router.get("/products", validatePagination, listProductsAdmin);
router.get("/products/:id", validateId, getProductByIdAdmin);
router.post("/products", validateProduct, createProductAdmin);
router.put("/products/:id", [validateId, validateProduct], updateProductAdmin);
router.delete("/products/:id", validateId, deleteProductAdmin);

export default router;
