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

const checkCoinTransactions = async () => {
  try {
    console.log('=== Checking Coin Transactions ===\n');
    
    // Get all orders with coins earned
    const ordersWithCoins = await Order.find({
      coinsEarned: { $gt: 0 }
    }).populate('user', 'firstName lastName email');
    
    console.log(`Found ${ordersWithCoins.length} orders with coins earned\n`);
    
    for (const order of ordersWithCoins) {
      console.log(`Order: ${order.orderNumber}`);
      console.log(`Status: ${order.status}`);
      console.log(`Coins Earned: ${order.coinsEarned}`);
      console.log(`Coins Credited: ${order.coinsCredited}`);
      console.log(`Coins Debited: ${order.coinsDebited}`);
      console.log(`User: ${order.user.firstName} ${order.user.lastName} (${order.user.email})`);
      
      // Get transactions for this order
      const transactions = await CoinTransaction.find({
        order: order._id
      }).sort({ createdAt: 1 });
      
      console.log(`Transactions (${transactions.length}):`);
      transactions.forEach(tx => {
        console.log(`  - ${tx.type}: ${tx.amount} coins (${tx.description}) - ${tx.createdAt}`);
      });
      
      // Check user's current coin balance
      const user = await User.findById(order.user._id);
      console.log(`User's current coin balance: ${user.coins}`);
      
      console.log('---\n');
    }
    
    // Check for any inconsistencies
    console.log('=== Checking for Inconsistencies ===\n');
    
    // Orders that are delivered but not credited
    const deliveredNotCredited = await Order.find({
      status: 'delivered',
      coinsEarned: { $gt: 0 },
      coinsCredited: false
    });
    
    if (deliveredNotCredited.length > 0) {
      console.log(`⚠️  Found ${deliveredNotCredited.length} delivered orders that are not credited:`);
      deliveredNotCredited.forEach(order => {
        console.log(`  - ${order.orderNumber}`);
      });
      console.log('');
    }
    
    // Orders that are returned but not debited
    const returnedNotDebited = await Order.find({
      status: 'returned',
      coinsEarned: { $gt: 0 },
      coinsCredited: true,
      coinsDebited: false
    });
    
    if (returnedNotDebited.length > 0) {
      console.log(`⚠️  Found ${returnedNotDebited.length} returned orders that are not debited:`);
      returnedNotDebited.forEach(order => {
        console.log(`  - ${order.orderNumber}`);
      });
      console.log('');
    }
    
    // Orders that are credited but not delivered
    const creditedNotDelivered = await Order.find({
      status: { $ne: 'delivered' },
      coinsCredited: true
    });
    
    if (creditedNotDelivered.length > 0) {
      console.log(`⚠️  Found ${creditedNotDelivered.length} orders that are credited but not delivered:`);
      creditedNotDelivered.forEach(order => {
        console.log(`  - ${order.orderNumber} (status: ${order.status})`);
      });
      console.log('');
    }
    
    // Orders that are debited but not returned
    const debitedNotReturned = await Order.find({
      status: { $ne: 'returned' },
      coinsDebited: true
    });
    
    if (debitedNotReturned.length > 0) {
      console.log(`⚠️  Found ${debitedNotReturned.length} orders that are debited but not returned:`);
      debitedNotReturned.forEach(order => {
        console.log(`  - ${order.orderNumber} (status: ${order.status})`);
      });
      console.log('');
    }
    
    console.log('=== Summary ===');
    console.log(`Total orders with coins: ${ordersWithCoins.length}`);
    console.log(`Delivered orders: ${ordersWithCoins.filter(o => o.status === 'delivered').length}`);
    console.log(`Returned orders: ${ordersWithCoins.filter(o => o.status === 'returned').length}`);
    console.log(`Credited orders: ${ordersWithCoins.filter(o => o.coinsCredited).length}`);
    console.log(`Debited orders: ${ordersWithCoins.filter(o => o.coinsDebited).length}`);
    
  } catch (error) {
    console.error('Error in checkCoinTransactions:', error);
  }
};

const main = async () => {
  await connectDB();
  await checkCoinTransactions();
  await mongoose.disconnect();
  console.log('Script completed');
};

main().catch(console.error);
