import express from "express";
import {
  getSettings,
  getSettingsBySection,
  updateSettingsSection,
  updateMultipleSettings,
  resetSettings,
  testConnection,
  exportSettings,
  importSettings,
} from "../controllers/settingsController.js";
import { protect, admin } from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication and admin privileges
router.use(protect, admin);

// GET /api/settings - Get all settings
router.get("/", getSettings);

// GET /api/settings/:section - Get settings by section
router.get("/:section", getSettingsBySection);

// PUT /api/settings/:section - Update specific section
router.put("/:section", updateSettingsSection);

// PUT /api/settings - Update multiple sections
router.put("/", updateMultipleSettings);

// POST /api/settings/reset - Reset settings to defaults
router.post("/reset", resetSettings);

// POST /api/settings/test-connection - Test connections
router.post("/test-connection", testConnection);

// GET /api/settings/export - Export settings
router.get("/export", exportSettings);

// POST /api/settings/import - Import settings
router.post("/import", importSettings);

export default router;
