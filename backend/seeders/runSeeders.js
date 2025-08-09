import dotenv from "dotenv";
import connectDB from "../config/database.js";
import seedUsers from "./userSeeder.js";
import seedAdmin from "./adminSeeder.js";
import seedProducts from "./productSeeder.js";

// Load environment variables
dotenv.config();

const runSeeders = async () => {
  try {
    console.log("Starting database seeding...");

    // Connect to database
    await connectDB();
    console.log("Connected to database");

    // Run seeders
    console.log("Seeding admin user...");
    const admin = await seedAdmin();
    console.log(`Admin ready: ${admin.email}`);

    console.log("Seeding users...");
    const users = await seedUsers();
    console.log(`Seeded ${users.length} users`);

    console.log("Seeding products...");
    const products = await seedProducts();
    console.log(`Seeded ${products.length} products`);

    console.log("Database seeding completed successfully!");
    console.log("Sample admin credentials:");
    console.log(
      `Email: ${process.env.ADMIN_EMAIL || "admin@iclstreetwear.com"}`
    );
    console.log(`Password: ${process.env.ADMIN_PASSWORD || "admin123"}`);

    process.exit(0);
  } catch (error) {
    console.log("Error running seeders:", error);
    process.exit(1);
  }
};

// Run seeders if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeeders();
}

export default runSeeders;
