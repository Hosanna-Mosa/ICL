import mongoose from 'mongoose';
import Product from './models/Product.js';

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

const createTestProduct = async () => {
  try {
    console.log('=== Creating Test Product ===\n');
    
    // Create a simple test product with correct structure
    const testProduct = await Product.create({
      name: 'Test T-Shirt',
      description: 'A test product for coin functionality testing',
      basePrice: 500,
      salePrice: 500,
      category: 'tshirts', // Correct enum value
      brand: 'BRELIS',
      isActive: true,
      sizes: [
        {
          size: 'S',
          stock: 10,
          price: 500
        },
        {
          size: 'M',
          stock: 10,
          price: 500
        },
        {
          size: 'L',
          stock: 10,
          price: 500
        },
        {
          size: 'XL',
          stock: 10,
          price: 500
        }
      ],
      images: [
        {
          url: 'https://via.placeholder.com/400x500',
          alt: 'Test T-Shirt',
          isPrimary: true
        }
      ],
      tags: ['test', 't-shirt'],
      coinsEarned: 5 // 5 coins earned for this product
    });
    
    console.log(`✅ Created test product: ${testProduct.name}`);
    console.log(`   Price: ₹${testProduct.basePrice}`);
    console.log(`   Coins earned: ${testProduct.coinsEarned}`);
    
  } catch (error) {
    console.error('❌ Failed to create test product:', error);
  }
};

const main = async () => {
  await connectDB();
  await createTestProduct();
  await mongoose.disconnect();
  console.log('\nDatabase disconnected.');
};

main().catch(console.error);
