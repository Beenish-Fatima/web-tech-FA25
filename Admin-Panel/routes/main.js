const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Home page
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().limit(4).sort({ createdAt: -1 });
        res.render('main/home', {
            title: 'Home - E-commerce Store',
            products
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Products page
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.render('main/products', {
            title: 'Products - E-commerce Store',
            products
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Product detail page
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.render('main/product-detail', {
            title: product.name + ' - E-commerce Store',
            product
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;