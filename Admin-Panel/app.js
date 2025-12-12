const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/ecommerce')
    .then(() => {
        console.log('✅ MongoDB connected successfully');
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
    });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static('public'));

// EJS Layouts
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Routes
const adminRoutes = require('./routes/admin');
const mainRoutes = require('./routes/main');

// Set different layouts for different routes
app.use((req, res, next) => {
    if (req.path.startsWith('/admin')) {
        app.set('layout', 'admin/layout');
    } else {
        app.set('layout', 'main/layout');
    }
    next();
});

app.use('/', mainRoutes);
app.use('/admin', adminRoutes);

// Simple 404 handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Simple store page for testing
app.get('/simple-store', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Simple Store</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
                h1 { color: #2c3e50; }
                a { color: #3498db; text-decoration: none; margin: 10px; display: inline-block; }
            </style>
        </head>
        <body>
            <h1>Welcome to the Store</h1>
            <p>This is a simple placeholder for the main store.</p>
            <a href="/admin">← Back to Admin Panel</a>
        </body>
        </html>
    `);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🏪 Main Store: http://localhost:${PORT}`);
    console.log(`👨‍💼 Admin Panel: http://localhost:${PORT}/admin`);
});