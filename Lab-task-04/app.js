const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
require('dotenv').config();

const app = express();

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

app.use(flash());

// EJS configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Flash messages middleware
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

// Routes
const adminRoutes = require('./routes/admin');

// Admin routes
app.use('/admin', adminRoutes);

// Main website routes (example)
app.get('/', (req, res) => {
    res.render('home', { 
        title: 'E-commerce Store',
        layout: 'layouts/main-layout'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('admin/error', { 
        message: 'Something went wrong!',
        error: err,
        layout: req.path.startsWith('/admin') ? 'layouts/admin-layout' : 'layouts/main-layout'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('admin/404', { 
        layout: req.path.startsWith('/admin') ? 'layouts/admin-layout' : 'layouts/main-layout'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
});