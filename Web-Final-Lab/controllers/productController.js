const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');

const productController = {
    // ========== PRODUCT FUNCTIONS ==========
    
    // Get all products with pagination and filtering
    getAllProducts: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            const skip = (page - 1) * limit;
            
            // Build filter
            const filter = {};
            if (req.query.category) {
                filter.category = req.query.category;
            }
            if (req.query.search) {
                filter.$or = [
                    { name: { $regex: req.query.search, $options: 'i' } },
                    { description: { $regex: req.query.search, $options: 'i' } }
                ];
            }
            
            // Get products
            const products = await Product.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });
            
            // Get total count for pagination
            const totalProducts = await Product.countDocuments(filter);
            const totalPages = Math.ceil(totalProducts / limit);
            
            res.render('products', {
                title: 'Products - BeBuilder',
                page: 'products',
                products,
                currentPage: page,
                totalPages,
                totalProducts,
                category: req.query.category,
                search: req.query.search
            });
        } catch (error) {
            console.error('Error getting products:', error);
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
                _id: { $ne: product._id },
                category: product.category
            }).limit(4);
            
            res.render('product-detail', {
                title: `${product.name} - BeBuilder`,
                page: 'product-detail',
                product,
                relatedProducts
            });
        } catch (error) {
            console.error('Error getting product:', error);
            res.status(500).render('500', {
                title: 'Server Error - BeBuilder',
                page: '500'
            });
        }
    },
    
    // ========== CART FUNCTIONS ==========
    
    // Add to cart
    addToCart: async (req, res) => {
        try {
            const productId = req.params.id;
            const quantity = parseInt(req.body.quantity) || 1;
            
            const product = await Product.findById(productId);
            
            if (!product) {
                req.session.message = {
                    type: 'error',
                    text: 'Product not found'
                };
                return res.redirect('/products');
            }
            
            // Initialize cart if not exists
            if (!req.session.cart) {
                req.session.cart = [];
            }
            
            // Check if product already in cart
            const existingItemIndex = req.session.cart.findIndex(
                item => item.productId === productId
            );
            
            if (existingItemIndex > -1) {
                // Update quantity
                req.session.cart[existingItemIndex].quantity += quantity;
            } else {
                // Add new item
                req.session.cart.push({
                    productId: product._id.toString(),
                    productName: product.name,
                    price: product.price,
                    quantity: quantity,
                    image: product.image || '/images/default-product.jpg'
                });
            }
            
            req.session.message = {
                type: 'success',
                text: `${product.name} added to cart`
            };
            
            res.redirect('/products/cart/view');
        } catch (error) {
            console.error('Error adding to cart:', error);
            req.session.message = {
                type: 'error',
                text: 'Error adding item to cart'
            };
            res.redirect('/products');
        }
    },
    
    // View cart
    viewCart: (req, res) => {
        try {
            const cart = req.session.cart || [];
            let cartTotal = 0;
            let cartCount = 0;
            
            // Calculate totals
            cart.forEach(item => {
                const price = parseFloat(item.price) || 0;
                const quantity = parseInt(item.quantity) || 1;
                cartTotal += price * quantity;
                cartCount += quantity;
            });
            
            res.render('cart', {
                title: 'Shopping Cart - BeBuilder',
                page: 'cart',
                cartItems: cart,
                cartTotal: cartTotal.toFixed(2),
                cartCount: cartCount,
                message: req.session.message
            });
            
            // Clear message
            delete req.session.message;
        } catch (error) {
            console.error('Error viewing cart:', error);
            res.status(500).render('500', {
                title: 'Server Error - BeBuilder',
                page: '500'
            });
        }
    },
    
    // Update cart quantity
    updateCart: (req, res) => {
        try {
            const { productId, quantity } = req.body;
            
            if (!req.session.cart) {
                return res.redirect('/products/cart/view');
            }
            
            const itemIndex = req.session.cart.findIndex(
                item => item.productId === productId
            );
            
            if (itemIndex > -1) {
                if (quantity > 0) {
                    req.session.cart[itemIndex].quantity = parseInt(quantity);
                } else {
                    // Remove if quantity is 0 or negative
                    req.session.cart.splice(itemIndex, 1);
                }
                
                req.session.message = {
                    type: 'success',
                    text: 'Cart updated'
                };
            }
            
            res.redirect('/products/cart/view');
        } catch (error) {
            console.error('Error updating cart:', error);
            req.session.message = {
                type: 'error',
                text: 'Error updating cart'
            };
            res.redirect('/products/cart/view');
        }
    },
    
    // Remove from cart
    removeFromCart: (req, res) => {
        try {
            const productId = req.params.id;
            
            if (req.session.cart) {
                const initialLength = req.session.cart.length;
                req.session.cart = req.session.cart.filter(
                    item => item.productId !== productId
                );
                
                if (req.session.cart.length < initialLength) {
                    req.session.message = {
                        type: 'success',
                        text: 'Item removed from cart'
                    };
                }
            }
            
            res.redirect('/products/cart/view');
        } catch (error) {
            console.error('Error removing from cart:', error);
            req.session.message = {
                type: 'error',
                text: 'Error removing item from cart'
            };
            res.redirect('/products/cart/view');
        }
    },
    
    // ========== CHECKOUT FUNCTIONS ==========
    
    getCheckout: (req, res) => {
        console.log('🛒 Loading checkout page');
        
        try {
            const cart = req.session.cart || [];
            
            if (cart.length === 0) {
                req.session.message = {
                    type: 'error',
                    text: 'Your cart is empty'
                };
                return res.redirect('/products/cart/view');
            }
            
            // Calculate total
            let cartTotal = 0;
            let cartCount = 0;
            
            for (let item of cart) {
                const price = parseFloat(item.price) || 0;
                const quantity = parseInt(item.quantity) || 1;
                cartTotal += price * quantity;
                cartCount += quantity;
            }
            
            console.log('💰 Cart total:', cartTotal);
            console.log('🔢 Cart count:', cartCount);
            
            res.render('checkout', {
                title: 'Checkout - BeBuilder',
                page: 'checkout',
                cartItems: cart,
                cartTotal: cartTotal.toFixed(2),
                cartCount: cartCount,
                message: req.session.message
            });
            
            // Clear any existing messages
            delete req.session.message;
            
        } catch (error) {
            console.error('❌ Error loading checkout:', error);
            res.status(500).render('500', {
                title: 'Server Error - BeBuilder',
                page: '500',
                error: error.message
            });
        }
    },
    
    processCheckout: async (req, res) => {
        console.log('💳 ========== PROCESS CHECKOUT START ==========');
        console.log('📦 Request body:', req.body);
        
        try {
            const { customerName, customerEmail, customerPhone, shippingAddress, paymentMethod, notes } = req.body;
            const cart = req.session.cart || [];
            
            // Validate cart
            if (cart.length === 0) {
                console.log('❌ Cart is empty');
                req.session.message = { 
                    type: 'error', 
                    text: 'Your cart is empty' 
                };
                return res.redirect('/products/cart/view');
            }
            
            // Validate required fields
            if (!customerName || !customerEmail) {
                console.log('❌ Missing required fields');
                req.session.message = { 
                    type: 'error', 
                    text: 'Name and email are required' 
                };
                return res.redirect('/products/checkout');
            }
            
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
                console.log('❌ Invalid email:', customerEmail);
                req.session.message = { 
                    type: 'error', 
                    text: 'Please enter a valid email address' 
                };
                return res.redirect('/products/checkout');
            }
            
            // Calculate total
            const cartTotal = cart.reduce((total, item) => {
                const price = parseFloat(item.price) || 0;
                const quantity = parseInt(item.quantity) || 1;
                return total + (price * quantity);
            }, 0);
            
            console.log('💰 Order total:', cartTotal);
            console.log('📦 Order items:', cart.length);
            
            // Generate temporary order number (will be replaced by pre-save hook)
            const tempOrderNumber = 'TEMP-' + Date.now();
            
            // Prepare items for order
            const orderItems = cart.map(item => {
                // Always create a new ObjectId for each product
                const productId = new mongoose.Types.ObjectId();
                
                return {
                    productId: productId,
                    productName: item.name || item.productName || 'Unknown Product',
                    quantity: parseInt(item.quantity) || 1,
                    price: parseFloat(item.price) || 0,
                    image: item.image || '/images/default-product.jpg'
                };
            });
            
            console.log('📝 Creating order data...');
            
            // Create order data - MUST include orderNumber (required by schema)
            const orderData = {
                orderNumber: tempOrderNumber, // Required field
                customerName: customerName.trim(),
                customerEmail: customerEmail.trim().toLowerCase(),
                items: orderItems,
                totalAmount: cartTotal,
                status: 'Pending'
            };
            
            // Add optional fields only if they exist
            if (customerPhone && customerPhone.trim()) {
                orderData.customerPhone = customerPhone.trim();
            }
            if (shippingAddress && shippingAddress.trim()) {
                orderData.shippingAddress = shippingAddress.trim();
            }
            if (paymentMethod && paymentMethod.trim()) {
                orderData.paymentMethod = paymentMethod;
            }
            if (notes && notes.trim()) {
                orderData.notes = notes.trim();
            }
            
            console.log('📄 Order data prepared');
            console.log('• Customer:', orderData.customerName);
            console.log('• Email:', orderData.customerEmail);
            console.log('• Items:', orderData.items.length);
            console.log('• Total:', orderData.totalAmount);
            
            // Create order instance
            const order = new Order(orderData);
            
            // Validate before saving
            const validationError = order.validateSync();
            if (validationError) {
                console.error('❌ Order validation failed:', validationError.errors);
                throw new Error(`Validation failed: ${JSON.stringify(validationError.errors)}`);
            }
            
            console.log('✅ Order validation passed');
            
            // Save the order
            const savedOrder = await order.save();
            console.log('✅ Order saved successfully!');
            console.log('📋 Order ID:', savedOrder._id);
            console.log('🔢 Order Number:', savedOrder.orderNumber);
            console.log('📅 Created:', savedOrder.createdAt);
            
            // Clear cart
            const cartSize = req.session.cart?.length || 0;
            req.session.cart = [];
            console.log('🗑️ Cleared cart. Removed', cartSize, 'items');
            
            // Store order info in session
            req.session.lastOrderId = savedOrder._id.toString();
            req.session.lastOrderNumber = savedOrder.orderNumber;
            
            // Set success message
            req.session.message = {
                type: 'success',
                text: `Order #${savedOrder.orderNumber} placed successfully!`
            };
            
            // Redirect to confirmation
            console.log('➡️ Redirecting to order confirmation');
            console.log('🎉 ========== CHECKOUT COMPLETE ==========');
            
            res.redirect(`/products/order-confirmation/${savedOrder._id}`);
            
        } catch (error) {
            console.error('❌ ========== CHECKOUT ERROR ==========');
            console.error('🔤 Error name:', error.name);
            console.error('💬 Error message:', error.message);
            console.error('📝 Error stack:', error.stack);
            
            if (error.name === 'ValidationError' && error.errors) {
                console.error('📋 Validation errors:', error.errors);
                const messages = Object.values(error.errors).map(err => err.message);
                req.session.message = { 
                    type: 'error', 
                    text: `Please check your information: ${messages.join(', ')}` 
                };
            } else if (error.code === 11000) {
                console.error('🔑 Duplicate order number error');
                req.session.message = { 
                    type: 'error', 
                    text: 'There was an issue with your order. Please try again.' 
                };
            } else {
                req.session.message = { 
                    type: 'error', 
                    text: `Error processing order: ${error.message}` 
                };
            }
            
            res.redirect('/products/checkout');
        }
    },
    
    orderConfirmation: async (req, res) => {
        console.log('📄 Loading order confirmation');
        console.log('📦 Order ID:', req.params.id);
        
        try {
            const orderId = req.params.id;
            
            // Try to get order from database
            const order = await Order.findById(orderId);
            
            if (!order) {
                console.log('❌ Order not found in database');
                
                // Try session fallback
                const sessionOrderId = req.session.lastOrderId;
                if (sessionOrderId && sessionOrderId !== orderId) {
                    console.log('🔄 Trying session order ID:', sessionOrderId);
                    return res.redirect(`/products/order-confirmation/${sessionOrderId}`);
                }
                
                return res.status(404).render('404', {
                    title: 'Order Not Found - BeBuilder',
                    page: '404',
                    message: 'Order not found. It may have been deleted or never existed.'
                });
            }
            
            console.log('✅ Order found!');
            console.log('🔢 Order Number:', order.orderNumber);
            console.log('👤 Customer:', order.customerName);
            console.log('💰 Total:', order.totalAmount);
            console.log('📅 Date:', order.createdAt);
            
            // Calculate item subtotals
            const itemsWithSubtotals = order.items.map(item => {
                const subtotal = (item.quantity * item.price).toFixed(2);
                return {
                    ...item.toObject(),
                    subtotal: subtotal,
                    formattedPrice: `$${item.price.toFixed(2)}`,
                    formattedSubtotal: `$${subtotal}`
                };
            });
            
            // Format order for display
            const displayOrder = {
                _id: order._id,
                orderNumber: order.orderNumber,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                customerPhone: order.customerPhone || 'Not provided',
                shippingAddress: order.shippingAddress || 'Not provided',
                paymentMethod: order.paymentMethod || 'Cash on Delivery',
                items: itemsWithSubtotals,
                totalAmount: order.totalAmount.toFixed(2),
                formattedTotal: `$${order.totalAmount.toFixed(2)}`,
                status: order.status,
                formattedDate: order.createdAt ? order.createdAt.toLocaleDateString() : 'Unknown date',
                createdAt: order.createdAt,
                notes: order.notes || ''
            };
            
            res.render('order-confirmation', {
                title: 'Order Confirmation - BeBuilder',
                page: 'order-confirmation',
                order: displayOrder,
                success: true,
                message: req.session.message
            });
            
            // Clear message after displaying
            delete req.session.message;
            
        } catch (error) {
            console.error('❌ Error loading order confirmation:', error);
            res.status(500).render('500', {
                title: 'Server Error - BeBuilder',
                page: '500',
                error: error.message
            });
        }
    },
    
    // ========== DEVELOPMENT FUNCTIONS ==========
    
    // Insert sample data
    insertSampleData: async (req, res) => {
        try {
            // Clear existing data
            await Product.deleteMany({});
            
            // Sample products
            const sampleProducts = [
                {
                    name: "BeBuilder Pro Theme",
                    description: "Professional WordPress theme for builders and contractors",
                    price: 49.99,
                    category: "Themes",
                    stock: 100,
                    image: "/images/theme-pro.jpg",
                    features: ["Responsive Design", "SEO Optimized", "Page Builder Included"]
                },
                {
                    name: "Construction Plugin Bundle",
                    description: "Essential plugins for construction company websites",
                    price: 29.99,
                    category: "Plugins",
                    stock: 50,
                    image: "/images/plugin-bundle.jpg",
                    features: ["Project Showcase", "Team Management", "Client Testimonials"]
                },
                {
                    name: "Builder Portfolio Template",
                    description: "Showcase your construction projects beautifully",
                    price: 39.99,
                    category: "Templates",
                    stock: 75,
                    image: "/images/portfolio-template.jpg",
                    features: ["Gallery Layout", "Project Filtering", "Client Login"]
                },
                {
                    name: "Estimate Calculator Plugin",
                    description: "Generate professional estimates for construction projects",
                    price: 19.99,
                    category: "Plugins",
                    stock: 30,
                    image: "/images/calculator-plugin.jpg",
                    features: ["Custom Formulas", "PDF Export", "Client Portal"]
                },
                {
                    name: "Contractor Business Theme",
                    description: "Complete solution for contractor business websites",
                    price: 59.99,
                    category: "Themes",
                    stock: 60,
                    image: "/images/business-theme.jpg",
                    features: ["Appointment Booking", "Service Pages", "Mobile Optimized"]
                }
            ];
            
            await Product.insertMany(sampleProducts);
            
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Sample Data Inserted</title>
                    <style>
                        body { font-family: Arial; padding: 20px; }
                        .success { color: green; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>✅ Sample Data Inserted Successfully!</h1>
                    <p class="success">${sampleProducts.length} products added to database.</p>
                    <p><a href="/products">View Products</a></p>
                    <p><a href="/">Go Home</a></p>
                </body>
                </html>
            `);
        } catch (error) {
            console.error('Error inserting sample data:', error);
            res.status(500).send('Error inserting sample data: ' + error.message);
        }
    }
};

module.exports = productController;