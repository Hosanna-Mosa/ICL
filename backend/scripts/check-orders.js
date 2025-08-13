import mongoose from 'mongoose';
import Order from '../models/Order.js';

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

const checkOrders = async () => {
  try {
    console.log('=== Checking All Orders ===\n');
    
    const allOrders = await Order.find({}).populate('user', 'firstName lastName email');
    
    console.log(`Total orders in database: ${allOrders.length}\n`);
    
    if (allOrders.length > 0) {
      allOrders.forEach(order => {
        console.log(`Order: ${order.orderNumber}`);
        console.log(`Status: ${order.status}`);
        console.log(`Total: ₹${order.total}`);
        console.log(`Coins Earned: ${order.coinsEarned}`);
        console.log(`Coins Credited: ${order.coinsCredited}`);
        console.log(`Coins Debited: ${order.coinsDebited}`);
        if (order.user) {
          console.log(`User: ${order.user.firstName} ${order.user.lastName}`);
        }
        console.log('---');
      });
    }
    
    // Check by status
    const statusCounts = {};
    allOrders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    
    console.log('\n=== Orders by Status ===');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`${status}: ${count}`);
    });
    
  } catch (error) {
    console.error('Error in checkOrders:', error);
  }
};

const main = async () => {
  await connectDB();
  await checkOrders();
  await mongoose.disconnect();
  console.log('Script completed');
};

main().catch(console.error);
