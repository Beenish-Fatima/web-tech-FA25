const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        
        // Use the correct database name from your Compass
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
        console.log('Using URI:', uri);
        
        // For Mongoose 7+, use minimal options
        const conn = await mongoose.connect(uri);
        
        console.log(`✅ MongoDB Connected Successfully!`);
        console.log(`   Database: ${conn.connection.name}`);
        console.log(`   Host: ${conn.connection.host}`);
        console.log(`   Ready State: ${conn.connection.readyState}`);
        
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error('\n🔧 Quick fixes to try:');
        console.error('1. Check if database name matches (ecommerce vs ecommerce_db)');
        console.error('2. Try: mongodb://127.0.0.1:27017/ecommerce');
        console.error('3. Check MongoDB Compass - you should see "ecommerce" database');
        process.exit(1);
    }
};

module.exports = connectDB;