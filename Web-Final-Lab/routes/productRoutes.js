const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// ========== PRODUCT LISTING ==========
router.get('/', productController.getAllProducts);

// ========== CART ROUTES ==========
router.get('/cart/view', productController.viewCart);
router.post('/cart/update', productController.updateCart);
router.post('/cart/remove/:id', productController.removeFromCart);

// ========== CHECKOUT ROUTES ==========
router.get('/checkout', productController.getCheckout);
router.post('/checkout/process', productController.processCheckout);

// ========== ORDER CONFIRMATION ==========
router.get('/order-confirmation/:orderId', productController.orderConfirmation);

// ========== SAMPLE DATA ==========
router.get('/insert/sample', productController.insertSampleData);

// ========== ADD TO CART ==========
// IMPORTANT: This must come before :id route
router.post('/add-to-cart/:productId', productController.addToCart);

// ========== PRODUCT DETAIL ==========
// THIS MUST BE LAST - it catches all other /products/* routes
router.get('/:id', productController.getProduct);

module.exports = router;