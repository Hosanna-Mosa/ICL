import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middlewares/auth.js";
import { validateOrder, validateId } from "../middlewares/validation.js";

const router = express.Router();

// User routes (protected)
router.use(protect);

router.post("/", validateOrder, createOrder);
router.get("/", getUserOrders);
router.get("/:id", validateId, getOrder);
router.put("/:id/cancel", validateId, cancelOrder);

// Admin routes
router.put("/:id/status", validateId, authorize("admin"), updateOrderStatus);
router.get("/admin/all", authorize("admin"), getAllOrders);

export default router;
