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

const testApiResponse = async () => {
  try {
    console.log('=== Testing API Response ===\n');
    
    // Find the test user
    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('Test user not found');
      return;
    }
    
    console.log(`Found user: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`User ID: ${user._id}`);
    console.log(`Current coin balance: ${user.coins}\n`);
    
    // Simulate the API call that the frontend makes
    const transactions = await CoinTransaction.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    
    console.log(`Total transactions found: ${transactions.length}\n`);
    
    if (transactions.length > 0) {
      console.log('Transactions (sorted by newest first):');
      transactions.forEach((tx, index) => {
        console.log(`${index + 1}. ${tx.type.toUpperCase()}: ${tx.amount} coins`);
        console.log(`   Description: ${tx.description}`);
        console.log(`   Order: ${tx.orderNumber}`);
        console.log(`   Date: ${tx.createdAt}`);
        console.log(`   Balance after: ${tx.balanceAfter}`);
        console.log(`   ID: ${tx._id}`);
        console.log('');
      });
    } else {
      console.log('No transactions found for this user');
    }
    
    // Also check if there are any transactions without user reference
    const allTransactions = await CoinTransaction.find({}).sort({ createdAt: -1 });
    console.log(`\nTotal transactions in database: ${allTransactions.length}`);
    
    if (allTransactions.length > 0) {
      console.log('\nAll transactions in database:');
      allTransactions.forEach((tx, index) => {
        console.log(`${index + 1}. User: ${tx.user} | Type: ${tx.type} | Amount: ${tx.amount} | Description: ${tx.description}`);
      });
    }
    
  } catch (error) {
    console.error('Error in testApiResponse:', error);
  }
};

const main = async () => {
  await connectDB();
  await testApiResponse();
  await mongoose.disconnect();
  console.log('Script completed');
};

main().catch(console.error);
