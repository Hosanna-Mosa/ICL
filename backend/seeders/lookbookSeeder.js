import Lookbook from "../models/Lookbook.js";
import User from "../models/User.js";

const lookbookData = [
  {
    title: "Urban Minimalist",
    description: "Oversized Hoodie + Cargo Pants",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
    products: ["Hoodie", "Pants"],
    category: "Street Inspirations",
    tags: ["minimalist", "oversized", "cargo"],
    sortOrder: 1,
  },
  {
    title: "Street Comfort",
    description: "Essential Tee + Relaxed Fit",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
    products: ["T-Shirt", "Joggers"],
    category: "Street Inspirations",
    tags: ["comfort", "essential", "relaxed"],
    sortOrder: 2,
  },
  {
    title: "Weekend Vibes",
    description: "Layered Look with Accessories",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=600&fit=crop",
    products: ["Hoodie", "Cap"],
    category: "Street Inspirations",
    tags: ["weekend", "layered", "accessories"],
    sortOrder: 3,
  },
  {
    title: "Downtown Ready",
    description: "Clean Streetwear Essentials",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
    products: ["Jacket", "Tee"],
    category: "Urban Fits",
    tags: ["downtown", "clean", "essentials"],
    sortOrder: 4,
  },
  {
    title: "Night Session",
    description: "Dark Tones with Statement Pieces",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop",
    products: ["Hoodie", "Pants"],
    category: "Urban Fits",
    tags: ["night", "dark", "statement"],
    sortOrder: 5,
  },
  {
    title: "Classic Edge",
    description: "Timeless Street Style",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=600&fit=crop",
    products: ["Tee", "Jeans"],
    category: "Urban Fits",
    tags: ["classic", "timeless", "edge"],
    sortOrder: 6,
  },
  {
    title: "Summer Vibes",
    description: "Light and Breathable Streetwear",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop",
    products: ["T-Shirt", "Shorts"],
    category: "Seasonal",
    tags: ["summer", "light", "breathable"],
    sortOrder: 7,
  },
  {
    title: "Winter Warmth",
    description: "Cozy Layers for Cold Days",
    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
    products: ["Hoodie", "Jacket"],
    category: "Seasonal",
    tags: ["winter", "cozy", "layers"],
    sortOrder: 8,
  },
];

export const seedLookbook = async () => {
  try {
    console.log("Starting lookbook seeding...");
    
    // Get admin user for createdBy field
    const adminUser = await User.findOne({ role: "admin" });
    
    if (!adminUser) {
      console.log("No admin user found. Creating lookbook items without createdBy field...");
      // Create a dummy ObjectId for createdBy field
      const dummyUserId = new (await import("mongoose")).Types.ObjectId();
      
      // Clear existing lookbook data
      await Lookbook.deleteMany({});
      console.log("Cleared existing lookbook data");

      // Add createdBy field to all lookbook items
      const lookbookItemsWithUser = lookbookData.map(item => ({
        ...item,
        createdBy: dummyUserId,
      }));

      // Insert new lookbook data
      const result = await Lookbook.insertMany(lookbookItemsWithUser);
      console.log(`Seeded ${result.length} lookbook items`);

      return result;
    }

    // Clear existing lookbook data
    await Lookbook.deleteMany({});
    console.log("Cleared existing lookbook data");

    // Add createdBy field to all lookbook items
    const lookbookItemsWithUser = lookbookData.map(item => ({
      ...item,
      createdBy: adminUser._id,
    }));

    // Insert new lookbook data
    const result = await Lookbook.insertMany(lookbookItemsWithUser);
    console.log(`Seeded ${result.length} lookbook items`);

    return result;
  } catch (error) {
    console.error("Error seeding lookbook data:", error);
    throw error;
  }
};

export default seedLookbook;
