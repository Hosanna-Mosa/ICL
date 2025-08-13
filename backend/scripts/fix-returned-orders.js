import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import CoinTransaction from '../models/CoinTransaction.js';
import dotenv from 'dotenv';

dotenv.config();

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

const fixReturnedOrders = async () => {
  try {
    console.log('Starting to fix returned orders...');
    
    // Find all orders that are returned but don't have coinsDebited set to true
    const returnedOrders = await Order.find({
      status: 'returned',
      coinsEarned: { $gt: 0 },
      coinsCredited: true,
      coinsDebited: { $ne: true }
    }).populate('user');
    
    console.log(`Found ${returnedOrders.length} returned orders that need coin debit transactions`);
    
    for (const order of returnedOrders) {
      console.log(`Processing order: ${order.orderNumber}`);
      
      try {
        // Check if user exists and has sufficient coins
        const user = await User.findById(order.user._id);
        if (!user) {
          console.log(`User not found for order ${order.orderNumber}, skipping...`);
          continue;
        }
        
        if (user.coins < order.coinsEarned) {
          console.log(`User ${user.email} has insufficient coins (${user.coins}) to debit ${order.coinsEarned} for order ${order.orderNumber}`);
          continue;
        }
        
        // Check if transaction already exists
        const existingTransaction = await CoinTransaction.findOne({
          user: order.user._id,
          order: order._id,
          type: 'redeemed',
          description: 'Order returned - coins debited'
        });
        
        if (existingTransaction) {
          console.log(`Transaction already exists for order ${order.orderNumber}, skipping...`);
          continue;
        }
        
        // Debit coins from user
        await user.redeemCoins(order.coinsEarned);
        
        // Mark order as debited
        order.coinsDebited = true;
        await order.save();
        
        // Create coin transaction record
        await CoinTransaction.createRedeemedTransaction(
          order.user._id,
          order.coinsEarned,
          'Order returned - coins debited',
          order.orderNumber,
          order._id
        );
        
        console.log(`✅ Successfully debited ${order.coinsEarned} coins for order ${order.orderNumber}`);
        
      } catch (error) {
        console.error(`❌ Error processing order ${order.orderNumber}:`, error.message);
      }
    }
    
    console.log('Finished fixing returned orders');
    
  } catch (error) {
    console.error('Error in fixReturnedOrders:', error);
  }
};

const main = async () => {
  await connectDB();
  await fixReturnedOrders();
  await mongoose.disconnect();
  console.log('Script completed');
};

main().catch(console.error);
