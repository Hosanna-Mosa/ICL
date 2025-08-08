import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  applyCoinsDiscount,
  removeCoinsDiscount,
} from "../controllers/cartController.js";
import { protect } from "../middlewares/auth.js";
import { validateCartItem } from "../middlewares/validation.js";

const router = express.Router();

// All cart routes are protected
router.use(protect);

// Cart management
router.get("/", getCart);
router.post("/", validateCartItem, addToCart);
router.put("/:productId", validateCartItem, updateCartItem);
router.delete("/:productId", removeFromCart);
router.delete("/", clearCart);

// Coupon management
router.post("/coupon", applyCoupon);
router.delete("/coupon", removeCoupon);

// Coins discount
router.post("/coins", applyCoinsDiscount);
router.delete("/coins", removeCoinsDiscount);

export default router;
