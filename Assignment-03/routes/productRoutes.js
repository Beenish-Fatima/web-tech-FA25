const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Product listing page with filters
router.get('/products', productController.getAllProducts);

// Single product page
router.get('/products/:id', productController.getProductById);

// API endpoint for AJAX requests
router.get('/api/products', productController.getProductsAPI);

module.exports = router;