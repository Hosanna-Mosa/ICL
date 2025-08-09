import dotenv from "dotenv";
import connectDB from "../config/database.js";
import User from "../models/User.js";
import { fileURLToPath } from "url";
import path from "path";

// Load environment variables from backend root .env (works even when running inside /seeders)
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const envPath = path.resolve(__dirname, "../.env");
  dotenv.config({ path: envPath });
} catch (_) {
  dotenv.config();
}

export const seedAdmin = async () => {
  try {
    await connectDB();

    const firstName = process.env.ADMIN_FIRST_NAME || "ICL";
    const lastName = process.env.ADMIN_LAST_NAME || "Admin";
    const email = process.env.ADMIN_EMAIL || "admin@iclstreetwear.com";
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const phone = process.env.ADMIN_PHONE || "9999999999";

    let admin = await User.findOne({ email });

    if (admin) {
      // Ensure role is admin and account is active
      admin.role = "admin";
      admin.isActive = true;
      // Optionally reset password if ADMIN_RESET_PASSWORD=true
      if (process.env.ADMIN_RESET_PASSWORD === "true") {
        admin.password = password;
      }
      await admin.save();
      console.log("Admin user already exists. Ensured role and status:", {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
      });
      return admin;
    }

    admin = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: "admin",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
      },
    });

    console.log("Admin user created successfully:", {
      id: admin._id.toString(),
      email: admin.email,
    });

    return admin;
  } catch (error) {
    console.log("Error seeding admin:", error);
    throw error;
  } finally {
    // Exit only when called directly (see below)
  }
};

// If executed directly: seed and exit
const isDirectRun = (() => {
  try {
    const thisFile = fileURLToPath(import.meta.url);
    return process.argv[1] && process.argv[1] === thisFile;
  } catch (_) {
    return false;
  }
})();

if (isDirectRun) {
  // Helpful start log
  console.log("Seeding admin user...");
  seedAdmin()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seedAdmin;
