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

const testReturnScenario = async () => {
  try {
    console.log('=== Testing Return Scenario ===\n');
    
    // Create a test user
    let user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890'
      });
      await user.save();
      console.log('Created test user');
    }
    
    // Create a test order (similar to the user's scenario)
    const order = await Order.create({
      orderNumber: Order.generateOrderNumber(),
      user: user._id,
      items: [{
        product: new mongoose.Types.ObjectId(),
        name: 'Test Product',
        size: 'M',
        quantity: 1,
        price: 1900,
        total: 1900
      }],
      shippingAddress: {
        firstName: 'Test',
        lastName: 'User',
        phone: '1234567890',
        street: 'Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '123456',
        country: 'India'
      },
      status: 'pending',
      payment: {
        method: 'cod',
        status: 'pending',
        amount: 1900
      },
      subtotal: 1900,
      shippingCost: 0,
      discountAmount: 0,
      coinsUsed: 0,
      coinsEarned: 19, // 1 coin per 100 rupees
      total: 1900
    });
    
    console.log(`Created test order: ${order.orderNumber}`);
    console.log(`Initial status: ${order.status}`);
    console.log(`Coins earned: ${order.coinsEarned}`);
    
    // Step 1: Mark order as delivered (should credit coins)
    console.log('\n--- Step 1: Marking order as delivered ---');
    order.status = 'delivered';
    order.coinsCredited = true;
    await order.save();
    
    // Add coins to user
    await user.addCoins(order.coinsEarned);
    
    // Create earned transaction
    await CoinTransaction.createEarnedTransaction(
      user._id,
      order.coinsEarned,
      'Purchase completed',
      order.orderNumber,
      order._id
    );
    
    console.log(`✅ Order delivered, ${order.coinsEarned} coins credited`);
    console.log(`User's coin balance: ${user.coins}`);
    
    // Step 2: Mark order as returned (should debit coins)
    console.log('\n--- Step 2: Marking order as returned ---');
    
    // Refresh user to get current coin balance
    user = await User.findById(user._id);
    console.log(`User's current coin balance before return: ${user.coins}`);
    
    order.status = 'returned';
    order.coinsDebited = true;
    await order.save();
    
    // Create redeemed transaction first (before debiting coins)
    await CoinTransaction.createRedeemedTransaction(
      user._id,
      order.coinsEarned,
      'Order returned - coins debited',
      order.orderNumber,
      order._id
    );
    
    // Debit coins from user
    await user.redeemCoins(order.coinsEarned);
    
    console.log(`✅ Order returned, ${order.coinsEarned} coins debited`);
    console.log(`User's coin balance: ${user.coins}`);
    
    // Step 3: Check transaction history
    console.log('\n--- Step 3: Checking transaction history ---');
    const transactions = await CoinTransaction.find({
      user: user._id
    }).sort({ createdAt: 1 });
    
    console.log(`Total transactions: ${transactions.length}`);
    transactions.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.type.toUpperCase()}: ${tx.amount} coins`);
      console.log(`   Description: ${tx.description}`);
      console.log(`   Order: ${tx.orderNumber}`);
      console.log(`   Date: ${tx.createdAt}`);
      console.log(`   Balance after: ${tx.balanceAfter}`);
      console.log('');
    });
    
    // Step 4: Verify order state
    console.log('--- Step 4: Final order state ---');
    const finalOrder = await Order.findById(order._id);
    console.log(`Order status: ${finalOrder.status}`);
    console.log(`Coins credited: ${finalOrder.coinsCredited}`);
    console.log(`Coins debited: ${finalOrder.coinsDebited}`);
    
    console.log('\n=== Test completed successfully! ===');
    
  } catch (error) {
    console.error('Error in testReturnScenario:', error.message);
    console.error('Full error:', error);
  }
};

const main = async () => {
  await connectDB();
  await testReturnScenario();
  await mongoose.disconnect();
  console.log('Script completed');
};

main().catch(console.error);
