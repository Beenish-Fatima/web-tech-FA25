const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const sampleProducts = [
    // ... keep your sample products array the same
];

const seedDatabase = async () => {
    try {
        // Connect to the correct database
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB database: ecommerce');

        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️ Cleared existing products');

        // Insert sample products
        await Product.insertMany(sampleProducts);
        console.log(`✅ Inserted ${sampleProducts.length} sample products`);

        // Verify insertion
        const count = await Product.countDocuments();
        console.log(`📊 Total products in database: ${count}`);

        // Show some sample data
        const sample = await Product.findOne();
        console.log(`📋 Sample product: ${sample.name} - $${sample.price}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
};

seedDatabase();