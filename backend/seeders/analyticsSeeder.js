import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

// Generate sample analytics data
export const seedAnalyticsData = async () => {
  try {
    console.log("Seeding analytics data...");

    // Generate sample orders for the last 30 days
    const orders = [];
    const now = new Date();
    
    for (let i = 0; i < 50; i++) {
      const orderDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      const order = {
        orderNumber: `ORD-${Date.now()}-${i}`,
        user: "65f1a2b3c4d5e6f7a8b9c0d1", // Sample user ID
        items: [
          {
            product: "65f1a2b3c4d5e6f7a8b9c0d2", // Sample product ID
            name: "Sample Product",
            price: Math.floor(Math.random() * 5000) + 1000,
            quantity: Math.floor(Math.random() * 3) + 1,
            size: "M",
            color: "Black"
          }
        ],
        total: Math.floor(Math.random() * 10000) + 2000,
        status: randomStatus,
        shippingAddress: {
          firstName: "John",
          lastName: "Doe",
          phone: "1234567890",
          street: "123 Main St",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400001",
          country: "India"
        },
        paymentMethod: "cod",
        createdAt: orderDate,
        updatedAt: orderDate
      };
      
      orders.push(order);
    }

    // Generate sample users
    const users = [];
    for (let i = 0; i < 20; i++) {
      const userDate = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      const lastLogin = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      const user = {
        firstName: `User${i + 1}`,
        lastName: "Sample",
        email: `user${i + 1}@example.com`,
        password: "$2a$10$samplehash", // Sample hashed password
        phone: `98765${String(i).padStart(5, '0')}`,
        role: "user",
        coins: Math.floor(Math.random() * 1000),
        isActive: true,
        emailVerified: true,
        lastLogin: lastLogin,
        createdAt: userDate,
        updatedAt: userDate
      };
      
      users.push(user);
    }

    // Generate sample products
    const products = [];
    const categories = ['hoodies', 'tshirts', 'pants', 'shorts', 'jackets', 'accessories'];
    
    for (let i = 0; i < 30; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      const product = {
        name: `Sample ${category.charAt(0).toUpperCase() + category.slice(1)} ${i + 1}`,
        description: `This is a sample ${category} product for testing analytics.`,
        category: category,
        subcategory: "sample",
        brand: "BRELIS",
        images: [
          {
            url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
            alt: `Sample ${category}`,
            isPrimary: true
          }
        ],
        sizes: [
          {
            size: "M",
            stock: Math.floor(Math.random() * 50) + 10,
            price: Math.floor(Math.random() * 5000) + 1000
          }
        ],
        basePrice: Math.floor(Math.random() * 5000) + 1000,
        salePrice: Math.random() > 0.7 ? Math.floor(Math.random() * 3000) + 500 : undefined,
        coinsEarned: Math.floor(Math.random() * 50) + 10,
        fabric: "100% Cotton",
        gsm: "300 GSM",
        fit: "regular",
        washCare: "Machine wash cold",
        tags: [category, "sample"],
        isActive: true,
        isFeatured: Math.random() > 0.8,
        rating: Math.random() * 5,
        reviewCount: Math.floor(Math.random() * 100),
        totalSold: Math.floor(Math.random() * 200)
      };
      
      products.push(product);
    }

    // Insert sample data
    if (orders.length > 0) {
      await Order.insertMany(orders);
      console.log(`Created ${orders.length} sample orders`);
    }

    if (users.length > 0) {
      await User.insertMany(users);
      console.log(`Created ${users.length} sample users`);
    }

    if (products.length > 0) {
      await Product.insertMany(products);
      console.log(`Created ${products.length} sample products`);
    }

    console.log("Analytics data seeding completed!");
    return { orders: orders.length, users: users.length, products: products.length };
  } catch (error) {
    console.error("Error seeding analytics data:", error);
    throw error;
  }
};

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAnalyticsData()
    .then(() => {
      console.log("Analytics seeder completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Analytics seeder failed:", error);
      process.exit(1);
    });
}
