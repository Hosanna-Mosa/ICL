import mongoose from 'mongoose';
import User from '../models/User.js';
import Order from '../models/Order.js';
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

const cleanupTestData = async () => {
  try {
    console.log('=== Cleaning up test data ===\n');
    
    // Find test user
    const testUser = await User.findOne({ email: 'test@example.com' });
    
    if (testUser) {
      console.log('Found test user, cleaning up...');
      
      // Delete all transactions for test user
      const deletedTransactions = await CoinTransaction.deleteMany({ user: testUser._id });
      console.log(`Deleted ${deletedTransactions.deletedCount} transactions`);
      
      // Delete all orders for test user
      const deletedOrders = await Order.deleteMany({ user: testUser._id });
      console.log(`Deleted ${deletedOrders.deletedCount} orders`);
      
      // Delete test user
      await User.findByIdAndDelete(testUser._id);
      console.log('Deleted test user');
      
      console.log('\n✅ Test data cleaned up successfully!');
    } else {
      console.log('No test user found');
    }
    
    // Check what's left
    const remainingUsers = await User.countDocuments();
    const remainingOrders = await Order.countDocuments();
    const remainingTransactions = await CoinTransaction.countDocuments();
    
    console.log(`\nRemaining data:`);
    console.log(`- Users: ${remainingUsers}`);
    console.log(`- Orders: ${remainingOrders}`);
    console.log(`- Transactions: ${remainingTransactions}`);
    
  } catch (error) {
    console.error('Error in cleanupTestData:', error);
  }
};

const main = async () => {
  await connectDB();
  await cleanupTestData();
  await mongoose.disconnect();
  console.log('Script completed');
};

main().catch(console.error);
