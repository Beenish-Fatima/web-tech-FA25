const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;



// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bebuilder')
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve CSS from root 'css' folder 
app.use('/css', express.static(path.join(__dirname, 'css')));

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
            </ul>
        </body>
        </html>
    `);
});

// Import routes
const pageRoutes = require('./routes/pageRoutes');
const productRoutes = require('./routes/productRoutes');

// Use routes
app.use('/', pageRoutes);
app.use('/products', productRoutes);

// 404 handler
app.use((req, res) => {
    console.log(`❌ 404: ${req.url}`);
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>404</title>
            <style>body{font-family:Arial;padding:20px;}</style>
        </head>
        <body>
            <h1>404 - Page Not Found</h1>
            <a href="/">Home</a>
        </body>
        </html>
    `);
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>500</title>
            <style>body{font-family:Arial;padding:20px;}</style>
        </head>
        <body>
            <h1>500 - Server Error</h1>
            <p>${err.message}</p>
            <a href="/">Home</a>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
