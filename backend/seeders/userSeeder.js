import User from "../models/User.js";
import logger from "../utils/logger.js";

const users = [
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@icl.com",
    password: "admin123",
    phone: "9876543210",
    role: "admin",
    coins: 1000,
    address: {
      street: "123 Admin Street",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
      country: "India",
    },
  },
  {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "password123",
    phone: "9876543211",
    role: "user",
    coins: 150,
    address: {
      street: "456 Main Street",
      city: "Delhi",
      state: "Delhi",
      zipCode: "110001",
      country: "India",
    },
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    password: "password123",
    phone: "9876543212",
    role: "user",
    coins: 75,
    address: {
      street: "789 Oak Avenue",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560001",
      country: "India",
    },
  },
  {
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike@example.com",
    password: "password123",
    phone: "9876543213",
    role: "user",
    coins: 200,
    address: {
      street: "321 Pine Road",
      city: "Chennai",
      state: "Tamil Nadu",
      zipCode: "600001",
      country: "India",
    },
  },
  {
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah@example.com",
    password: "password123",
    phone: "9876543214",
    role: "user",
    coins: 50,
    address: {
      street: "654 Elm Street",
      city: "Kolkata",
      state: "West Bengal",
      zipCode: "700001",
      country: "India",
    },
  },
];

export const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    logger.info("Cleared existing users");

    // Create users
    const createdUsers = await User.create(users);
    logger.info(`Created ${createdUsers.length} users`);

    return createdUsers;
  } catch (error) {
    logger.error("Error seeding users:", error);
    throw error;
  }
};

export default seedUsers;
