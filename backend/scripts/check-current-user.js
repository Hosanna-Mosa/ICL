import mongoose from 'mongoose';
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

const checkCurrentUser = async () => {
  try {
    console.log('=== Checking All Users and Their Transactions ===\n');
    
    // Get all users
    const users = await User.find({}).select('firstName lastName email coins');
    
    console.log(`Total users in database: ${users.length}\n`);
    
    for (const user of users) {
      console.log(`User: ${user.firstName} ${user.lastName} (${user.email})`);
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
      
      console.log('---\n');
    }
    
    // Check if there are any transactions without a user
    const orphanedTransactions = await CoinTransaction.find({ user: { $exists: false } });
    if (orphanedTransactions.length > 0) {
      console.log(`⚠️  Found ${orphanedTransactions.length} transactions without user reference`);
    }
    
  } catch (error) {
    console.error('Error in checkCurrentUser:', error);
  }
};

const main = async () => {
  await connectDB();
  await checkCurrentUser();
  await mongoose.disconnect();
  console.log('Script completed');
};

main().catch(console.error);
