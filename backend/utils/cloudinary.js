import { v2 as cloudinary } from "cloudinary";
import { asyncHandler } from "../middlewares/errorHandler.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dp3ta3zts",
  api_key: process.env.CLOUDINARY_API_KEY || "223762452682593",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "NmC-8MQ-IfFFUL-AUU0YmytbD5A",
});

/**
 * Upload image to Cloudinary
 * @param {string} imageData - Base64 image data or image URL
 * @param {string} folder - Cloudinary folder name (optional)
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} Upload result with URL and public_id
 */
export const uploadImage = async (
  imageData,
  folder = "icl-products",
  options = {}
) => {
  try {
    const uploadOptions = {
      folder,
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
      ...options,
    };

    let result;

    // Check if it's a base64 string or URL
    if (imageData.startsWith("data:image/")) {
      // Base64 image
      result = await cloudinary.uploader.upload(imageData, uploadOptions);
    } else if (imageData.startsWith("http")) {
      // URL
      result = await cloudinary.uploader.upload(imageData, uploadOptions);
    } else {
      throw new Error("Invalid image data format");
    }

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array} images - Array of image data (base64 or URLs)
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Array>} Array of upload results
 */
export const uploadMultipleImages = async (images, folder = "icl-products") => {
  const uploadPromises = images.map((imageData, index) => {
    const options = {
      public_id: `${folder}-${Date.now()}-${index}`,
    };
    return uploadImage(imageData, folder, options);
  });

  const results = await Promise.allSettled(uploadPromises);

  const successful = [];
  const failed = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      successful.push(result.value);
    } else {
      failed.push({
        index,
        error: result.reason.message,
      });
    }
  });

  if (failed.length > 0) {
    console.warn("Some images failed to upload:", failed);
  }

  return {
    success: true,
    uploaded: successful,
    failed,
    total: images.length,
    successful: successful.length,
  };
};

/**
 * Delete image from Cloudinary
 * @param {string} public_id - Cloudinary public_id
 * @returns {Promise<Object>} Deletion result
 */
export const deleteImage = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Generate Cloudinary URL with transformations
 * @param {string} public_id - Cloudinary public_id
 * @param {Object} transformations - Cloudinary transformations
 * @returns {string} Transformed URL
 */
export const getImageUrl = (public_id, transformations = {}) => {
  return cloudinary.url(public_id, {
    secure: true,
    ...transformations,
  });
};

export default cloudinary;
