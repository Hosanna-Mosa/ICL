import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb+srv://sunandvemavarapu:BSNtIgEdLwdYhyc3@cluster0.xvohdml.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log(`Database connected: ${conn.connection.host}`);
    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.log("Database connection error:", err);
    });
    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("Database connection closed");
      process.exit(0);
    });
  } catch (error) {
    console.log("Database connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
