const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('📁 Current directory:', __dirname);
console.log('📁 CSS file path:', path.join(__dirname, 'css', 'style.css'));

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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.url}`);
    next();
});

// Test route for CSS
app.get('/css-test', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>CSS Test Page</title>
            <link rel="stylesheet" href="/css/style.css">
            <style>
                .inline-test { color: red; font-weight: bold; font-size: 24px; }
            </style>
        </head>
        <body style="padding: 20px;">
            <h1 class="inline-test">✓ This is RED (inline CSS working)</h1>
            <h1>
                ✓ This should have styles from style.css
            </h1>
            <p>Test links:</p>
            <ul>
                <li><a href="/css/style.css" target="_blank">Direct CSS file</a></li>
                <li><a href="/">Home page</a></li>
                <li><a href="/admin/dashboard">Admin Dashboard</a></li>
            </ul>
        </body>
        </html>
    `);
});

// Import ALL models (important!)
require('./models/Product');

// Import routes
const pageRoutes = require('./routes/pageRoutes');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes'); // NEW

// Use routes
app.use('/', pageRoutes);
app.use('/products', productRoutes);
app.use('/', adminRoutes); // NEW - Admin routes

// Quick test route to verify products in database
app.get('/test-db', async (req, res) => {
    try {
        const Product = require('./models/Product');
        const products = await Product.find();
        
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Database Test</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    .success { color: green; }
                    .error { color: red; }
                    .product { border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <h1>Database Connection Test</h1>
                <p class="success">✅ MongoDB Connected: ${mongoose.connection.readyState === 1 ? 'Yes' : 'No'}</p>
                <p>📊 Total Products: ${products.length}</p>
                
                <h2>Products in Database:</h2>
                ${products.length > 0 ? 
                    products.map(p => `
                        <div class="product">
                            <strong>${p.name}</strong><br>
                            Price: $${p.price}<br>
                            Category: ${p.category}<br>
                            Stock: ${p.stock}
                        </div>
                    `).join('') :
                    '<p class="error">No products found! Run: node insertSampleData.js</p>'
                }
                
                <h2>Quick Links:</h2>
                <ul>
                    <li><a href="/">Home Page</a></li>
                    <li><a href="/products">Products Page</a></li>
                    <li><a href="/admin/dashboard">Admin Dashboard</a></li>
                    <li><a href="/admin/products">Admin Products</a></li>
                </ul>
            </body>
            </html>
        `);
    } catch (error) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>DB Error</title></head>
            <body>
                <h1>Database Error</h1>
                <p style="color: red;">${error.message}</p>
            </body>
            </html>
        `);
    }
});

// Admin login simulation (simple version - for development only)
app.get('/admin/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Admin Login</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin: 0;
                }
                .login-box {
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    width: 300px;
                    text-align: center;
                }
                .login-box h1 {
                    color: #333;
                    margin-bottom: 30px;
                }
                .login-box input {
                    width: 100%;
                    padding: 12px;
                    margin: 10px 0;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-sizing: border-box;
                }
                .login-box button {
                    width: 100%;
                    padding: 12px;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    margin-top: 10px;
                }
                .login-box button:hover {
                    background: #764ba2;
                }
                .note {
                    color: #666;
                    font-size: 12px;
                    margin-top: 20px;
                    padding: 10px;
                    background: #f5f5f5;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>
            <div class="login-box">
                <h1>🔐 Admin Login</h1>
                <form action="/admin/dashboard" method="GET">
                    <input type="text" name="username" placeholder="Username" value="admin" required>
                    <input type="password" name="password" placeholder="Password" value="password" required>
                    <button type="submit">Login</button>
                </form>
                <div class="note">
                    <strong>For Demo Only:</strong><br>
                    Username: admin<br>
                    Password: password
                </div>
            </div>
        </body>
        </html>
    `);
});

// Redirect root admin to login (optional)
app.get('/admin', (req, res) => {
    res.redirect('/admin/login');
});

// 404 handler
app.use((req, res) => {
    console.log(`❌ 404: ${req.url}`);
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>404 - Page Not Found</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    text-align: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                h1 { font-size: 48px; margin-bottom: 20px; }
                p { font-size: 18px; margin-bottom: 30px; }
                a {
                    color: white;
                    text-decoration: none;
                    background: rgba(255,255,255,0.2);
                    padding: 12px 30px;
                    border-radius: 30px;
                    font-weight: bold;
                }
                a:hover {
                    background: rgba(255,255,255,0.3);
                }
                .links {
                    display: flex;
                    gap: 20px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <h1>404</h1>
            <p>The page you're looking for doesn't exist.</p>
            <div class="links">
                <a href="/">🏠 Home</a>
                <a href="/products">🛍️ Products</a>
                <a href="/admin/dashboard">👑 Admin</a>
            </div>
        </body>
        </html>
    `);
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    console.error(err.stack);
    res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>500 - Server Error</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    text-align: center;
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                h1 { font-size: 48px; margin-bottom: 20px; }
                p { font-size: 18px; margin-bottom: 30px; }
                .error-details {
                    background: rgba(255,255,255,0.1);
                    padding: 20px;
                    border-radius: 10px;
                    max-width: 600px;
                    text-align: left;
                    font-family: monospace;
                    font-size: 14px;
                }
                a {
                    color: white;
                    text-decoration: none;
                    background: rgba(255,255,255,0.2);
                    padding: 12px 30px;
                    border-radius: 30px;
                    font-weight: bold;
                    margin-top: 20px;
                }
                a:hover {
                    background: rgba(255,255,255,0.3);
                }
            </style>
        </head>
        <body>
            <h1>500</h1>
            <p>Oops! Something went wrong on our server.</p>
            <div class="error-details">
                <strong>Error:</strong> ${err.message}
            </div>
            <a href="/">Return to Home</a>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`👑 Admin Dashboard: http://localhost:${PORT}/admin/dashboard`);
    console.log(`👑 Admin Login: http://localhost:${PORT}/admin/login`);
    console.log(`📊 Database Test: http://localhost:${PORT}/test-db`);
    console.log(`🛍️ Products Page: http://localhost:${PORT}/products`);
});