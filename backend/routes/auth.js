import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  requestResetOtp,
  verifyResetOtp,
  resetPasswordWithOtp,
} from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";
import { validateRegister, validateLogin } from "../middlewares/validation.js";

const router = express.Router();

// Public routes
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/request-reset-otp", requestResetOtp);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password-otp", resetPasswordWithOtp);

// Protected routes
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;
