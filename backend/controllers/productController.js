import Product from "../models/Product.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    minPrice,
    maxPrice,
    sort = "newest",
    search,
    featured,
  } = req.query;

  // Build query
  const query = { isActive: true };

  if (category) {
    query.category = category;
  }

  if (featured === "true") {
    query.isFeatured = true;
  }

  if (minPrice || maxPrice) {
    query.basePrice = {};
    if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
    if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
  }

  if (search) {
    query.$text = { $search: search };
  }

  // Build sort
  let sortOption = {};
  switch (sort) {
    case "price_asc":
      sortOption = { basePrice: 1 };
      break;
    case "price_desc":
      sortOption = { basePrice: -1 };
      break;
    case "rating":
      sortOption = { rating: -1 };
      break;
    case "popularity":
      sortOption = { totalSold: -1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  // Execute query
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("category"),
    Product.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  console.log("Products fetched", {
    count: products.length,
    total,
    page: parseInt(page),
    filters: { category, minPrice, maxPrice, sort, search, featured },
  });

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    },
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  if (!product.isActive) {
    return res.status(404).json({
      success: false,
      message: "Product not available",
    });
  }

  console.log("Product fetched", {
    productId: product._id,
    name: product.name,
  });

  res.json({
    success: true,
    data: { product },
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;

  // Generate SKU if not provided
  if (!productData.sku) {
    productData.sku = Product.generateSKU(
      productData.category,
      productData.name
    );
  }

  const product = await Product.create(productData);

  console.log("Product created", {
    productId: product._id,
    name: product.name,
    adminId: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: { product },
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // Update product
  Object.keys(req.body).forEach((key) => {
    product[key] = req.body[key];
  });

  await product.save();

  console.log("Product updated", {
    productId: product._id,
    name: product.name,
    adminId: req.user.id,
  });

  res.json({
    success: true,
    message: "Product updated successfully",
    data: { product },
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // Soft delete by setting isActive to false
  product.isActive = false;
  await product.save();

  console.log("Product deleted", {
    productId: product._id,
    name: product.name,
    adminId: req.user.id,
  });

  res.json({
    success: true,
    message: "Product deleted successfully",
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;

  const products = await Product.find({
    isActive: true,
    isFeatured: true,
  })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  console.log("Featured products fetched", { count: products.length });

  res.json({
    success: true,
    data: { products },
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 12, sort = "newest" } = req.query;

  // Build sort
  let sortOption = {};
  switch (sort) {
    case "price_asc":
      sortOption = { basePrice: 1 };
      break;
    case "price_desc":
      sortOption = { basePrice: -1 };
      break;
    case "rating":
      sortOption = { rating: -1 };
      break;
    case "popularity":
      sortOption = { totalSold: -1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [products, total] = await Promise.all([
    Product.find({
      category,
      isActive: true,
    })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit)),
    Product.countDocuments({ category, isActive: true }),
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  console.log("Products by category fetched", {
    category,
    count: products.length,
    total,
  });

  res.json({
    success: true,
    data: {
      products,
      category,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    },
  });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 12 } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: "Search query is required",
    });
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [products, total] = await Promise.all([
    Product.find({
      $text: { $search: q },
      isActive: true,
    })
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(parseInt(limit)),
    Product.countDocuments({
      $text: { $search: q },
      isActive: true,
    }),
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  console.log("Products searched", {
    query: q,
    count: products.length,
    total,
  });

  res.json({
    success: true,
    data: {
      products,
      searchQuery: q,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    },
  });
});
