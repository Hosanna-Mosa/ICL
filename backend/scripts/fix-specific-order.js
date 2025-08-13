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

const fixSpecificOrder = async () => {
  try {
    console.log('=== Fixing Specific Order ===\n');
    
    // Find the specific order
    const order = await Order.findOne({ orderNumber: 'ICL02236932791' }).populate('user');
    
    if (!order) {
      console.log('Order ICL02236932791 not found');
      return;
    }
    
    console.log(`Found order: ${order.orderNumber}`);
    console.log(`Status: ${order.status}`);
    console.log(`Coins Earned: ${order.coinsEarned}`);
    console.log(`Coins Credited: ${order.coinsCredited}`);
    console.log(`Coins Debited: ${order.coinsDebited}`);
    
    // Check existing transactions
    const transactions = await CoinTransaction.find({
      order: order._id
    }).sort({ createdAt: 1 });
    
    console.log(`\nExisting transactions (${transactions.length}):`);
    transactions.forEach(tx => {
      console.log(`  - ${tx.type}: ${tx.amount} coins (${tx.description})`);
    });
    
    // Check if redeemed transaction exists
    const existingRedeemedTransaction = await CoinTransaction.findOne({
      user: order.user._id,
      order: order._id,
      type: 'redeemed',
      description: 'Order returned - coins debited'
    });
    
    if (existingRedeemedTransaction) {
      console.log('\n✅ Redeemed transaction already exists');
      return;
    }
    
    console.log('\n❌ Redeemed transaction missing, creating it...');
    
    // Get user
    const user = await User.findById(order.user._id);
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log(`User's current coin balance: ${user.coins}`);
    
    // Create the missing redeemed transaction manually (since coins were already debited)
    const transaction = await CoinTransaction.create({
      user: order.user._id,
      type: 'redeemed',
      amount: order.coinsEarned,
      description: 'Order returned - coins debited',
      orderNumber: order.orderNumber,
      order: order._id,
      balanceAfter: 0 // Since user's current balance is 0
    });
    
    console.log('✅ Successfully created redeemed transaction');
    
    // Verify the transaction was created
    const newTransactions = await CoinTransaction.find({
      order: order._id
    }).sort({ createdAt: 1 });
    
    console.log(`\nUpdated transactions (${newTransactions.length}):`);
    newTransactions.forEach(tx => {
      console.log(`  - ${tx.type}: ${tx.amount} coins (${tx.description})`);
    });
    
  } catch (error) {
    console.error('Error in fixSpecificOrder:', error);
  }
};

const main = async () => {
  await connectDB();
  await fixSpecificOrder();
  await mongoose.disconnect();
  console.log('Script completed');
};

main().catch(console.error);
