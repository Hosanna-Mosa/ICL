import Product from "../models/Product.js";

const products = [
  {
    name: "Premium Oversized Hoodie",
    description:
      "Crafted from premium 100% cotton fleece with an oversized silhouette. Features a kangaroo pocket, ribbed cuffs, and our signature embroidered logo. Perfect for layering or wearing solo for that effortless streetwear aesthetic.",
    category: "hoodies",
    subcategory: "oversized",
    brand: "ICL",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
        alt: "Premium Oversized Hoodie",
        isPrimary: true,
      },
      {
        url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
        alt: "Premium Oversized Hoodie Back",
      },
    ],
    sizes: [
      { size: "S", stock: 15, price: 4499 },
      { size: "M", stock: 20, price: 4499 },
      { size: "L", stock: 18, price: 4499 },
      { size: "XL", stock: 12, price: 4499 },
      { size: "XXL", stock: 8, price: 4499 },
    ],
    basePrice: 4499,
    salePrice: 3999,
    coinsEarned: 45,
    fabric: "100% Cotton Fleece",
    gsm: "350 GSM",
    fit: "oversized",
    washCare: "Machine wash cold, Do not bleach, Tumble dry low",
    tags: ["oversized", "hoodie", "premium", "cotton"],
    isActive: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 127,
    totalSold: 89,
  },
  {
    name: "Classic Oversized Tee",
    description:
      "A timeless oversized t-shirt made from premium cotton. Features a relaxed fit, dropped shoulders, and our minimalist logo print. Perfect for everyday wear and streetwear styling.",
    category: "tshirts",
    subcategory: "oversized",
    brand: "ICL",
    images: [
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
        alt: "Classic Oversized Tee",
        isPrimary: true,
      },
    ],
    sizes: [
      { size: "S", stock: 25, price: 1899 },
      { size: "M", stock: 30, price: 1899 },
      { size: "L", stock: 28, price: 1899 },
      { size: "XL", stock: 20, price: 1899 },
      { size: "XXL", stock: 15, price: 1899 },
    ],
    basePrice: 1899,
    coinsEarned: 19,
    fabric: "100% Cotton",
    gsm: "180 GSM",
    fit: "oversized",
    washCare: "Machine wash cold, Do not bleach, Tumble dry low",
    tags: ["oversized", "tee", "classic", "cotton"],
    isActive: true,
    isFeatured: true,
    rating: 4.6,
    reviewCount: 89,
    totalSold: 156,
  },
  {
    name: "Urban Cargo Pants",
    description:
      "Streetwear-inspired cargo pants with multiple pockets and a relaxed fit. Made from durable cotton twill with a comfortable elastic waistband. Perfect for both casual and streetwear looks.",
    category: "pants",
    subcategory: "cargo",
    brand: "ICL",
    images: [
      {
        url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
        alt: "Urban Cargo Pants",
        isPrimary: true,
      },
    ],
    sizes: [
      { size: "S", stock: 12, price: 3299 },
      { size: "M", stock: 18, price: 3299 },
      { size: "L", stock: 15, price: 3299 },
      { size: "XL", stock: 10, price: 3299 },
      { size: "XXL", stock: 6, price: 3299 },
    ],
    basePrice: 3299,
    salePrice: 2999,
    coinsEarned: 33,
    fabric: "100% Cotton Twill",
    gsm: "280 GSM",
    fit: "relaxed",
    washCare: "Machine wash cold, Do not bleach, Tumble dry low",
    tags: ["cargo", "pants", "urban", "streetwear"],
    isActive: true,
    isFeatured: false,
    rating: 4.7,
    reviewCount: 67,
    totalSold: 43,
  },
  {
    name: "Street Essential Hoodie",
    description:
      "A versatile hoodie designed for everyday streetwear. Features a classic fit, kangaroo pocket, and our embroidered logo. Made from soft cotton fleece for maximum comfort.",
    category: "hoodies",
    subcategory: "essential",
    brand: "ICL",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
        alt: "Street Essential Hoodie",
        isPrimary: true,
      },
    ],
    sizes: [
      { size: "S", stock: 20, price: 4199 },
      { size: "M", stock: 25, price: 4199 },
      { size: "L", stock: 22, price: 4199 },
      { size: "XL", stock: 18, price: 4199 },
      { size: "XXL", stock: 12, price: 4199 },
    ],
    basePrice: 4199,
    coinsEarned: 42,
    fabric: "100% Cotton Fleece",
    gsm: "320 GSM",
    fit: "regular",
    washCare: "Machine wash cold, Do not bleach, Tumble dry low",
    tags: ["hoodie", "essential", "streetwear", "cotton"],
    isActive: true,
    isFeatured: false,
    rating: 4.5,
    reviewCount: 94,
    totalSold: 78,
  },
  {
    name: "Minimalist Crew Neck",
    description:
      "A clean and minimal crew neck sweater perfect for layering. Made from premium cotton with a comfortable fit and subtle branding. Ideal for both casual and streetwear styling.",
    category: "tshirts",
    subcategory: "crew",
    brand: "ICL",
    images: [
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
        alt: "Minimalist Crew Neck",
        isPrimary: true,
      },
    ],
    sizes: [
      { size: "S", stock: 30, price: 1599 },
      { size: "M", stock: 35, price: 1599 },
      { size: "L", stock: 32, price: 1599 },
      { size: "XL", stock: 25, price: 1599 },
      { size: "XXL", stock: 18, price: 1599 },
    ],
    basePrice: 1599,
    salePrice: 1299,
    coinsEarned: 16,
    fabric: "100% Cotton",
    gsm: "200 GSM",
    fit: "regular",
    washCare: "Machine wash cold, Do not bleach, Tumble dry low",
    tags: ["crew", "minimalist", "cotton", "layering"],
    isActive: true,
    isFeatured: false,
    rating: 4.4,
    reviewCount: 56,
    totalSold: 112,
  },
  {
    name: "Athletic Joggers",
    description:
      "Comfortable athletic joggers perfect for both workout and streetwear. Features an elastic waistband, side pockets, and tapered fit. Made from breathable cotton blend.",
    category: "pants",
    subcategory: "joggers",
    brand: "ICL",
    images: [
      {
        url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
        alt: "Athletic Joggers",
        isPrimary: true,
      },
    ],
    sizes: [
      { size: "S", stock: 15, price: 2799 },
      { size: "M", stock: 20, price: 2799 },
      { size: "L", stock: 18, price: 2799 },
      { size: "XL", stock: 12, price: 2799 },
      { size: "XXL", stock: 8, price: 2799 },
    ],
    basePrice: 2799,
    coinsEarned: 28,
    fabric: "95% Cotton, 5% Elastane",
    gsm: "240 GSM",
    fit: "tapered",
    washCare: "Machine wash cold, Do not bleach, Tumble dry low",
    tags: ["joggers", "athletic", "comfortable", "streetwear"],
    isActive: true,
    isFeatured: false,
    rating: 4.6,
    reviewCount: 73,
    totalSold: 65,
  },
  {
    name: "Denim Jacket",
    description:
      "A classic denim jacket with a modern streetwear twist. Features distressed detailing, comfortable fit, and our embroidered logo. Perfect for layering over any outfit.",
    category: "jackets",
    subcategory: "denim",
    brand: "ICL",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544022613-e87ca540a84a?w=800",
        alt: "Denim Jacket",
        isPrimary: true,
      },
    ],
    sizes: [
      { size: "S", stock: 10, price: 5499 },
      { size: "M", stock: 15, price: 5499 },
      { size: "L", stock: 12, price: 5499 },
      { size: "XL", stock: 8, price: 5499 },
      { size: "XXL", stock: 5, price: 5499 },
    ],
    basePrice: 5499,
    salePrice: 4799,
    coinsEarned: 55,
    fabric: "100% Denim",
    gsm: "12 oz",
    fit: "regular",
    washCare: "Machine wash cold, Do not bleach, Tumble dry low",
    tags: ["denim", "jacket", "distressed", "layering"],
    isActive: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 45,
    totalSold: 32,
  },
  {
    name: "Bucket Hat",
    description:
      "A stylish bucket hat perfect for streetwear styling. Made from premium cotton with embroidered logo. Available in multiple colors and perfect for completing any outfit.",
    category: "accessories",
    subcategory: "hats",
    brand: "ICL",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556306535-38febf6782e7?w=800",
        alt: "Bucket Hat",
        isPrimary: true,
      },
    ],
    sizes: [
      { size: "S", stock: 25, price: 899 },
      { size: "M", stock: 30, price: 899 },
      { size: "L", stock: 20, price: 899 },
    ],
    basePrice: 899,
    coinsEarned: 9,
    fabric: "100% Cotton",
    gsm: "200 GSM",
    fit: "regular",
    washCare: "Hand wash cold, Do not bleach, Air dry",
    tags: ["bucket", "hat", "accessory", "streetwear"],
    isActive: true,
    isFeatured: false,
    rating: 4.3,
    reviewCount: 28,
    totalSold: 45,
  },
];

export const seedProducts = async () => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Create products
    const createdProducts = await Product.create(products);
    console.log(`Created ${createdProducts.length} products`);

    return createdProducts;
  } catch (error) {
    console.log("Error seeding products:", error);
    throw error;
  }
};

export default seedProducts;
