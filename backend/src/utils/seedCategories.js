require('dotenv').config(); // ✅ explicitly load .env from root

const mongoose = require('mongoose');
const connectDB = require('../config/database'); // ✅ make sure this exports the function directly
const Category = require('../models/Category');

const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Phones, laptops, TVs, and electronic devices', icon: '📱' },
  { name: 'Vehicles', slug: 'vehicles', description: 'Cars, motorcycles, bicycles, and vehicle parts', icon: '🚗' },
  { name: 'Home & Garden', slug: 'home-garden', description: 'Furniture, appliances, home decor, and garden items', icon: '🏠' },
  { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes, accessories, and jewelry', icon: '👕' },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Sports equipment, outdoor gear, and fitness items', icon: '⚽' },
  { name: 'Books & Media', slug: 'books-media', description: 'Books, movies, music, and educational materials', icon: '📚' },
  { name: 'Jobs', slug: 'jobs', description: 'Job opportunities and career listings', icon: '💼' },
  { name: 'Services', slug: 'services', description: 'Professional services and skilled labor', icon: '🔧' },
  { name: 'Real Estate', slug: 'real-estate', description: 'Properties for rent and sale', icon: '🏘️' },
  { name: 'Pets', slug: 'pets', description: 'Pets, pet supplies, and pet services', icon: '🐕' }
];


const seedCategories = async () => {
  try {
    console.log('✅ MONGODB_URI:', process.env.MONGODB_URI); // Debug: should NOT be undefined

    await connectDB(); // ✅ connect using your utility function

    await Category.deleteMany({});
    console.log('🗑️ Existing categories cleared');

    const created = await Category.create(categories);
    console.log(`✅ Inserted ${created.length} categories`);

    created.forEach(c => console.log(`- ${c.name}`));

    process.exit(0);

  } catch (err) {
    console.error('❌ Error seeding categories:', err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedCategories();
}
