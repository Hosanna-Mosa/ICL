import dotenv from "dotenv";
import connectDB from "./config/database.js";
import Lookbook from "./models/Lookbook.js";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

const testLookbook = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Connected to database");

    // Create a dummy user ID
    const dummyUserId = new mongoose.Types.ObjectId();

    // Sample lookbook data
    const lookbookData = [
      {
        title: "Urban Minimalist",
        description: "Oversized Hoodie + Cargo Pants",
        image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
        products: ["Hoodie", "Pants"],
        category: "Street Inspirations",
        tags: ["minimalist", "oversized", "cargo"],
        sortOrder: 1,
        createdBy: dummyUserId,
        isActive: true,
      },
      {
        title: "Street Comfort",
        description: "Essential Tee + Relaxed Fit",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
        products: ["T-Shirt", "Joggers"],
        category: "Street Inspirations",
        tags: ["comfort", "essential", "relaxed"],
        sortOrder: 2,
        createdBy: dummyUserId,
        isActive: true,
      },
      {
        title: "Weekend Vibes",
        description: "Layered Look with Accessories",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=600&fit=crop",
        products: ["Hoodie", "Cap"],
        category: "Street Inspirations",
        tags: ["weekend", "layered", "accessories"],
        sortOrder: 3,
        createdBy: dummyUserId,
        isActive: true,
      },
      {
        title: "Downtown Ready",
        description: "Clean Streetwear Essentials",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
        products: ["Jacket", "Tee"],
        category: "Urban Fits",
        tags: ["downtown", "clean", "essentials"],
        sortOrder: 4,
        createdBy: dummyUserId,
        isActive: true,
      },
      {
        title: "Night Session",
        description: "Dark Tones with Statement Pieces",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop",
        products: ["Hoodie", "Pants"],
        category: "Urban Fits",
        tags: ["night", "dark", "statement"],
        sortOrder: 5,
        createdBy: dummyUserId,
        isActive: true,
      },
      {
        title: "Classic Edge",
        description: "Timeless Street Style",
        image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=600&fit=crop",
        products: ["Tee", "Jeans"],
        category: "Urban Fits",
        tags: ["classic", "timeless", "edge"],
        sortOrder: 6,
        createdBy: dummyUserId,
        isActive: true,
      },
      {
        title: "Summer Vibes",
        description: "Light and Breathable Streetwear",
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop",
        products: ["T-Shirt", "Shorts"],
        category: "Seasonal",
        tags: ["summer", "light", "breathable"],
        sortOrder: 7,
        createdBy: dummyUserId,
        isActive: true,
      },
      {
        title: "Winter Warmth",
        description: "Cozy Layers for Cold Days",
        image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop",
        products: ["Hoodie", "Jacket"],
        category: "Seasonal",
        tags: ["winter", "cozy", "layers"],
        sortOrder: 8,
        createdBy: dummyUserId,
        isActive: true,
      },
    ];

    console.log("Clearing existing lookbook data...");
    await Lookbook.deleteMany({});
    console.log("Cleared existing lookbook data");

    console.log("Inserting lookbook data...");
    const result = await Lookbook.insertMany(lookbookData);
    console.log(`Inserted ${result.length} lookbook items`);

    // Test the API by fetching data
    console.log("\nTesting API endpoints...");
    
    // Test getting all items
    const allItems = await Lookbook.find({ isActive: true }).sort({ sortOrder: 1 });
    console.log(`Found ${allItems.length} active lookbook items`);

    // Test getting by category
    const streetItems = await Lookbook.find({ 
      category: "Street Inspirations", 
      isActive: true 
    }).sort({ sortOrder: 1 });
    console.log(`Found ${streetItems.length} Street Inspirations items`);

    const urbanItems = await Lookbook.find({ 
      category: "Urban Fits", 
      isActive: true 
    }).sort({ sortOrder: 1 });
    console.log(`Found ${urbanItems.length} Urban Fits items`);

    const seasonalItems = await Lookbook.find({ 
      category: "Seasonal", 
      isActive: true 
    }).sort({ sortOrder: 1 });
    console.log(`Found ${seasonalItems.length} Seasonal items`);

    console.log("\nLookbook data successfully inserted and tested!");
    console.log("You can now test the frontend lookbook page.");

    process.exit(0);
  } catch (error) {
    console.error("Error testing lookbook:", error);
    process.exit(1);
  }
};

testLookbook();
