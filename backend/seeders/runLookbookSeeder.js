import dotenv from "dotenv";
import connectDB from "../config/database.js";
import seedLookbook from "./lookbookSeeder.js";

// Load environment variables
dotenv.config();

const runLookbookSeeder = async () => {
  try {
    console.log("Starting lookbook seeding...");

    // Connect to database
    await connectDB();
    console.log("Connected to database");

    // Run lookbook seeder only
    console.log("Seeding lookbook...");
    const lookbookItems = await seedLookbook();
    console.log(`Seeded ${lookbookItems.length} lookbook items`);

    console.log("Lookbook seeding completed successfully!");

    process.exit(0);
  } catch (error) {
    console.log("Error running lookbook seeder:", error);
    process.exit(1);
  }
};

// Run seeder if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runLookbookSeeder();
}

export default runLookbookSeeder;
