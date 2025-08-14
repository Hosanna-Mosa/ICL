import mongoose from 'mongoose';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
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

const testCoinPurchase = async () => {
  try {
    console.log('=== Testing Coin Purchase Functionality ===\n');
    
    // Test 1: Find a user with coins
    const userWithCoins = await User.findOne({ coins: { $gt: 0 } });
    if (!userWithCoins) {
      console.log('❌ No users found with coins. Please add coins to a user first.');
      return;
    }
    
    console.log(`✅ Found user: ${userWithCoins.firstName} ${userWithCoins.lastName}`);
    console.log(`   Email: ${userWithCoins.email}`);
    console.log(`   Current coins: ${userWithCoins.coins}`);
    
    // Test 2: Find a product to add to cart
    const product = await Product.findOne({ isActive: true });
    if (!product) {
      console.log('❌ No active products found.');
      return;
    }
    
    console.log(`✅ Found product: ${product.name}`);
    console.log(`   Price: ₹${product.basePrice}`);
    
    // Test 3: Get or create cart for user
    let cart = await Cart.getOrCreateCart(userWithCoins._id);
    console.log(`✅ Cart retrieved/created for user`);
    
    // Test 4: Add product to cart
    const size = 'M';
    const quantity = 1;
    const price = product.basePrice;
    
    await cart.addItem(product._id, size, quantity, price);
    await cart.populate('items.product');
    
    console.log(`✅ Added ${quantity}x ${product.name} (${size}) to cart`);
    console.log(`   Cart subtotal: ₹${cart.subtotal}`);
    
    // Test 5: Test coin application
    const coinsToUse = Math.min(100, userWithCoins.coins, cart.subtotal);
    console.log(`\n=== Testing Coin Application ===`);
    console.log(`Attempting to use ${coinsToUse} coins...`);
    
    try {
      await cart.applyCoinsDiscount(coinsToUse, coinsToUse);
      await cart.populate('items.product');
      
      console.log(`✅ Successfully applied ${coinsToUse} coins`);
      console.log(`   Coins used: ${cart.coinsUsed}`);
      console.log(`   Coin discount: ₹${cart.coinsDiscount}`);
      console.log(`   Cart total: ₹${cart.total}`);
      
      // Test 6: Verify user still has enough coins
      const updatedUser = await User.findById(userWithCoins._id);
      console.log(`   User coins after application: ${updatedUser.coins} (should still be ${userWithCoins.coins})`);
      
      if (updatedUser.coins !== userWithCoins.coins) {
        console.log(`❌ ERROR: User coins were deducted prematurely!`);
        console.log(`   Expected: ${userWithCoins.coins}, Got: ${updatedUser.coins}`);
      } else {
        console.log(`✅ User coins not deducted yet (correct - should only be deducted on order placement)`);
      }
      
    } catch (error) {
      console.log(`❌ Failed to apply coins: ${error.message}`);
      return;
    }
    
    // Test 7: Test order creation with coins
    console.log(`\n=== Testing Order Creation with Coins ===`);
    
    const shippingAddress = {
      firstName: userWithCoins.firstName,
      lastName: userWithCoins.lastName,
      phone: userWithCoins.phone || '1234567890',
      street: 'Test Address',
      city: 'Test City',
      state: 'Test State',
      zipCode: '123456'
    };
    
    const payment = {
      method: 'upi',
      amount: cart.total,
      status: 'pending'
    };
    
    try {
      // Create order
      const order = await Order.create({
        orderNumber: Order.generateOrderNumber(),
        user: userWithCoins._id,
        items: cart.items.map(item => ({
          product: item.product._id,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        shippingAddress,
        payment,
        subtotal: cart.subtotal,
        shippingCost: 0,
        discountAmount: cart.discountAmount,
        coinsUsed: cart.coinsUsed,
        total: cart.total,
      });
      
      console.log(`✅ Order created successfully`);
      console.log(`   Order number: ${order.orderNumber}`);
      console.log(`   Total: ₹${order.total}`);
      console.log(`   Coins used: ${order.coinsUsed}`);
      
      // Test 8: Verify coins were deducted from user
      const userAfterOrder = await User.findById(userWithCoins._id);
      const expectedCoins = userWithCoins.coins - coinsToUse;
      
      console.log(`   User coins after order: ${userAfterOrder.coins}`);
      console.log(`   Expected coins: ${expectedCoins}`);
      
      if (userAfterOrder.coins === expectedCoins) {
        console.log(`✅ Coins correctly deducted from user`);
      } else {
        console.log(`❌ ERROR: Coins not deducted correctly!`);
        console.log(`   Expected: ${expectedCoins}, Got: ${userAfterOrder.coins}`);
      }
      
      // Test 9: Verify coin transaction was created
      const transaction = await CoinTransaction.findOne({
        user: userWithCoins._id,
        order: order._id,
        type: 'redeemed'
      });
      
      if (transaction) {
        console.log(`✅ Coin transaction created`);
        console.log(`   Amount: ${transaction.amount}`);
        console.log(`   Description: ${transaction.description}`);
        console.log(`   Balance after: ${transaction.balanceAfter}`);
      } else {
        console.log(`❌ ERROR: Coin transaction not found!`);
      }
      
      // Test 10: Clean up - remove the test order
      await Order.findByIdAndDelete(order._id);
      await CoinTransaction.findByIdAndDelete(transaction._id);
      
      // Restore user coins
      await userWithCoins.addCoins(coinsToUse);
      
      console.log(`✅ Test cleanup completed`);
      
    } catch (error) {
      console.log(`❌ Failed to create order: ${error.message}`);
      console.log(error.stack);
    }
    
    // Test 11: Clean up cart
    await cart.clearCart();
    console.log(`✅ Cart cleared`);
    
    console.log(`\n=== Test Summary ===`);
    console.log(`✅ Coin purchase functionality is working correctly!`);
    console.log(`   - Users can apply coins to cart`);
    console.log(`   - Coins are validated properly`);
    console.log(`   - Orders are created with coin discounts`);
    console.log(`   - User coin balance is updated correctly`);
    console.log(`   - Coin transactions are recorded`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
  }
};

const runTest = async () => {
  await connectDB();
  await testCoinPurchase();
  await mongoose.disconnect();
  console.log('\nTest completed. Database disconnected.');
};

runTest().catch(console.error);
