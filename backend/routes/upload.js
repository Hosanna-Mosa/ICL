import express from "express";
import { uploadMultipleImages, uploadImage } from "../utils/cloudinary.js";
import { protect, authorize } from "../middlewares/auth.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

const router = express.Router();

// @desc    Upload single image to Cloudinary
// @route   POST /api/upload/image
// @access  Private/Admin
router.post(
  "/image",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const { imageData, folder = "brelis-products" } = req.body;

    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: "Image data is required",
      });
    }

    try {
      const result = await uploadImage(imageData, folder);

      console.log("Image uploaded to Cloudinary", {
        public_id: result.public_id,
        adminId: req.user.id,
      });

      res.json({
        success: true,
        message: "Image uploaded successfully",
        data: result,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to upload image",
      });
    }
  })
);

// @desc    Upload multiple images to Cloudinary
// @route   POST /api/upload/images
// @access  Private/Admin
router.post(
  "/images",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const { images, folder = "brelis-products" } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Images array is required",
      });
    }

    if (images.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 images can be uploaded at once",
      });
    }

    try {
      const result = await uploadMultipleImages(images, folder);

      console.log("Multiple images uploaded to Cloudinary", {
        total: result?.total || 0,
        successful: result?.successful || 0,
        failed: result?.failed?.length || 0,
        adminId: req.user.id,
      });

      res.json({
        success: true,
        message: `${result?.successful || 0} images uploaded successfully`,
        data: result,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to upload images",
      });
    }
  })
);

export default router;
