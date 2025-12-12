const Product = require('../models/Product');

// Get all products with pagination and filtering
exports.getAllProducts = async (req, res) => {
    try {
        console.log('Fetching products...');
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;
        
        // Build filter object
        const filter = {};
        
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
        
        // Search by name
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' };
        }
        
        console.log('Filter:', filter);
        
        // Get products with filters
        const products = await Product.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        
        console.log(`Found ${products.length} products`);
        
        // Get total count for pagination
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);
        
        // Get unique categories for filter dropdown
        const categories = await Product.distinct('category');
        
        res.render('products', {
            title: 'Our Products - BeBuilder',
            page: 'products',
            products: products,
            currentPage: page,
            totalPages: totalPages,
            totalProducts: totalProducts,
            categories: categories,
            query: req.query
        });
        
    } catch (error) {
        console.error('❌ Error in getAllProducts:', error);
        
        // Send simple error response
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error - BeBuilder</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 50px; text-align: center; }
                    h1 { color: #e74c3c; }
                    pre { background: #f9f9f9; padding: 20px; border-radius: 5px; text-align: left; }
                    .btn { display: inline-block; background: #f1c40f; color: #111; 
                           padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <h1>Error Loading Products</h1>
                <p>There was an error loading products from the database.</p>
                <pre>${error.message}</pre>
                <a href="/" class="btn">Go Home</a>
                <a href="/products" class="btn" style="background: #3498db; margin-left: 10px;">Try Again</a>
            </body>
            </html>
        `);
    }
};

// Get single product
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).render('404', { 
                title: 'Product Not Found - BeBuilder',
                page: 'products'
            });
        }
        
        res.render('product-detail', {
            title: `${product.name} - BeBuilder`,
            page: 'products',
            product: product
        });
        
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).render('500', { 
            title: 'Error - BeBuilder',
            page: 'error'
        });
    }
};

// API: Get products (for AJAX requests)
exports.getProductsAPI = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const filter = {};
        if (req.query.category && req.query.category !== 'all') {
            filter.category = req.query.category;
        }
        
        const products = await Product.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);
        
        res.json({
            success: true,
            products: products,
            currentPage: page,
            totalPages: totalPages,
            totalProducts: totalProducts
        });
    } catch (error) {
        console.error('Error in API:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
};

// If you don't need the API endpoint, you can remove it
// and remove the corresponding route in productRoutes.js