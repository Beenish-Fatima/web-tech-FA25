const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Admin Dashboard
router.get('/admin/dashboard', async (req, res) => {
    try {
        const products = await Product.find();
        const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(5);
        
        // Calculate stats
        const totalProducts = products.length;
        const featuredProducts = products.filter(p => p.featured).length;
        const lowStockProducts = products.filter(p => p.stock < 5).length;
        const averageRating = products.reduce((sum, p) => sum + p.rating, 0) / totalProducts;
        
        // Category stats
        const categoryStats = {};
        products.forEach(product => {
            categoryStats[product.category] = (categoryStats[product.category] || 0) + 1;
        });
        
        res.render('admin/dashboard', {
            title: 'Dashboard',
            stats: {
                totalProducts,
                featuredProducts,
                lowStockProducts,
                averageRating: averageRating || 0
            },
            recentProducts,
            categoryStats
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('admin/dashboard', {
            title: 'Dashboard',
            stats: {
                totalProducts: 0,
                featuredProducts: 0,
                lowStockProducts: 0,
                averageRating: 0
            },
            recentProducts: [],
            categoryStats: {}
        });
    }
});

// Admin Products List
router.get('/admin/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.render('admin/products', {
            title: 'Products',
            products,
            message: req.query.message ? {
                type: 'success',
                text: decodeURIComponent(req.query.message)
            } : null
        });
    } catch (error) {
        console.error('Products list error:', error);
        res.render('admin/products', {
            title: 'Products',
            products: [],
            message: {
                type: 'danger',
                text: 'Error loading products'
            }
        });
    }
});

// Add Product - GET
router.get('/admin/products/add', (req, res) => {
    res.render('admin/add-product', {
        title: 'Add Product',
        message: req.query.message ? {
            type: 'success',
            text: decodeURIComponent(req.query.message)
        } : null
    });
});

// Add Product - POST (CREATE)
router.post('/admin/products', async (req, res) => {
    try {
        const newProduct = new Product({
            name: req.body.name,
            price: parseFloat(req.body.price),
            category: req.body.category,
            image: req.body.image,
            description: req.body.description,
            featured: req.body.featured === 'on',
            stock: parseInt(req.body.stock),
            rating: parseFloat(req.body.rating) || 4.5
        });
        
        await newProduct.save();
        res.redirect('/admin/products?message=' + encodeURIComponent('Product added successfully!'));
    } catch (error) {
        console.error('Add product error:', error);
        res.render('admin/add-product', {
            title: 'Add Product',
            message: {
                type: 'danger',
                text: 'Error adding product: ' + error.message
            }
        });
    }
});

// Edit Product - GET
router.get('/admin/products/edit/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.redirect('/admin/products?message=' + encodeURIComponent('Product not found'));
        }
        
        res.render('admin/edit-product', {
            title: 'Edit Product',
            product,
            message: req.query.message ? {
                type: 'success',
                text: decodeURIComponent(req.query.message)
            } : null
        });
    } catch (error) {
        console.error('Edit product error:', error);
        res.redirect('/admin/products?message=' + encodeURIComponent('Error loading product'));
    }
});

// Update Product - POST (UPDATE)
router.post('/admin/products/update/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.redirect('/admin/products?message=' + encodeURIComponent('Product not found'));
        }
        
        product.name = req.body.name;
        product.price = parseFloat(req.body.price);
        product.category = req.body.category;
        product.image = req.body.image;
        product.description = req.body.description;
        product.featured = req.body.featured === 'on';
        product.stock = parseInt(req.body.stock);
        product.rating = parseFloat(req.body.rating) || product.rating;
        
        await product.save();
        res.redirect('/admin/products?message=' + encodeURIComponent('Product updated successfully!'));
    } catch (error) {
        console.error('Update product error:', error);
        res.redirect(`/admin/products/edit/${req.params.id}?message=` + 
                    encodeURIComponent('Error updating product: ' + error.message));
    }
});

// Delete Product (DELETE)
router.get('/admin/products/delete/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.redirect('/admin/products?message=' + encodeURIComponent('Product not found'));
        }
        
        res.redirect('/admin/products?message=' + encodeURIComponent('Product deleted successfully!'));
    } catch (error) {
        console.error('Delete product error:', error);
        res.redirect('/admin/products?message=' + encodeURIComponent('Error deleting product'));
    }
});

// Admin Logout
router.get('/admin/logout', (req, res) => {
    res.redirect('/');
});

module.exports = router;