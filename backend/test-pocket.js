import mongoose from 'mongoose';
import User from './models/User.js';
import CoinTransaction from './models/CoinTransaction.js';
import Order from './models/Order.js';

// Test configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/icl';

async function testPocketFunctionality() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a test user
    const testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      coins: 0
    });
    console.log('Test user created:', testUser.email);

    // Test 1: Add coins to user
    await testUser.addCoins(50);
    console.log('Added 50 coins to user. New balance:', testUser.coins);

    // Test 2: Create earned transaction
    const earnedTransaction = await CoinTransaction.createEarnedTransaction(
      testUser._id,
      25,
      'Test purchase completed',
      'ICL12345678'
    );
    console.log('Created earned transaction:', earnedTransaction._id);

    // Test 3: Create redeemed transaction
    const redeemedTransaction = await CoinTransaction.createRedeemedTransaction(
      testUser._id,
      10,
      'Test coins applied to order',
      'ICL12345679'
    );
    console.log('Created redeemed transaction:', redeemedTransaction._id);

    // Test 4: Get user transactions
    const transactions = await CoinTransaction.find({ user: testUser._id })
      .sort({ createdAt: -1 });
    console.log('User transactions:', transactions.length);

    // Test 5: Get user coins
    const updatedUser = await User.findById(testUser._id);
    console.log('Final user coins:', updatedUser.coins);

    // Clean up
    await User.findByIdAndDelete(testUser._id);
    await CoinTransaction.deleteMany({ user: testUser._id });
    console.log('Test data cleaned up');

    console.log('✅ All pocket functionality tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testPocketFunctionality();
