import mongoose from "mongoose";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import dotenv from "dotenv";

dotenv.config();

const migrateReviewsToProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      "mongodb+srv://sunandvemavarapu:BSNtIgEdLwdYhyc3@cluster0.xvohdml.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("Connected to MongoDB");

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate`);

    let updatedCount = 0;

    for (const product of products) {
      // Find all reviews for this product
      const reviews = await Review.find({ product: product._id });

      if (reviews.length > 0) {
        // Update product with review IDs
        product.reviews = reviews.map((review) => review._id);

        // Calculate average rating
        const totalRating = reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        const averageRating = totalRating / reviews.length;

        product.rating = Math.round(averageRating * 10) / 10;
        product.reviewCount = reviews.length;

        await product.save();
        updatedCount++;

        console.log(
          `Updated product ${product.name} with ${reviews.length} reviews`
        );
      }
    }

    console.log(`Migration completed! Updated ${updatedCount} products`);

    // Verify the migration
    const totalReviews = await Review.countDocuments({});
    const totalProductReviews = await Product.aggregate([
      { $group: { _id: null, totalReviews: { $sum: "$reviewCount" } } },
    ]);

    console.log(`Total reviews in Review collection: ${totalReviews}`);
    console.log(
      `Total reviews in Product collection: ${
        totalProductReviews[0]?.totalReviews || 0
      }`
    );
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateReviewsToProducts();
}

export default migrateReviewsToProducts;
