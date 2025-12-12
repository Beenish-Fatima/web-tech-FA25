const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const methodOverride = require('method-override');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Method override
router.use(methodOverride('_method'));

// Middleware to pass messages
router.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

// Admin Dashboard
router.get('/', async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const inStock = await Product.countDocuments({ stock: { $gt: 0 } });
        const outOfStock = await Product.countDocuments({ stock: 0 });
        const featured = await Product.countDocuments({ featured: true });
        const recentProducts = await Product.find()
            .sort({ createdAt: -1 })
            .limit(5);

        res.render('admin/dashboard', {
            stats: { totalProducts, inStock, outOfStock, featured },
            recentProducts
        });
    } catch (error) {
        req.session.messages = { error: 'Error loading dashboard' };
        res.redirect('/admin');
    }
});

// GET All Products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.render('admin/products', { products });
    } catch (error) {
        req.session.messages = { error: 'Error loading products' };
        res.redirect('/admin/products');
    }
});

// GET Add Product Form
router.get('/products/add', (req, res) => {
    res.render('admin/add-product');
});

// POST Create Product
router.post('/products/add', upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category, stock, discount, featured } = req.body;
        
        const productData = {
            name,
            description,
            price: parseFloat(price),
            category,
            stock: parseInt(stock),
            discount: parseInt(discount) || 0,
            featured: featured === 'on'
        };

        // Handle image upload
        if (req.file) {
            productData.image = req.file.filename;
        }

        const product = new Product(productData);
        await product.save();

        req.session.messages = { success: 'Product added successfully!' };
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        req.session.messages = { error: 'Error adding product' };
        res.redirect('/admin/products/add');
    }
});

// GET View Single Product
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.session.messages = { error: 'Product not found' };
            return res.redirect('/admin/products');
        }
        res.render('admin/view-product', { product });
    } catch (error) {
        req.session.messages = { error: 'Error loading product' };
        res.redirect('/admin/products');
    }
});

// GET Edit Product Form
router.get('/products/edit/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.session.messages = { error: 'Product not found' };
            return res.redirect('/admin/products');
        }
        res.render('admin/edit-product', { product });
    } catch (error) {
        req.session.messages = { error: 'Error loading product' };
        res.redirect('/admin/products');
    }
});

// PUT Update Product
router.put('/products/edit/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category, stock, discount, featured } = req.body;
        
        const updateData = {
            name,
            description,
            price: parseFloat(price),
            category,
            stock: parseInt(stock),
            discount: parseInt(discount) || 0,
            featured: featured === 'on',
            updatedAt: Date.now()
        };

        // Handle image upload
        if (req.file) {
            updateData.image = req.file.filename;
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!product) {
            req.session.messages = { error: 'Product not found' };
            return res.redirect('/admin/products');
        }

        req.session.messages = { success: 'Product updated successfully!' };
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        req.session.messages = { error: 'Error updating product' };
        res.redirect(`/admin/products/edit/${req.params.id}`);
    }
});

// DELETE Product
router.delete('/products/delete/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            req.session.messages = { error: 'Product not found' };
            return res.redirect('/admin/products');
        }

        req.session.messages = { success: 'Product deleted successfully!' };
        res.redirect('/admin/products');
    } catch (error) {
        req.session.messages = { error: 'Error deleting product' };
        res.redirect('/admin/products');
    }
});

// Admin Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;