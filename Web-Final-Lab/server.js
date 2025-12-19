const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting BeBuilder Server...');
console.log('📁 Current directory:', __dirname);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bebuilder')
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Serve static files
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'bebuilder-secret-key-2024',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Initialize cart middleware - FIXED VERSION
app.use((req, res, next) => {
    try {
        // Ensure cart exists and is an array
        if (!req.session.cart || !Array.isArray(req.session.cart)) {
            req.session.cart = [];
        }
        
        const cart = req.session.cart;
        
        // Calculate cart total
        let cartTotal = 0;
        let cartCount = 0;
        
        cart.forEach(item => {
            if (item && typeof item === 'object') {
                const price = parseFloat(item.price) || 0;
                const quantity = parseInt(item.quantity) || 1;
                cartTotal += price * quantity;
                cartCount += quantity;
            }
        });
        
        // Update res.locals for use in templates
        res.locals.cartTotal = cartTotal.toFixed(2);
        res.locals.cartCount = cartCount;
        res.locals.cartItems = cart;
        
    } catch (error) {
        console.error('Error in cart middleware:', error);
        // Set safe defaults
        res.locals.cartTotal = '0.00';
        res.locals.cartCount = 0;
        res.locals.cartItems = [];
        req.session.cart = [];
    }
    
    next();
});

// Debug middleware
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`📡 ${req.method} ${req.originalUrl}`);
        console.log('🛒 Cart items:', req.session.cart?.length || 0);
        next();
    });
}

console.log('\n🔧 Loading routes...');

// Import routes FIRST
const pageRoutes = require('./routes/pageRoutes');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');

console.log('✅ pageRoutes loaded');
console.log('✅ productRoutes loaded');
console.log('✅ adminRoutes loaded');

// Use routes BEFORE custom routes
app.use('/', pageRoutes);
app.use('/products', productRoutes);
app.use('/admin', adminRoutes);

console.log('✅ All routes mounted\n');

// ========== TEST ROUTES ==========

// Test session
app.get('/test-session', (req, res) => {
    res.json({
        sessionId: req.sessionID,
        cart: req.session.cart,
        locals: {
            cartCount: res.locals.cartCount,
            cartTotal: res.locals.cartTotal
        }
    });
});

// Debug routes
app.get('/debug-routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    const route = handler.route;
                    routes.push({
                        path: route.path,
                        methods: Object.keys(route.methods)
                    });
                }
            });
        }
    });
    
    res.json({
        totalRoutes: routes.length,
        routes: routes.filter(r => r.path.includes('cart') || r.path.includes('checkout') || r.path.includes('order'))
    });
});

// Test database connection
app.get('/test-db', async (req, res) => {
    try {
        const Product = require('./models/Product');
        const Order = require('./models/Order');
        const products = await Product.find();
        const orders = await Order.find();
        
        res.json({
            dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            productsCount: products.length,
            ordersCount: orders.length,
            cart: req.session.cart,
            cartCount: res.locals.cartCount
        });
    } catch (error) {
        res.status(500).json({ 
            error: true,
            message: error.message,
            details: error.stack
        });
    }
});

// SIMPLE CHECKOUT TEST ROUTE
app.post('/test-simple-checkout', async (req, res) => {
    console.log('🧪 ========== TEST SIMPLE CHECKOUT START ==========');
    console.log('📦 Request body:', req.body);
    
    try {
        const Order = require('./models/Order');
        const mongoose = require('mongoose');
        
        console.log('🔍 Step 1: Loading Order model...');
        console.log('📊 Order model type:', typeof Order);
        
        console.log('🔍 Step 2: Creating simple order...');
        // Create simplest possible order
        const orderData = {
            customerName: req.body.name || 'Test Customer',
            customerEmail: req.body.email || 'test@example.com',
            items: [{
                productId: new mongoose.Types.ObjectId(),
                productName: 'Test Product',
                quantity: 1,
                price: 10.00
            }],
            totalAmount: 10.00
        };
        
        console.log('📄 Order data:', orderData);
        
        console.log('🔍 Step 3: Creating Order instance...');
        const order = new Order(orderData);
        
        console.log('🔍 Step 4: Validating order...');
        const validationError = order.validateSync();
        if (validationError) {
            console.error('❌ Validation failed:', validationError.errors);
            return res.status(400).json({
                error: 'Validation failed',
                details: validationError.errors
            });
        }
        
        console.log('✅ Validation passed');
        
        console.log('🔍 Step 5: Saving order...');
        const savedOrder = await order.save();
        
        console.log('✅ SAVED SUCCESSFULLY!');
        console.log('📋 Order ID:', savedOrder._id);
        console.log('🔢 Order Number:', savedOrder.orderNumber);
        
        // Clean up test order
        await Order.deleteOne({ _id: savedOrder._id });
        console.log('🧹 Test order cleaned up');
        
        console.log('🎉 ========== TEST CHECKOUT COMPLETE ==========');
        
        res.json({
            success: true,
            message: 'Test checkout successful!',
            orderId: savedOrder._id,
            orderNumber: savedOrder.orderNumber,
            testNote: 'Order was created and deleted for testing'
        });
        
    } catch (error) {
        console.error('❌ ========== TEST CHECKOUT FAILED ==========');
        console.error('🔤 Error name:', error.name);
        console.error('💬 Error message:', error.message);
        console.error('🔢 Error code:', error.code);
        console.error('📝 Error stack:', error.stack);
        
        if (error.errors) {
            console.error('📋 Validation errors:', error.errors);
        }
        if (error.keyValue) {
            console.error('🔑 Duplicate key:', error.keyValue);
        }
        
        res.status(500).json({
            error: true,
            name: error.name,
            message: error.message,
            details: error.errors || error.keyValue || 'No additional details'
        });
    }
});

// HTML test form for simple checkout
app.get('/test-checkout-form', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Test Checkout Form</title>
            <style>
                body { font-family: Arial; padding: 20px; max-width: 500px; margin: 0 auto; }
                .form-group { margin: 15px 0; }
                label { display: block; margin-bottom: 5px; }
                input { width: 100%; padding: 8px; box-sizing: border-box; }
                button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
                button:hover { background: #0056b3; }
                .result { margin-top: 20px; padding: 15px; border-radius: 5px; }
                .success { background: #d4edda; color: #155724; }
                .error { background: #f8d7da; color: #721c24; }
            </style>
        </head>
        <body>
            <h1>🧪 Test Checkout Form</h1>
            <p>This directly tests the Order model without any cart logic.</p>
            
            <form id="checkoutForm">
                <div class="form-group">
                    <label>Name:</label>
                    <input type="text" name="name" value="John Doe" required>
                </div>
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" name="email" value="john@example.com" required>
                </div>
                <button type="submit">Test Checkout</button>
            </form>
            
            <div id="result" class="result"></div>
            
            <script>
                document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const formData = new FormData(e.target);
                    const data = Object.fromEntries(formData.entries());
                    
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = '<p>Testing... Please wait.</p>';
                    resultDiv.className = 'result';
                    
                    try {
                        const response = await fetch('/test-simple-checkout', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            resultDiv.innerHTML = \`
                                <h3>✅ Test Successful!</h3>
                                <p><strong>Order Number:</strong> \${result.orderNumber}</p>
                                <p><strong>Message:</strong> \${result.message}</p>
                                <p><small>\${result.testNote}</small></p>
                            \`;
                            resultDiv.className = 'result success';
                        } else {
                            resultDiv.innerHTML = \`
                                <h3>❌ Test Failed</h3>
                                <p><strong>Error:</strong> \${result.name || 'Unknown'}</p>
                                <p><strong>Message:</strong> \${result.message}</p>
                                <pre>\${JSON.stringify(result.details, null, 2)}</pre>
                            \`;
                            resultDiv.className = 'result error';
                        }
                    } catch (error) {
                        resultDiv.innerHTML = \`
                            <h3>❌ Request Failed</h3>
                            <p>\${error.message}</p>
                        \`;
                        resultDiv.className = 'result error';
                    }
                });
            </script>
            
            <h3>Quick Links:</h3>
            <ul>
                <li><a href="/test-db">Test Database Connection</a></li>
                <li><a href="/debug-routes">Debug Routes</a></li>
                <li><a href="/test-session">Test Session</a></li>
                <li><a href="/products/checkout">Real Checkout Page</a></li>
            </ul>
        </body>
        </html>
    `);
});

// 404 handler - MUST BE LAST
app.use((req, res) => {
    console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
    res.status(404).render('404', { 
        title: 'Page Not Found',
        url: req.originalUrl 
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ ========== SERVER ERROR ==========');
    console.error('📅 Time:', new Date().toISOString());
    console.error('🌐 URL:', req.originalUrl);
    console.error('📋 Method:', req.method);
    console.error('🔤 Error name:', err.name);
    console.error('💬 Error message:', err.message);
    console.error('🔢 Error code:', err.code);
    console.error('📝 Error stack:', err.stack);
    
    if (err.errors) {
        console.error('📋 Validation errors:', err.errors);
    }
    
    res.status(500).render('500', { 
        title: 'Server Error',
        error: err.message,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : null
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                    🚀 SERVER RUNNING                     ║
╠══════════════════════════════════════════════════════════╣
║ 🌐 Main Site:      http://localhost:${PORT}                ║
║ 🛍️ Products:       http://localhost:${PORT}/products       ║
║ 🛒 View Cart:      http://localhost:${PORT}/products/cart/view ║
║ 💳 Checkout:       http://localhost:${PORT}/products/checkout ║
║ 👑 Admin:          http://localhost:${PORT}/admin          ║
║ 🧪 Test Checkout:  http://localhost:${PORT}/test-checkout-form ║
║ 📊 Database Test:  http://localhost:${PORT}/test-db       ║
║ 🔧 Session Test:   http://localhost:${PORT}/test-session  ║
║ 🐛 Debug Routes:   http://localhost:${PORT}/debug-routes  ║
╚══════════════════════════════════════════════════════════╝
    `);
    
    // Test database models on startup
    setTimeout(async () => {
        try {
            const Product = require('./models/Product');
            const Order = require('./models/Order');
            console.log('\n📊 Checking database models...');
            console.log('✅ Product model:', typeof Product);
            console.log('✅ Order model:', typeof Order);
            console.log('✅ Models loaded successfully');
        } catch (error) {
            console.error('❌ Error loading models:', error.message);
        }
    }, 1000);
});