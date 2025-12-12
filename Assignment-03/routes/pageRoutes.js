const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const Product = require('../models/Product'); // Import Product model directly

// Define page routes
router.get('/', pageController.home);
router.get('/about', pageController.about);
router.get('/services', pageController.services);
router.get('/testimonials', pageController.testimonials);
router.get('/contact', pageController.contact);

// Simple products route (without separate controller)
router.get('/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
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
        console.error('Error loading products:', error);
        res.status(500).send('Error loading products');
    }
});

// Simple product detail route
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).send('Product not found');
        }
        
        res.render('product-detail', {
            title: `${product.name} - BeBuilder`,
            page: 'products',
            product: product
        });
    } catch (error) {
        console.error('Error loading product:', error);
        res.status(500).send('Error loading product');
    }
});

module.exports = router;