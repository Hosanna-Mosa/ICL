import User from "../models/User.js";
import { generateToken } from "../middlewares/auth.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { sendEmail } from "../utils/emailService.js";
import crypto from "crypto";

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists with this email",
    });
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
  });

  // Generate token
  const token = generateToken(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  console.log("User registered successfully", {
    userId: user._id,
    email: user.email,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        coins: user.coins,
        fullName: user.fullName,
      },
      token,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: "Account is deactivated",
    });
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Generate token
  const token = generateToken(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  console.log("User logged in successfully", {
    userId: user._id,
    email: user.email,
  });

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        coins: user.coins,
        fullName: user.fullName,
      },
      token,
    },
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        coins: user.coins,
        fullName: user.fullName,
        address: user.address,
        lastLogin: user.lastLogin,
      },
    },
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, address } = req.body;

  const user = await User.findById(req.user.id);

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;
  if (address) user.address = address;

  await user.save();

  console.log("User profile updated", { userId: user._id });

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        coins: user.coins,
        fullName: user.fullName,
        address: user.address,
      },
    },
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  console.log("User password changed", { userId: user._id });

  res.json({
    success: true,
    message: "Password changed successfully",
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 1000 * 60 * 30; // 30 minutes
  await user.save();
  // Send email
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `<h2>Password Reset</h2><p>Click <a href='${resetUrl}'>here</a> to reset your password. This link will expire in 30 minutes.</p>`
    });
    res.json({ success: true, message: "Password reset email sent" });
  } catch (e) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid or expired token" });
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.json({ success: true, message: "Password reset successful" });
});

// @desc    Request OTP for password reset
// @route   POST /api/auth/request-reset-otp
// @access  Public
export const requestResetOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordOtp = otp;
  user.resetPasswordOtpExpire = Date.now() + 1000 * 60 * 10; // 10 minutes
  await user.save();
  try {
    await sendEmail({
      to: user.email,
      subject: "Your OTP for Password Reset",
      html: `<h2>Password Reset OTP</h2><p>Your OTP is <b>${otp}</b>. It will expire in 10 minutes.</p>`
    });
    res.json({ success: true, message: "OTP sent to your email" });
  } catch (e) {
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    await user.save();
    res.status(500).json({ success: false, message: "Failed to send OTP email" });
  }
});

// @desc    Verify OTP for password reset
// @route   POST /api/auth/verify-reset-otp
// @access  Public
export const verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.resetPasswordOtp || !user.resetPasswordOtpExpire) {
    return res.status(400).json({ success: false, message: "OTP not requested or expired" });
  }
  if (user.resetPasswordOtp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }
  if (user.resetPasswordOtpExpire < Date.now()) {
    return res.status(400).json({ success: false, message: "OTP expired" });
  }
  res.json({ success: true, message: "OTP verified" });
});

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password-otp
// @access  Public
export const resetPasswordWithOtp = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.resetPasswordOtp || !user.resetPasswordOtpExpire) {
    return res.status(400).json({ success: false, message: "OTP not requested or expired" });
  }
  if (user.resetPasswordOtp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }
  if (user.resetPasswordOtpExpire < Date.now()) {
    return res.status(400).json({ success: false, message: "OTP expired" });
  }
  user.password = password;
  user.resetPasswordOtp = undefined;
  user.resetPasswordOtpExpire = undefined;
  await user.save();
  res.json({ success: true, message: "Password reset successful" });
});
