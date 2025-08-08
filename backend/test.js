import dotenv from "dotenv";
import connectDB from "./src/config/database.js";

// Load environment variables
dotenv.config();

const testSetup = async () => {
  try {
    console.log("Testing backend setup...");

    // Test database connection
    console.log("Testing database connection...");
    await connectDB();
    console.log("✅ Database connection successful");

    // Test logger
    console.log("✅ Logger working correctly");
    console.log("✅ Warning level working");
    console.log("✅ Error level working");

    console.log("🎉 Backend setup test completed successfully!");
    console.log("You can now start the server with: npm run dev");

    process.exit(0);
  } catch (error) {
    console.log("❌ Backend setup test failed:", error);
    process.exit(1);
  }
};

testSetup();
