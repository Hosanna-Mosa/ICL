import Lookbook from "../models/Lookbook.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

// @desc    Get all lookbook items
// @route   GET /api/lookbook
// @access  Public
export const getAllLookbookItems = asyncHandler(async (req, res) => {
  const { category, limit = 20, page = 1 } = req.query;

  const query = { isActive: true };
  if (category) {
    query.category = category;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const lookbookItems = await Lookbook.find(query)
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .select("-__v");

  const total = await Lookbook.countDocuments(query);

  res.status(200).json({
    success: true,
    data: lookbookItems,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// @desc    Get lookbook item by ID
// @route   GET /api/lookbook/:id
// @access  Public
export const getLookbookItemById = asyncHandler(async (req, res) => {
  const lookbookItem = await Lookbook.findById(req.params.id).select("-__v");

  if (!lookbookItem) {
    return res.status(404).json({
      success: false,
      message: "Lookbook item not found",
    });
  }

  res.status(200).json({
    success: true,
    data: lookbookItem,
  });
});

// @desc    Get lookbook items by category
// @route   GET /api/lookbook/category/:category
// @access  Public
export const getLookbookByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { limit = 20, page = 1 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const lookbookItems = await Lookbook.find({
    category,
    isActive: true,
  })
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .select("-__v");

  const total = await Lookbook.countDocuments({
    category,
    isActive: true,
  });

  res.status(200).json({
    success: true,
    data: lookbookItems,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// @desc    Create new lookbook item (Admin only)
// @route   POST /api/lookbook
// @access  Private/Admin
export const createLookbookItem = asyncHandler(async (req, res) => {
  const lookbookData = {
    ...req.body,
    createdBy: req.user.id,
  };

  const lookbookItem = await Lookbook.create(lookbookData);

  res.status(201).json({
    success: true,
    message: "Lookbook item created successfully",
    data: lookbookItem,
  });
});

// @desc    Update lookbook item (Admin only)
// @route   PUT /api/lookbook/:id
// @access  Private/Admin
export const updateLookbookItem = asyncHandler(async (req, res) => {
  const lookbookItem = await Lookbook.findById(req.params.id);

  if (!lookbookItem) {
    return res.status(404).json({
      success: false,
      message: "Lookbook item not found",
    });
  }

  const updatedLookbookItem = await Lookbook.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      updatedBy: req.user.id,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Lookbook item updated successfully",
    data: updatedLookbookItem,
  });
});

// @desc    Delete lookbook item (Admin only)
// @route   DELETE /api/lookbook/:id
// @access  Private/Admin
export const deleteLookbookItem = asyncHandler(async (req, res) => {
  const lookbookItem = await Lookbook.findById(req.params.id);

  if (!lookbookItem) {
    return res.status(404).json({
      success: false,
      message: "Lookbook item not found",
    });
  }

  await Lookbook.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Lookbook item deleted successfully",
  });
});

// @desc    Toggle lookbook item status (Admin only)
// @route   PATCH /api/lookbook/:id/toggle
// @access  Private/Admin
export const toggleLookbookItemStatus = asyncHandler(async (req, res) => {
  const lookbookItem = await Lookbook.findById(req.params.id);

  if (!lookbookItem) {
    return res.status(404).json({
      success: false,
      message: "Lookbook item not found",
    });
  }

  lookbookItem.isActive = !lookbookItem.isActive;
  lookbookItem.updatedBy = req.user.id;
  await lookbookItem.save();

  res.status(200).json({
    success: true,
    message: `Lookbook item ${lookbookItem.isActive ? "activated" : "deactivated"} successfully`,
    data: lookbookItem,
  });
});

// @desc    Get lookbook categories
// @route   GET /api/lookbook/categories
// @access  Public
export const getLookbookCategories = asyncHandler(async (req, res) => {
  const categories = await Lookbook.distinct("category", { isActive: true });

  res.status(200).json({
    success: true,
    data: categories,
  });
});

// @desc    Search lookbook items
// @route   GET /api/lookbook/search
// @access  Public
export const searchLookbookItems = asyncHandler(async (req, res) => {
  const { q, limit = 20, page = 1 } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: "Search query is required",
    });
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const lookbookItems = await Lookbook.find({
    $text: { $search: q },
    isActive: true,
  })
    .sort({ score: { $meta: "textScore" }, sortOrder: 1 })
    .limit(parseInt(limit))
    .skip(skip)
    .select("-__v");

  const total = await Lookbook.countDocuments({
    $text: { $search: q },
    isActive: true,
  });

  res.status(200).json({
    success: true,
    data: lookbookItems,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});
