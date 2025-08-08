import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb+srv://sunandvemavarapu:BSNtIgEdLwdYhyc3@cluster0.xvohdml.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );

    logger.info(`Database connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      logger.error("Database connection error:", err);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("Database connection closed");
      process.exit(0);
    });
  } catch (error) {
    logger.error("Database connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
