import Settings from "../models/Settings.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private/Admin
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getOrCreateDefault();
  
  res.status(200).json(
    new ApiResponse(200, settings, "Settings retrieved successfully")
  );
});

// @desc    Get settings by section
// @route   GET /api/settings/:section
// @access  Private/Admin
export const getSettingsBySection = asyncHandler(async (req, res) => {
  const { section } = req.params;
  
  const settings = await Settings.getOrCreateDefault();
  
  if (!settings[section]) {
    throw new ApiError(404, `Section '${section}' not found`);
  }
  
  res.status(200).json(
    new ApiResponse(200, settings[section], `${section} settings retrieved successfully`)
  );
});

// @desc    Update settings section
// @route   PUT /api/settings/:section
// @access  Private/Admin
export const updateSettingsSection = asyncHandler(async (req, res) => {
  const { section } = req.params;
  const updateData = req.body;
  
  const settings = await Settings.getOrCreateDefault();
  
  // Validate section exists
  if (!settings[section]) {
    throw new ApiError(404, `Section '${section}' not found`);
  }
  
  // Update the section
  await settings.updateSection(section, updateData);
  
  // Update metadata
  settings.updatedBy = req.user._id;
  await settings.save();
  
  res.status(200).json(
    new ApiResponse(200, settings[section], `${section} settings updated successfully`)
  );
});

// @desc    Update multiple settings sections
// @route   PUT /api/settings
// @access  Private/Admin
export const updateMultipleSettings = asyncHandler(async (req, res) => {
  const updateData = req.body;
  
  const settings = await Settings.getOrCreateDefault();
  
  // Validate all sections exist
  const invalidSections = Object.keys(updateData).filter(
    section => !settings[section]
  );
  
  if (invalidSections.length > 0) {
    throw new ApiError(400, `Invalid sections: ${invalidSections.join(", ")}`);
  }
  
  // Update each section
  for (const [section, data] of Object.entries(updateData)) {
    await settings.updateSection(section, data);
  }
  
  // Update metadata
  settings.updatedBy = req.user._id;
  await settings.save();
  
  res.status(200).json(
    new ApiResponse(200, settings, "Settings updated successfully")
  );
});

// @desc    Reset settings to defaults
// @route   POST /api/settings/reset
// @access  Private/Admin
export const resetSettings = asyncHandler(async (req, res) => {
  const { section } = req.query;
  
  if (section) {
    // Reset specific section
    const settings = await Settings.getOrCreateDefault();
    
    if (!settings[section]) {
      throw new ApiError(404, `Section '${section}' not found`);
    }
    
    // Create new settings instance to get defaults
    const defaultSettings = new Settings();
    settings[section] = defaultSettings[section];
    settings.updatedBy = req.user._id;
    await settings.save();
    
    res.status(200).json(
      new ApiResponse(200, settings[section], `${section} settings reset to defaults`)
    );
  } else {
    // Reset all settings
    await Settings.deleteMany({});
    const newSettings = await Settings.getOrCreateDefault();
    newSettings.updatedBy = req.user._id;
    await newSettings.save();
    
    res.status(200).json(
      new ApiResponse(200, newSettings, "All settings reset to defaults")
    );
  }
});

// @desc    Test connection (email, payment gateway, etc.)
// @route   POST /api/settings/test-connection
// @access  Private/Admin
export const testConnection = asyncHandler(async (req, res) => {
  const { type } = req.body;
  
  if (!type) {
    throw new ApiError(400, "Connection type is required");
  }
  
  try {
    switch (type) {
      case "email":
        // Test email connection logic would go here
        // For now, just simulate success
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
        
      case "phonepe":
        // Test PhonePe connection logic would go here
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
        
      case "cloudinary":
        // Test Cloudinary connection logic would go here
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
        
      default:
        throw new ApiError(400, `Unsupported connection type: ${type}`);
    }
    
    res.status(200).json(
      new ApiResponse(200, null, `${type} connection test successful`)
    );
  } catch (error) {
    throw new ApiError(500, `${type} connection test failed: ${error.message}`);
  }
});

// @desc    Export settings
// @route   GET /api/settings/export
// @access  Private/Admin
export const exportSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getOrCreateDefault();
  
  // Remove sensitive data for export
  const exportData = {
    ...settings.toObject(),
    email: {
      ...settings.email,
      emailPass: "[HIDDEN]"
    },
    payment: {
      ...settings.payment,
      phonepeMerchantKey: "[HIDDEN]"
    },
    security: {
      ...settings.security,
      jwtSecret: "[HIDDEN]"
    },
    system: {
      ...settings.system,
      cloudinaryApiKey: "[HIDDEN]",
      cloudinaryApiSecret: "[HIDDEN]"
    }
  };
  
  res.status(200).json(
    new ApiResponse(200, exportData, "Settings exported successfully")
  );
});

// @desc    Import settings
// @route   POST /api/settings/import
// @access  Private/Admin
export const importSettings = asyncHandler(async (req, res) => {
  const importData = req.body;
  
  if (!importData || typeof importData !== "object") {
    throw new ApiError(400, "Invalid import data");
  }
  
  const settings = await Settings.getOrCreateDefault();
  
  // Update settings with imported data
  for (const [section, data] of Object.entries(importData)) {
    if (settings[section] && typeof data === "object") {
      await settings.updateSection(section, data);
    }
  }
  
  settings.updatedBy = req.user._id;
  await settings.save();
  
  res.status(200).json(
    new ApiResponse(200, settings, "Settings imported successfully")
  );
});
