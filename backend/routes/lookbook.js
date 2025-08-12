import express from "express";
import {
  getAllLookbookItems,
  getLookbookItemById,
  getLookbookByCategory,
  createLookbookItem,
  updateLookbookItem,
  deleteLookbookItem,
  toggleLookbookItemStatus,
  getLookbookCategories,
  searchLookbookItems,
} from "../controllers/lookbookController.js";
import { protect, authorize } from "../middlewares/auth.js";
import { validateLookbook } from "../middlewares/validation.js";

const router = express.Router();

// Public routes
router.get("/", getAllLookbookItems);
router.get("/categories", getLookbookCategories);
router.get("/search", searchLookbookItems);
router.get("/category/:category", getLookbookByCategory);
router.get("/:id", getLookbookItemById);

// Protected admin routes
router.post("/", protect, authorize("admin"), validateLookbook, createLookbookItem);
router.put("/:id", protect, authorize("admin"), validateLookbook, updateLookbookItem);
router.delete("/:id", protect, authorize("admin"), deleteLookbookItem);
router.patch("/:id/toggle", protect, authorize("admin"), toggleLookbookItemStatus);

export default router;
