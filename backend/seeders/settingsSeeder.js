import mongoose from 'mongoose';
import Settings from '../models/Settings.js';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/icl_streetwear';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for settings seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedSettings = async () => {
  try {
    console.log('=== Seeding Settings ===\n');
    
    // Check if settings already exist
    const existingSettings = await Settings.findOne();
    
    if (existingSettings) {
      console.log('Settings already exist, skipping seeding...');
      console.log('Current settings:', JSON.stringify(existingSettings.toObject(), null, 2));
    } else {
      // Create default settings
      const defaultSettings = new Settings();
      await defaultSettings.save();
      
      console.log('✅ Default settings created successfully!');
      console.log('Settings ID:', defaultSettings._id);
      console.log('Created at:', defaultSettings.createdAt);
      
      // Display the created settings
      console.log('\nDefault settings structure:');
      console.log(JSON.stringify(defaultSettings.toObject(), null, 2));
    }
    
    console.log('\n=== Settings Seeding Complete ===');
    
  } catch (error) {
    console.error('❌ Error seeding settings:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
};

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  connectDB().then(seedSettings);
}

export default seedSettings;
