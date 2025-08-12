import mongoose from "mongoose";
import Review from "./models/Review.js";
import Product from "./models/Product.js";
import dotenv from "dotenv";

dotenv.config();

const testReviewLinking = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Test 1: Check if products have review IDs
    console.log("\n=== Test 1: Checking products with reviews ===");
    const productsWithReviews = await Product.find({
      reviews: { $exists: true, $ne: [] },
    });
    console.log(`Products with reviews: ${productsWithReviews.length}`);

    for (const product of productsWithReviews.slice(0, 3)) {
      // Show first 3
      console.log(`Product: ${product.name}`);
      console.log(`  Reviews count: ${product.reviews.length}`);
      console.log(`  Rating: ${product.rating}`);
      console.log(`  Review count field: ${product.reviewCount}`);
    }

    // Test 2: Verify review count consistency
    console.log("\n=== Test 2: Verifying review count consistency ===");
    for (const product of productsWithReviews.slice(0, 3)) {
      const actualReviews = await Review.countDocuments({
        product: product._id,
      });
      console.log(`Product: ${product.name}`);
      console.log(
        `  Reviews in Product.reviews array: ${product.reviews.length}`
      );
      console.log(`  Reviews in Review collection: ${actualReviews}`);
      console.log(`  Product.reviewCount field: ${product.reviewCount}`);

      if (
        product.reviews.length !== actualReviews ||
        product.reviewCount !== actualReviews
      ) {
        console.log(`  ⚠️  INCONSISTENCY DETECTED!`);
      } else {
        console.log(`  ✅ All counts match`);
      }
    }

    // Test 3: Test creating a new review
    console.log("\n=== Test 3: Testing new review creation ===");
    const testProduct = await Product.findOne({});
    if (testProduct) {
      console.log(`Testing with product: ${testProduct.name}`);
      console.log(`Initial reviews count: ${testProduct.reviews.length}`);

      // Create a test review
      const testReview = new Review({
        user: new mongoose.Types.ObjectId(), // Dummy user ID
        product: testProduct._id,
        rating: 5,
        comment: "Test review for linking verification",
      });

      await testReview.save();
      console.log(`Created test review: ${testReview._id}`);

      // Check if product was updated
      const updatedProduct = await Product.findById(testProduct._id);
      console.log(`Updated reviews count: ${updatedProduct.reviews.length}`);
      console.log(`Updated rating: ${updatedProduct.rating}`);

      // Clean up - delete the test review
      await Review.findByIdAndDelete(testReview._id);
      console.log(`Cleaned up test review`);

      // Verify cleanup
      const finalProduct = await Product.findById(testProduct._id);
      console.log(`Final reviews count: ${finalProduct.reviews.length}`);
    }

    // Test 4: Check for orphaned reviews
    console.log("\n=== Test 4: Checking for orphaned reviews ===");
    const allReviews = await Review.find({});
    let orphanedCount = 0;

    for (const review of allReviews) {
      const product = await Product.findById(review.product);
      if (!product) {
        orphanedCount++;
        console.log(
          `Orphaned review found: ${review._id} for product: ${review.product}`
        );
      } else if (!product.reviews.includes(review._id)) {
        orphanedCount++;
        console.log(
          `Review not in product.reviews array: ${review._id} for product: ${product.name}`
        );
      }
    }

    if (orphanedCount === 0) {
      console.log("✅ No orphaned reviews found");
    } else {
      console.log(`⚠️  Found ${orphanedCount} orphaned reviews`);
    }

    console.log("\n=== Test Summary ===");
    console.log("Review-Product linking verification completed!");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testReviewLinking();
}

export default testReviewLinking;
