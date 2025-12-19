/**
 * CART MIDDLEWARE
 * Middleware functions for cart validation and processing
 */

// Middleware to check if cart is not empty
const checkCartNotEmpty = (req, res, next) => {
    const cart = req.session.cart || [];
    
    if (cart.length === 0) {
        // Redirect with error message
        return res.redirect('/products/cart/view?error=Your cart is empty. Please add items before proceeding.');
    }
    
    next();
};

// Middleware to prevent duplicate products in cart
const preventDuplicateInCart = (req, res, next) => {
    try {
        const productId = req.params.id;
        const cart = req.session.cart || [];
        
        // Check if product already exists in cart
        const existingItemIndex = cart.findIndex(item => 
            item.productId && item.productId.toString() === productId
        );
        
        if (existingItemIndex > -1) {
            // If product exists, increment quantity instead of adding duplicate
            cart[existingItemIndex].quantity += 1;
            req.session.cart = cart;
            
            // Redirect back with success message
            req.session.message = {
                type: 'success',
                text: 'Product quantity updated in cart'
            };
            
            return res.redirect('back');
        }
        
        // If product not in cart, proceed to add it
        next();
    } catch (error) {
        console.error('Error in preventDuplicateInCart middleware:', error);
        next(error);
    }
};

// Middleware to recalculate cart total on the server
const recalculateCartTotal = (req, res, next) => {
    const cart = req.session.cart || [];
    
    if (cart.length > 0) {
        // Recalculate total for each item and overall total
        let recalculatedCart = [];
        let recalculatedTotal = 0;
        
        cart.forEach(item => {
            // Ensure price and quantity are valid numbers
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 1;
            const itemTotal = price * quantity;
            
            recalculatedCart.push({
                ...item,
                price: price,
                quantity: quantity,
                itemTotal: itemTotal
            });
            
            recalculatedTotal += itemTotal;
        });
        
        // Update session cart with recalculated values
        req.session.cart = recalculatedCart;
        req.session.cartTotal = recalculatedTotal;
        
        // Update locals for views
        res.locals.cartTotal = recalculatedTotal;
        res.locals.cartCount = recalculatedCart.reduce((count, item) => count + item.quantity, 0);
    }
    
    next();
};

// Middleware to handle deleted products in cart
const handleDeletedProducts = async (req, res, next) => {
    try {
        const cart = req.session.cart || [];
        
        if (cart.length > 0) {
            const Product = require('../models/Product');
            const updatedCart = [];
            
            // Check each product in cart
            for (const item of cart) {
                try {
                    const product = await Product.findById(item.productId);
                    
                    if (product && product.stock > 0) {
                        // Product exists and has stock
                        updatedCart.push(item);
                    } else {
                        // Product doesn't exist or out of stock
                        console.log(`Product ${item.productId} not found or out of stock, removing from cart`);
                        
                        // Store removed product info for notification
                        if (!req.session.removedProducts) {
                            req.session.removedProducts = [];
                        }
                        req.session.removedProducts.push(item.productName);
                    }
                } catch (error) {
                    console.error(`Error checking product ${item.productId}:`, error);
                    // Skip this item if there's an error
                }
            }
            
            // Update cart with valid products only
            req.session.cart = updatedCart;
            
            // Show notification if products were removed
            if (req.session.removedProducts && req.session.removedProducts.length > 0) {
                req.session.message = {
                    type: 'warning',
                    text: `Some items were removed from your cart as they are no longer available: ${req.session.removedProducts.join(', ')}`
                };
                delete req.session.removedProducts;
            }
        }
        
        next();
    } catch (error) {
        console.error('Error in handleDeletedProducts middleware:', error);
        next(error);
    }
};

// Middleware to validate checkout form inputs (server-side)
const validateCheckoutInputs = (req, res, next) => {
    const { customerName, customerEmail } = req.body;
    const errors = [];
    
    // Validate customer name
    if (!customerName || customerName.trim().length < 2) {
        errors.push('Please enter a valid name (minimum 2 characters)');
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail || !emailRegex.test(customerEmail)) {
        errors.push('Please enter a valid email address');
    }
    
    if (errors.length > 0) {
        // Store errors in session to display on form
        req.session.checkoutErrors = errors;
        req.session.checkoutFormData = { customerName, customerEmail };
        return res.redirect('/products/checkout');
    }
    
    // Clear any previous errors
    delete req.session.checkoutErrors;
    delete req.session.checkoutFormData;
    
    next();
};

// Middleware to ensure cart integrity before checkout
const ensureCartIntegrity = async (req, res, next) => {
    try {
        const cart = req.session.cart || [];
        
        if (cart.length === 0) {
            return res.redirect('/products/cart/view?error=Cart is empty');
        }
        
        const Product = require('../models/Product');
        let hasIssues = false;
        const issues = [];
        
        // Check each item in cart
        for (const item of cart) {
            const product = await Product.findById(item.productId);
            
            if (!product) {
                issues.push(`${item.productName} is no longer available`);
                hasIssues = true;
            } else if (product.stock < item.quantity) {
                issues.push(`${item.productName} only has ${product.stock} items in stock`);
                hasIssues = true;
            } else if (product.price !== item.price) {
                // Price has changed
                issues.push(`Price for ${item.productName} has been updated`);
                // Update the price in cart
                item.price = product.price;
                hasIssues = true;
            }
        }
        
        if (hasIssues) {
            // Update cart with corrected prices
            req.session.cart = cart;
            
            // Store issues to display to user
            req.session.cartIssues = issues;
            req.session.message = {
                type: 'warning',
                text: 'Please review your cart before checkout'
            };
            
            return res.redirect('/products/cart/view');
        }
        
        // Clear any previous issues
        delete req.session.cartIssues;
        
        next();
    } catch (error) {
        console.error('Error in ensureCartIntegrity middleware:', error);
        next(error);
    }
};

module.exports = {
    checkCartNotEmpty,
    preventDuplicateInCart,
    recalculateCartTotal,
    handleDeletedProducts,
    validateCheckoutInputs,
    ensureCartIntegrity
};