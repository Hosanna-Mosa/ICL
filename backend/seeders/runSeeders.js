import dotenv from "dotenv";
import connectDB from "../config/database.js";
import seedUsers from "./userSeeder.js";
import seedProducts from "./productSeeder.js";
import logger from "../utils/logger.js";

// Load environment variables
dotenv.config();

const runSeeders = async () => {
  try {
    logger.info("Starting database seeding...");

    // Connect to database
    await connectDB();
    logger.info("Connected to database");

    // Run seeders
    logger.info("Seeding users...");
    const users = await seedUsers();
    logger.info(`Seeded ${users.length} users`);

    logger.info("Seeding products...");
    const products = await seedProducts();
    logger.info(`Seeded ${products.length} products`);

    logger.info("Database seeding completed successfully!");
    logger.info("Sample admin credentials:");
    logger.info("Email: admin@icl.com");
    logger.info("Password: admin123");

    process.exit(0);
  } catch (error) {
    logger.error("Error running seeders:", error);
    process.exit(1);
  }
};

// Run seeders if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeeders();
}

export default runSeeders;
