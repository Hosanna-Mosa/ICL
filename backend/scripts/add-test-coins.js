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

const addTestCoins = async () => {
  try {
    console.log('=== Adding Test Coins to User ===\n');
    
    // Find a user to add coins to
    const user = await User.findOne({ role: 'user' });
    if (!user) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }
    
    console.log(`Found user: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`Current coins: ${user.coins}`);
    
    // Add coins to user
    const coinsToAdd = 500; // Add 500 coins for testing
    await user.addCoins(coinsToAdd);
    
    // Create a transaction record
    await CoinTransaction.createEarnedTransaction(
      user._id,
      coinsToAdd,
      'Test coins added for coin purchase functionality testing',
      null,
      null
    );
    
    console.log(`✅ Successfully added ${coinsToAdd} coins to user`);
    console.log(`New coin balance: ${user.coins}`);
    console.log(`Transaction recorded`);
    
    console.log(`\n=== Test User Ready ===`);
    console.log(`User: ${user.firstName} ${user.lastName}`);
    console.log(`Email: ${user.email}`);
    console.log(`Coins: ${user.coins}`);
    console.log(`\nYou can now test the coin purchase functionality!`);
    
  } catch (error) {
    console.error('❌ Failed to add test coins:', error);
    console.error(error.stack);
  }
};

const runScript = async () => {
  await connectDB();
  await addTestCoins();
  await mongoose.disconnect();
  console.log('\nScript completed. Database disconnected.');
};

runScript().catch(console.error);
