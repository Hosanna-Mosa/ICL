import mongoose from 'mongoose';
import Product from '../models/Product.js';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/icl_streetwear';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const products = [
  {
    name: "Premium Oversized Hoodie",
    description:
      "Crafted from premium 100% cotton fleece with an oversized silhouette. Features a kangaroo pocket, ribbed cuffs, and our signature embroidered logo. Perfect for layering or wearing solo for that effortless streetwear aesthetic.",
    category: "hoodies",
    subcategory: "oversized",
    brand: "BRELIS",
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
    isNewProduct: true,
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
    brand: "BRELIS",
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
    isNewProduct: true,
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
    brand: "BRELIS",
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
    fit: "regular",
    washCare: "Machine wash cold, Do not bleach, Tumble dry low",
    tags: ["cargo", "pants", "urban", "streetwear"],
    isActive: true,
    isFeatured: true,
    isNewProduct: false,
    rating: 4.7,
    reviewCount: 67,
    totalSold: 43,
  },
  {
    name: "Streetwear Bomber Jacket",
    description:
      "A modern take on the classic bomber jacket. Features a lightweight construction, ribbed collar and cuffs, and our signature embroidered logo. Perfect for layering in cooler weather.",
    category: "jackets",
    subcategory: "bomber",
    brand: "BRELIS",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800",
        alt: "Streetwear Bomber Jacket",
        isPrimary: true,
      },
    ],
    sizes: [
      { size: "S", stock: 8, price: 5999 },
      { size: "M", stock: 12, price: 5999 },
      { size: "L", stock: 10, price: 5999 },
      { size: "XL", stock: 6, price: 5999 },
      { size: "XXL", stock: 4, price: 5999 },
    ],
    basePrice: 5999,
    salePrice: 5499,
    coinsEarned: 55,
    fabric: "Polyester Blend",
    gsm: "320 GSM",
    fit: "regular",
    washCare: "Machine wash cold, Do not bleach, Tumble dry low",
    tags: ["bomber", "jacket", "streetwear", "layering"],
    isActive: true,
    isFeatured: true,
    isNewProduct: true,
    rating: 4.9,
    reviewCount: 34,
    totalSold: 28,
  },
  {
    name: "Minimalist Crew Neck",
    description:
      "A clean and simple crew neck sweater made from premium cotton. Features a comfortable fit and our subtle logo embroidery. Perfect for everyday wear and layering.",
    category: "sweaters",
    subcategory: "crewneck",
    brand: "BRELIS",
    images: [
      {
        url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800",
        alt: "Minimalist Crew Neck",
        isPrimary: true,
      },
    ],
    sizes: [
      { size: "S", stock: 20, price: 2499 },
      { size: "M", stock: 25, price: 2499 },
      { size: "L", stock: 22, price: 2499 },
      { size: "XL", stock: 15, price: 2499 },
      { size: "XXL", stock: 10, price: 2499 },
    ],
    basePrice: 2499,
    salePrice: 2199,
    coinsEarned: 25,
    fabric: "100% Cotton",
    gsm: "250 GSM",
    fit: "regular",
    washCare: "Machine wash cold, Do not bleach, Tumble dry low",
    tags: ["crewneck", "sweater", "minimalist", "cotton"],
    isActive: true,
    isFeatured: false,
    isNewProduct: false,
    rating: 4.5,
    reviewCount: 78,
    totalSold: 112,
  },
  {
    name: "Urban Track Pants",
    description:
      "Comfortable track pants with a modern streetwear aesthetic. Features an elastic waistband, side pockets, and our embroidered logo. Perfect for both athletic and casual wear.",
    category: "pants",
    subcategory: "track",
    brand: "BRELIS",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800",
        alt: "Urban Track Pants",
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
    salePrice: 2499,
    coinsEarned: 28,
    fabric: "Cotton Blend",
    gsm: "240 GSM",
    fit: "regular",
    washCare: "Machine wash cold, Do not bleach, Tumble dry low",
    tags: ["track", "pants", "urban", "athletic"],
    isActive: true,
    isFeatured: false,
    isNewProduct: true,
    rating: 4.6,
    reviewCount: 45,
    totalSold: 67,
  },
  {
    name: "Streetwear Denim Jacket",
    description:
      "A classic denim jacket with a streetwear twist. Features distressed detailing, our embroidered logo, and a comfortable fit. Perfect for layering and adding edge to any outfit.",
    category: "jackets",
    subcategory: "denim",
    brand: "BRELIS",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800",
        alt: "Streetwear Denim Jacket",
        isPrimary: true,
      },
    ],
    sizes: [
      { size: "S", stock: 10, price: 4499 },
      { size: "M", stock: 15, price: 4499 },
      { size: "L", stock: 12, price: 4499 },
      { size: "XL", stock: 8, price: 4499 },
      { size: "XXL", stock: 5, price: 4499 },
    ],
    basePrice: 4499,
    salePrice: 3999,
    coinsEarned: 40,
    fabric: "100% Denim",
    gsm: "12 oz",
    fit: "regular",
    washCare: "Machine wash cold, Do not bleach, Tumble dry low",
    tags: ["denim", "jacket", "streetwear", "distressed"],
    isActive: true,
    isFeatured: true,
    isNewProduct: false,
    rating: 4.8,
    reviewCount: 56,
    totalSold: 89,
  },
  {
    name: "Premium Zip Hoodie",
    description:
      "A premium zip-up hoodie with a modern fit. Features a full-zip front, kangaroo pocket, and our embroidered logo. Perfect for layering or wearing as a standalone piece.",
    category: "hoodies",
    subcategory: "zip",
    brand: "BRELIS",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
        alt: "Premium Zip Hoodie",
        isPrimary: true,
      },
    ],
    sizes: [
      { size: "S", stock: 12, price: 3999 },
      { size: "M", stock: 18, price: 3999 },
      { size: "L", stock: 15, price: 3999 },
      { size: "XL", stock: 10, price: 3999 },
      { size: "XXL", stock: 6, price: 3999 },
    ],
    basePrice: 3999,
    salePrice: 3599,
    coinsEarned: 36,
    fabric: "100% Cotton Fleece",
    gsm: "320 GSM",
    fit: "regular",
    washCare: "Machine wash cold, Do not bleach, Tumble dry low",
    tags: ["zip", "hoodie", "premium", "cotton"],
    isActive: true,
    isFeatured: false,
    isNewProduct: true,
    rating: 4.7,
    reviewCount: 34,
    totalSold: 45,
  },
];

const seedProducts = async () => {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Insert new products
    const result = await Product.insertMany(products);
    console.log(`Seeded ${result.length} products successfully`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

// Run seeder
seedProducts();
