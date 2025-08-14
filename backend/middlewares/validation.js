import { body, param, query, validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errorMessages,
    });
  }
  next();
};

// User registration validation
export const validateRegister = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("phone")
    .optional({ nullable: true, checkFalsy: false })
    .trim()
    .custom((value) => {
      if (value && value !== '') {
        if (!/^[0-9]{10}$/.test(value)) {
          throw new Error("Please provide a valid 10-digit phone number");
        }
      }
      return true;
    }),
  validate,
];

// User login validation
export const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

// Product creation/update validation
export const validateProduct = [
  body("name")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Product name must be between 3 and 100 characters"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("category")
    .isIn(["hoodies", "tshirts", "pants", "shorts", "jackets", "accessories"])
    .withMessage("Invalid category"),
  body("basePrice")
    .isFloat({ min: 0 })
    .withMessage("Base price must be a positive number"),
  body("salePrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Sale price must be a positive number"),
  body("images")
    .isArray({ min: 1 })
    .withMessage("At least one image is required"),
  body("images.*.url").isURL().withMessage("Image URL must be valid"),
  body("sizes")
    .isArray({ min: 1 })
    .withMessage("At least one size is required"),
  body("sizes.*.size")
    .isIn(["XS", "S", "M", "L", "XL", "XXL", "XXXL"])
    .withMessage("Invalid size"),
  body("sizes.*.stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("sizes.*.price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("brand")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Brand must be between 1 and 50 characters"),
  body("subcategory")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Subcategory must be between 1 and 50 characters"),
  body("coinsEarned")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Coins earned must be a non-negative number"),
  body("coinsRequired")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Coins required must be a non-negative number"),
  body("fabric")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Fabric must be between 1 and 100 characters"),
  body("gsm")
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("GSM must be between 1 and 20 characters"),
  body("fit")
    .optional()
    .isIn(["regular", "oversized", "slim", "relaxed"])
    .withMessage("Invalid fit"),
  body("washCare")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Wash care must be between 1 and 200 characters"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Each tag must be between 1 and 30 characters"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean"),
  validate,
];

// Cart item validation
export const validateCartItem = [
  body("productId").isMongoId().withMessage("Invalid product ID"),
  body("size")
    .isIn(["XS", "S", "M", "L", "XL", "XXL", "XXXL"])
    .withMessage("Invalid size"),
  body("quantity")
    .isInt({ min: 1, max: 10 })
    .withMessage("Quantity must be between 1 and 10"),
  validate,
];

// Cart item update validation (productId comes from route param, quantity can be 0 to remove)
export const validateCartItemUpdate = [
  param("productId").isMongoId().withMessage("Invalid product ID"),
  body("size")
    .isIn(["XS", "S", "M", "L", "XL", "XXL", "XXXL"])
    .withMessage("Invalid size"),
  body("quantity")
    .isInt({ min: 0, max: 10 })
    .withMessage("Quantity must be between 0 and 10"),
  validate,
];

// Order validation
export const validateOrder = [
  body("shippingAddress.firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("shippingAddress.lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("shippingAddress.phone")
    .matches(/^[0-9]{10}$/)
    .withMessage("Please provide a valid 10-digit phone number"),
  body("shippingAddress.street")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Street address must be between 5 and 200 characters"),
  body("shippingAddress.city")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),
  body("shippingAddress.state")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be between 2 and 50 characters"),
  body("shippingAddress.zipCode")
    .matches(/^[0-9]{6}$/)
    .withMessage("Please provide a valid 6-digit zip code"),
  body("payment.method")
    .isIn(["cod", "upi", "card", "wallet"])
    .withMessage("Invalid payment method"),
  validate,
];

// Pagination validation
export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage("Limit must be between 1 and 1000"),
  validate,
];

// Product search validation
export const validateProductSearch = [
  query("category")
    .optional()
    .isIn(["hoodies", "tshirts", "pants", "shorts", "jackets", "accessories"])
    .withMessage("Invalid category"),
  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be a positive number"),
  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be a positive number"),
  query("sort")
    .optional()
    .isIn(["price_asc", "price_desc", "newest", "rating", "popularity"])
    .withMessage("Invalid sort option"),
  validate,
];

// ID parameter validation
export const validateId = [
  param("id")
    .notEmpty()
    .withMessage("ID is required")
    .custom((value) => {
      // Accept MongoDB ObjectIds (24 hex chars) or simple numeric strings
      const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
      const numericRegex = /^[0-9]+$/;

      if (mongoIdRegex.test(value) || numericRegex.test(value)) {
        return true;
      }
      throw new Error(
        "Invalid ID format - must be MongoDB ObjectId or numeric ID"
      );
    }),
  validate,
];

// ProductId parameter validation for routes using :productId
export const validateProductIdParam = [
  param("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .custom((value) => {
      const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
      const numericRegex = /^[0-9]+$/;
      if (mongoIdRegex.test(value) || numericRegex.test(value)) {
        return true;
      }
      throw new Error(
        "Invalid product ID format - must be MongoDB ObjectId or numeric ID"
      );
    }),
  validate,
];

// ReviewId parameter validation for routes using :reviewId
export const validateReviewIdParam = [
  param("reviewId")
    .notEmpty()
    .withMessage("Review ID is required")
    .custom((value) => {
      const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
      const numericRegex = /^[0-9]+$/;
      if (mongoIdRegex.test(value) || numericRegex.test(value)) {
        return true;
      }
      throw new Error(
        "Invalid review ID format - must be MongoDB ObjectId or numeric ID"
      );
    }),
  validate,
];

// Coins validation
export const validateCoins = [
  body("amount")
    .isInt({ min: 1 })
    .withMessage("Amount must be a positive integer"),
  validate,
];

// Lookbook validation
export const validateLookbook = [
  body("title")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Title must be between 2 and 100 characters"),
  body("description")
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage("Description must be between 5 and 500 characters"),
  body("image")
    .isURL()
    .withMessage("Image must be a valid URL"),
  body("products")
    .isArray({ min: 1 })
    .withMessage("At least one product is required"),
  body("products.*")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Product name must be between 1 and 50 characters"),
  body("category")
    .isIn(["Street Inspirations", "Urban Fits", "Seasonal", "Featured"])
    .withMessage("Invalid category"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array"),
  body("tags.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Tag must be between 1 and 30 characters"),
  validate,
];
