const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Admin Dashboard
router.get('/', async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalStock = await Product.aggregate([
            { $group: { _id: null, total: { $sum: "$stock" } } }
        ]);
        
        res.render('admin/dashboard', {
            title: 'Dashboard',
            currentPage: 'dashboard',
            totalProducts: totalProducts || 0,
            totalStock: totalStock[0]?.total || 0
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('Error loading dashboard');
    }
});

// Products List
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.render('admin/products', {
            title: 'Products Management',
            currentPage: 'products',
            products 
        });
    } catch (error) {
        console.error('Products list error:', error);
        res.status(500).send('Error loading products');
    }
});

// Add Product Form
router.get('/products/add', (req, res) => {
    res.render('admin/add-product', {
        title: 'Add Product',
        currentPage: 'add-product'
    });
});

// Create Product
router.post('/products', async (req, res) => {
    try {
        await Product.create(req.body);
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).send('Error adding product');
    }
});

// Edit Product Form
router.get('/products/edit/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.render('admin/edit-product', {
            title: 'Edit Product',
            currentPage: 'products',
            product 
        });
    } catch (error) {
        console.error('Edit product error:', error);
        res.status(500).send('Error loading product');
    }
});

// Update Product
router.put('/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).send('Error updating product');
    }
});

// Delete Product
router.delete('/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).send('Error deleting product');
    }
});

module.exports = router;