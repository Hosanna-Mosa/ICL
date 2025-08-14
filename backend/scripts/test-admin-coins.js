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

const testAdminCoins = async () => {
  try {
    console.log('=== Testing Admin Coin Endpoints ===\n');
    
    // Test 1: Check if there are any users with coins
    const usersWithCoins = await User.find({ coins: { $gt: 0 } });
    console.log(`Users with coins: ${usersWithCoins.length}`);
    
    if (usersWithCoins.length > 0) {
      console.log('Users with coins:');
      usersWithCoins.forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName} (${user.email}): ${user.coins} coins`);
      });
    }
    
    // Test 2: Check total coin transactions
    const totalTransactions = await CoinTransaction.countDocuments();
    console.log(`\nTotal coin transactions: ${totalTransactions}`);
    
    if (totalTransactions > 0) {
      const recentTransactions = await CoinTransaction.find()
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(5);
      
      console.log('\nRecent transactions:');
      recentTransactions.forEach(tx => {
        console.log(`  - ${tx.user.firstName} ${tx.user.lastName}: ${tx.type} ${tx.amount} coins (${tx.description})`);
      });
    }
    
    // Test 3: Calculate statistics manually
    const stats = await CoinTransaction.aggregate([
      {
        $group: {
          _id: null,
          totalEarned: {
            $sum: {
              $cond: [{ $eq: ['$type', 'earned'] }, '$amount', 0]
            }
          },
          totalRedeemed: {
            $sum: {
              $cond: [{ $eq: ['$type', 'redeemed'] }, '$amount', 0]
            }
          },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);
    
    const totalCoinsInCirculation = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$coins' }
        }
      }
    ]);
    
    const usersWithCoinsCount = await User.countDocuments({ coins: { $gt: 0 } });
    
    console.log('\n=== Coin System Statistics ===');
    console.log(`Total coins in circulation: ${totalCoinsInCirculation[0]?.total || 0}`);
    console.log(`Users with coins: ${usersWithCoinsCount}`);
    console.log(`Total transactions: ${stats[0]?.totalTransactions || 0}`);
    console.log(`Total earned: ${stats[0]?.totalEarned || 0}`);
    console.log(`Total redeemed: ${stats[0]?.totalRedeemed || 0}`);
    
    // Test 4: Test user aggregation (similar to admin endpoint)
    const userCoinsData = await User.aggregate([
      {
        $lookup: {
          from: 'cointransactions',
          localField: '_id',
          foreignField: 'user',
          as: 'transactions'
        }
      },
      {
        $addFields: {
          totalEarned: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$transactions',
                    cond: { $eq: ['$$this.type', 'earned'] }
                  }
                },
                as: 'tx',
                in: '$$tx.amount'
              }
            }
          },
          totalRedeemed: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$transactions',
                    cond: { $eq: ['$$this.type', 'redeemed'] }
                  }
                },
                as: 'tx',
                in: '$$tx.amount'
              }
            }
          },
          transactionCount: { $size: '$transactions' }
        }
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          coins: 1,
          totalEarned: 1,
          totalRedeemed: 1,
          transactionCount: 1
        }
      },
      {
        $sort: { coins: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    console.log('\n=== Top 10 Users by Coin Balance ===');
    if (userCoinsData.length > 0) {
      userCoinsData.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
        console.log(`   Current: ${user.coins} | Earned: ${user.totalEarned} | Redeemed: ${user.totalRedeemed} | Transactions: ${user.transactionCount}`);
      });
    } else {
      console.log('No users found with coin data');
    }
    
    console.log('\n✅ Admin coin endpoints test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing admin coin endpoints:', error);
  }
};

const main = async () => {
  await connectDB();
  await testAdminCoins();
  await mongoose.disconnect();
  console.log('\nMongoDB disconnected');
};

main().catch(console.error);
