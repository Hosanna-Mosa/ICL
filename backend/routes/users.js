import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getUserCoins,
  addCoinsToUser,
  redeemCoins,
  getCoinTransactions,
  getAllUsers,
  getUserById,
  updateUser,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  addWelcomeCoins,
} from "../controllers/userController.js";
import { protect, authorize } from "../middlewares/auth.js";
import { validateId, validateCoins, validateProductIdParam } from "../middlewares/validation.js";

const router = express.Router();

// User routes (protected)
router.use(protect);

router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.get("/wishlist", getWishlist);
router.post("/wishlist", addToWishlist);
router.delete("/wishlist/:productId", validateProductIdParam, removeFromWishlist);
router.get("/coins", getUserCoins);
router.get("/coins/transactions", getCoinTransactions);
router.post("/coins/redeem", validateCoins, redeemCoins);
router.post("/welcome-coins", addWelcomeCoins);
// Address book
router.get("/addresses", getAddresses);
router.post("/addresses", addAddress);
router.put("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);

// Admin routes
router.post("/coins/add", authorize("admin"), addCoinsToUser);
router.get("/admin/all", authorize("admin"), getAllUsers);
router.get("/admin/:id", authorize("admin"), validateId, getUserById);
router.put("/admin/:id", authorize("admin"), validateId, updateUser);

export default router;
