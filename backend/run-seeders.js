import mongoose from 'mongoose';
import { seedUsers } from './seeders/userSeeder.js';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/brelis_streetwear';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
const runSeeders = async () => {
  try {
    console.log('=== Running Seeders ===\n');
    
    // Run user seeder
    console.log('Creating users...');
    const users = await seedUsers();
    console.log(`✅ Created ${users.length} users with coins`);
    
    users.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName}: ${user.coins} coins`);
    });
    console.log('\n=== Seeding Complete ===');
    console.log('You can now test the coin purchase functionality!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    console.error(error.stack);
  }
};
const main = async () => {
  await connectDB();
  await runSeeders();
  await mongoose.disconnect();
  console.log('\nDatabase disconnected.');
};
main().catch(console.error);