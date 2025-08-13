import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import CoinTransaction from '../models/CoinTransaction.js';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/icl_streetwear';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkRealOrders = async () => {
  try {
    console.log('=== Checking Real Orders and Users ===\n');
    
    // Get all orders
    const allOrders = await Order.find({}).populate('user', 'firstName lastName email');
    
    console.log(`Total orders in database: ${allOrders.length}\n`);
    
    if (allOrders.length === 0) {
      console.log('No orders found in database');
      return;
    }
    
    // Group orders by user
    const ordersByUser = {};
    allOrders.forEach(order => {
      if (order.user) {
        const userKey = order.user.email;
        if (!ordersByUser[userKey]) {
          ordersByUser[userKey] = {
            user: order.user,
            orders: []
          };
        }
        ordersByUser[userKey].orders.push(order);
      }
    });
    
    console.log('Orders by user:');
    Object.entries(ordersByUser).forEach(([email, data]) => {
      console.log(`\nUser: ${data.user.firstName} ${data.user.lastName} (${email})`);
      console.log(`User ID: ${data.user._id}`);
      
      data.orders.forEach(order => {
        console.log(`  - Order: ${order.orderNumber}`);
        console.log(`    Status: ${order.status}`);
        console.log(`    Total: ₹${order.total}`);
        console.log(`    Coins Earned: ${order.coinsEarned}`);
        console.log(`    Coins Credited: ${order.coinsCredited}`);
        console.log(`    Coins Debited: ${order.coinsDebited}`);
        console.log(`    Date: ${order.createdAt}`);
      });
    });
    
    // Check for any real users (not test users)
    const realUsers = await User.find({
      email: { $ne: 'test@example.com' }
    }).select('firstName lastName email coins');
    
    console.log(`\n=== Real Users (excluding test@example.com) ===`);
    console.log(`Total real users: ${realUsers.length}`);
    
    if (realUsers.length > 0) {
      for (const user of realUsers) {
        console.log(`\nUser: ${user.firstName} ${user.lastName} (${user.email})`);
        console.log(`User ID: ${user._id}`);
        console.log(`Current coin balance: ${user.coins}`);
        
        // Get transactions for this user
        const transactions = await CoinTransaction.find({ user: user._id })
          .sort({ createdAt: -1 });
        
        console.log(`Transactions: ${transactions.length}`);
        
        if (transactions.length > 0) {
          transactions.forEach((tx, index) => {
            console.log(`  ${index + 1}. ${tx.type.toUpperCase()}: ${tx.amount} coins - ${tx.description}`);
          });
        }
      }
    } else {
      console.log('No real users found (only test user exists)');
    }
    
  } catch (error) {
    console.error('Error in checkRealOrders:', error);
  }
};

const main = async () => {
  await connectDB();
  await checkRealOrders();
  await mongoose.disconnect();
  console.log('Script completed');
};

main().catch(console.error);
