import dotenv from "dotenv";
import connectDB from "./src/config/database.js";
import logger from "./src/utils/logger.js";

// Load environment variables
dotenv.config();

const testSetup = async () => {
  try {
    logger.info("Testing backend setup...");

    // Test database connection
    logger.info("Testing database connection...");
    await connectDB();
    logger.info("✅ Database connection successful");

    // Test logger
    logger.info("✅ Logger working correctly");
    logger.warn("✅ Warning level working");
    logger.error("✅ Error level working");

    logger.info("🎉 Backend setup test completed successfully!");
    logger.info("You can now start the server with: npm run dev");

    process.exit(0);
  } catch (error) {
    logger.error("❌ Backend setup test failed:", error);
    process.exit(1);
  }
};

testSetup();
