const Product = require('../models/Product');

const productController = {
    // Get all products with pagination and filtering
    getAllProducts: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            
            // Build filter
            let filter = {};
            
            // Category filter
            if (req.query.category && req.query.category !== 'all') {
                filter.category = req.query.category;
            }
            
            // Price range filter
            if (req.query.minPrice || req.query.maxPrice) {
                filter.price = {};
                if (req.query.minPrice) {
                    filter.price.$gte = parseFloat(req.query.minPrice);
                }
                if (req.query.maxPrice) {
                    filter.price.$lte = parseFloat(req.query.maxPrice);
                }
            }
            
            // Search filter
            if (req.query.search) {
                filter.$or = [
                    { name: { $regex: req.query.search, $options: 'i' } },
                    { description: { $regex: req.query.search, $options: 'i' } }
                ];
            }
            
            // Get products with filter
            const products = await Product.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });
            
            // Get total count for pagination
            const totalProducts = await Product.countDocuments(filter);
            const totalPages = Math.ceil(totalProducts / limit);
            
            // Get unique categories for filter dropdown
            const categories = await Product.distinct('category');
            
            res.render('products', {
                title: 'Our Products - BeBuilder',
                page: 'products',
                products,
                currentPage: page,
                totalPages,
                totalProducts,
                limit,
                categories,
                query: req.query
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).render('500', {
                title: 'Server Error - BeBuilder',
                page: '500'
            });
        }
    },
    
    // Get single product
    getProduct: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            
            if (!product) {
                return res.status(404).render('404', {
                    title: 'Product Not Found - BeBuilder',
                    page: '404'
                });
            }
            
            // Get related products
            const relatedProducts = await Product.find({
                category: product.category,
                _id: { $ne: product._id }
            }).limit(4);
            
            res.render('product-detail', {
                title: `${product.name} - BeBuilder`,
                page: 'products',
                product,
                relatedProducts
            });
        } catch (error) {
            console.error('Error fetching product:', error);
            res.status(500).render('500', {
                title: 'Server Error - BeBuilder',
                page: '500'
            });
        }
    },
    
    // Insert sample data (for development)
    insertSampleData: async (req, res) => {
        try {
            const sampleProducts = [
                {
                    name: "Professional Website Design",
                    price: 2999.99,
                    category: "Web Design",
                    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=60",
                    description: "Custom responsive website design with modern UI/UX principles.",
                    featured: true,
                    stock: 5,
                    rating: 4.8
                },
                {
                    name: "E-commerce Development",
                    price: 4999.99,
                    category: "E-commerce",
                    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=60",
                    description: "Complete online store with payment integration and inventory management.",
                    featured: true,
                    stock: 3,
                    rating: 4.9
                },
                {
                    name: "SEO Optimization Package",
                    price: 999.99,
                    category: "Marketing",
                    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=60",
                    description: "Improve your search engine rankings with our comprehensive SEO strategy.",
                    featured: false,
                    stock: 10,
                    rating: 4.6
                },
                {
                    name: "Mobile App Development",
                    price: 5999.99,
                    category: "Development",
                    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=60",
                    description: "Native iOS and Android applications built with React Native.",
                    featured: true,
                    stock: 2,
                    rating: 4.7
                },
                {
                    name: "Brand Identity Design",
                    price: 1499.99,
                    category: "Design",
                    image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&w=800&q=60",
                    description: "Complete branding package including logo, colors, and typography.",
                    featured: false,
                    stock: 8,
                    rating: 4.5
                },
                {
                    name: "Social Media Marketing",
                    price: 799.99,
                    category: "Marketing",
                    image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=800&q=60",
                    description: "Monthly social media management and advertising campaigns.",
                    featured: false,
                    stock: 15,
                    rating: 4.4
                },
                {
                    name: "CMS Development",
                    price: 3499.99,
                    category: "Development",
                    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=60",
                    description: "Custom content management system for easy website updates.",
                    featured: true,
                    stock: 4,
                    rating: 4.8
                },
                {
                    name: "UI/UX Consultation",
                    price: 499.99,
                    category: "Consulting",
                    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=60",
                    description: "Expert review and recommendations for improving user experience.",
                    featured: false,
                    stock: 20,
                    rating: 4.3
                },
                {
                    name: "Web Hosting Package",
                    price: 29.99,
                    category: "Web Design",
                    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&q=60",
                    description: "Reliable hosting with SSL certificate and 24/7 support.",
                    featured: false,
                    stock: 100,
                    rating: 4.2
                },
                {
                    name: "Digital Marketing Strategy",
                    price: 1999.99,
                    category: "Marketing",
                    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=60",
                    description: "Comprehensive digital marketing plan for your business growth.",
                    featured: true,
                    stock: 6,
                    rating: 4.7
                },
                {
                    name: "Custom Plugin Development",
                    price: 899.99,
                    category: "Development",
                    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=60",
                    description: "Custom WordPress plugins to extend your website functionality.",
                    featured: false,
                    stock: 12,
                    rating: 4.5
                },
                {
                    name: "Business Consultation",
                    price: 299.99,
                    category: "Consulting",
                    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=60",
                    description: "One-on-one consultation to optimize your online presence.",
                    featured: false,
                    stock: 25,
                    rating: 4.4
                }
            ];
            
            // Clear existing products
            await Product.deleteMany({});
            
            // Insert sample products
            await Product.insertMany(sampleProducts);
            
            console.log('✅ Sample products inserted successfully');
            res.json({ 
                message: 'Sample data inserted successfully', 
                count: sampleProducts.length 
            });
        } catch (error) {
            console.error('Error inserting sample data:', error);
            res.status(500).json({ error: 'Failed to insert sample data' });
        }
    }
};

module.exports = productController;