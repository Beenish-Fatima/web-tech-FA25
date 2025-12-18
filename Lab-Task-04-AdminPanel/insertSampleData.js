const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

console.log('🔍 Starting script...');
console.log('🔍 Environment:', process.env.NODE_ENV);
console.log('🔍 MongoDB URI:', process.env.MONGODB_URI);

const sampleProducts = [
    {
        name: "Professional Website Design",
        price: 2999.99,
        category: "Web Design",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=60",
        description: "Custom responsive website design with modern UI/UX principles. We create beautiful, user-friendly websites that work perfectly on all devices. Includes 3 design revisions and mobile optimization.",
        featured: true,
        stock: 5,
        rating: 4.8
    },
    {
        name: "E-commerce Development",
        price: 4999.99,
        category: "E-commerce",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=60",
        description: "Complete online store with payment integration and inventory management. Includes shopping cart, user accounts, admin dashboard, and integration with popular payment gateways.",
        featured: true,
        stock: 3,
        rating: 4.9
    },
    {
        name: "SEO Optimization Package",
        price: 999.99,
        category: "Marketing",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=60",
        description: "Improve your search engine rankings with our comprehensive SEO strategy. Includes keyword research, on-page optimization, technical SEO audit, and monthly performance reports.",
        featured: false,
        stock: 10,
        rating: 4.6
    },
    {
        name: "Mobile App Development",
        price: 5999.99,
        category: "Development",
        image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=60",
        description: "Native iOS and Android applications built with React Native. Cross-platform development that provides native performance with code reusability. Includes backend API integration.",
        featured: true,
        stock: 2,
        rating: 4.7
    },
    {
        name: "Brand Identity Design",
        price: 1499.99,
        category: "Design",
        image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&w=800&q=60",
        description: "Complete branding package including logo, colors, and typography. We create a cohesive visual identity that represents your brand values and appeals to your target audience.",
        featured: false,
        stock: 8,
        rating: 4.5
    },
    {
        name: "Social Media Marketing",
        price: 799.99,
        category: "Marketing",
        image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=800&q=60",
        description: "Monthly social media management and advertising campaigns. We create engaging content, manage your social media presence, and run targeted ad campaigns to grow your audience.",
        featured: false,
        stock: 15,
        rating: 4.4
    },
    {
        name: "CMS Development",
        price: 3499.99,
        category: "Development",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=60",
        description: "Custom content management system for easy website updates. We build a user-friendly admin panel that allows you to manage content without technical knowledge.",
        featured: true,
        stock: 4,
        rating: 4.8
    },
    {
        name: "UI/UX Consultation",
        price: 499.99,
        category: "Consulting",
        image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=60",
        description: "Expert review and recommendations for improving user experience. We analyze your current design and provide actionable insights to enhance usability and conversion rates.",
        featured: false,
        stock: 20,
        rating: 4.3
    },
    {
        name: "Web Hosting Package",
        price: 29.99,
        category: "Web Design",
        image: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&q=60",
        description: "Reliable hosting with SSL certificate and 24/7 support. Our hosting packages include automatic backups, security monitoring, and 99.9% uptime guarantee.",
        featured: false,
        stock: 100,
        rating: 4.2
    },
    {
        name: "Digital Marketing Strategy",
        price: 1999.99,
        category: "Marketing",
        image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=60",
        description: "Comprehensive digital marketing plan for your business growth. We develop a customized strategy that includes SEO, content marketing, social media, and email marketing.",
        featured: true,
        stock: 6,
        rating: 4.7
    },
    {
        name: "Custom Plugin Development",
        price: 899.99,
        category: "Development",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=60",
        description: "Custom WordPress plugins to extend your website functionality. We build secure, efficient plugins that add specific features to meet your business needs.",
        featured: false,
        stock: 12,
        rating: 4.5
    },
    {
        name: "Business Consultation",
        price: 299.99,
        category: "Consulting",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=60",
        description: "One-on-one consultation to optimize your online presence. We review your current digital strategy and provide recommendations for improvement and growth.",
        featured: false,
        stock: 25,
        rating: 4.4
    }
];

async function insertData() {
    try {
        console.log('🔄 Attempting to connect to MongoDB...');
        
        // Connect to MongoDB - REMOVE the old options
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bebuilder');
        
        console.log('✅ Connected to MongoDB successfully');
        
        // Test connection
        const db = mongoose.connection;
        console.log('📊 Database name:', db.name);
        console.log('📊 Host:', db.host);
        console.log('📊 Port:', db.port);
        
        // Clear existing products
        console.log('🔄 Clearing existing products...');
        const deleteResult = await Product.deleteMany({});
        console.log(`✅ Cleared ${deleteResult.deletedCount} existing products`);
        
        // Insert sample products
        console.log('🔄 Inserting sample products...');
        const result = await Product.insertMany(sampleProducts);
        console.log(`✅ Successfully inserted ${result.length} sample products`);
        
        // Show some inserted data
        console.log('\n📦 Sample of inserted products:');
        result.slice(0, 3).forEach(product => {
            console.log(`   - ${product.name} ($${product.price})`);
        });
        
        // Close connection
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error details:');
        console.error('   Message:', error.message);
        console.error('   Name:', error.name);
        console.error('   Stack:', error.stack);
        
        if (error.name === 'MongoServerSelectionError') {
            console.error('\n💡 MongoDB is not running. Start it with:');
            console.error('   Windows: net start MongoDB');
            console.error('   Or open MongoDB Compass and ensure service is running');
        } else if (error.name === 'MongooseError') {
            console.error('\n💡 Mongoose connection error.');
        } else if (error.name === 'MongoParseError') {
            console.error('\n💡 MongoDB connection string parse error.');
        }
        
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('⚠️ Unhandled Promise Rejection:', error);
    process.exit(1);
});

insertData();