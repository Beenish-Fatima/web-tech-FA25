const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Product listing page with pagination and filters
router.get('/', productController.getAllProducts);

// Single product detail page
router.get('/:id', productController.getProduct);

// Insert sample data (development only)
router.get('/insert/sample', productController.insertSampleData);

module.exports = router;