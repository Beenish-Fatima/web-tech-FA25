const express = require('express');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Import routes - only pageRoutes now
const pageRoutes = require('./routes/pageRoutes');

// Use routes

app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    
    // Send simple error page with all required variables
    res.status(500).render('500', { 
        title: 'Server Error - BeBuilder',
        page: 'error',  // Add this line
        heroTitle: 'Server Error',
        heroSubtitle: 'Something went wrong on our server.'
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState;
    let status = 'unknown';
    
    switch(dbStatus) {
        case 0: status = 'disconnected'; break;
        case 1: status = 'connected'; break;
        case 2: status = 'connecting'; break;
        case 3: status = 'disconnecting'; break;
    }
    
    res.json({
        app: 'running',
        database: {
            status: status,
            readyState: dbStatus,
            name: mongoose.connection.name,
            host: mongoose.connection.host,
            port: mongoose.connection.port
        },
        timestamp: new Date()
    });
});

// Test CSS endpoint
app.get('/test-css', (req, res) => {
    const cssPath = path.join(__dirname, 'public', 'css', 'style.css');
    const fs = require('fs');
    const cssExists = fs.existsSync(cssPath);
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>CSS Test</title>
            <link rel="stylesheet" href="/css/style.css">
            <style>
                body { padding: 50px; font-family: Arial; }
                .test-result { 
                    padding: 20px; 
                    margin: 20px 0; 
                    border-radius: 5px;
                    background: ${cssExists ? '#27ae60' : '#e74c3c'};
                    color: white;
                }
            </style>
        </head>
        <body>
            <h1>CSS File Test</h1>
            
            <div class="test-result">
                CSS file exists: ${cssExists ? '✅ YES' : '❌ NO'}
                <br>CSS path: ${cssPath}
            </div>
            
            <p><a href="/css/style.css" target="_blank">Open CSS file directly</a></p>
            <p><a href="/">Go to Home</a></p>
            
            <h2>Test CSS Loading:</h2>
            <div style="background: #f1c40f; color: #111; padding: 20px; margin: 20px 0; border-radius: 5px;">
                If this box is yellow with black text, inline CSS works.
            </div>
        </body>
        </html>
    `);
});

// 404 handler
// Update the 404 handler (before the error handler):
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - Page Not Found - BeBuilder</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Poppins', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background: #f9f9f9;
                }
                
                .error-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
                
                .error-header {
                    background: #111;
                    color: white;
                    padding: 15px 0;
                }
                
                .error-header .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .logo {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #f1c40f;
                    text-decoration: none;
                }
                
                .error-hero {
                    background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)),
                                url('https://images.unsplash.com/photo-1589652717521-10c0d092dea9?auto=format&fit=crop&w=1600&q=60')
                                no-repeat center center/cover;
                    height: 50vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    color: white;
                    padding: 0 20px;
                }
                
                .error-hero h1 {
                    font-size: 2.5rem;
                    margin-bottom: 15px;
                }
                
                .error-hero p {
                    font-size: 1.2rem;
                    max-width: 600px;
                    margin: 0 auto 30px;
                }
                
                .btn {
                    display: inline-block;
                    background: #f1c40f;
                    color: #111;
                    padding: 12px 25px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .btn:hover {
                    background: #d4ac0d;
                    transform: translateY(-2px);
                }
                
                .btn-secondary {
                    background: #3498db;
                    color: white;
                    margin-left: 10px;
                }
                
                .btn-secondary:hover {
                    background: #2980b9;
                }
            </style>
        </head>
        <body>
            <header class="error-header">
                <div class="container">
                    <a href="/" class="logo">BeBuilder</a>
                    <nav>
                        <a href="/" class="btn">Go Home</a>
                    </nav>
                </div>
            </header>
            
            <section class="error-hero">
                <div class="error-container">
                    <h1>404 - Page Not Found</h1>
                    <p>The page you're looking for doesn't exist or has been moved.</p>
                    <a href="/" class="btn">Go Home</a>
                    <a href="/products" class="btn btn-secondary">Browse Products</a>
                </div>
            </section>
        </body>
        </html>
    `);
});

// Error handler
// Replace the entire error handler with this:
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    
    // Send simple HTML error page
    res.status(500).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>500 - Server Error - BeBuilder</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Poppins', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background: #f9f9f9;
                }
                
                .error-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
                
                .error-header {
                    background: #111;
                    color: white;
                    padding: 15px 0;
                }
                
                .error-header .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .logo {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #f1c40f;
                    text-decoration: none;
                }
                
                .error-hero {
                    background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)),
                                url('https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=1600&q=60')
                                no-repeat center center/cover;
                    height: 50vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    color: white;
                    padding: 0 20px;
                }
                
                .error-hero h1 {
                    font-size: 2.5rem;
                    margin-bottom: 15px;
                }
                
                .error-hero p {
                    font-size: 1.2rem;
                    max-width: 600px;
                    margin: 0 auto 30px;
                }
                
                .btn {
                    display: inline-block;
                    background: #f1c40f;
                    color: #111;
                    padding: 12px 25px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .btn:hover {
                    background: #d4ac0d;
                    transform: translateY(-2px);
                }
                
                .error-details {
                    background: white;
                    padding: 40px;
                    margin: 40px auto;
                    max-width: 800px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                
                .error-details pre {
                    background: #f9f9f9;
                    padding: 20px;
                    border-radius: 5px;
                    overflow-x: auto;
                    font-family: monospace;
                    font-size: 0.9rem;
                    margin-top: 20px;
                    border-left: 4px solid #e74c3c;
                }
                
                @media (max-width: 768px) {
                    .error-hero h1 {
                        font-size: 2rem;
                    }
                    
                    .error-details {
                        padding: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <header class="error-header">
                <div class="container">
                    <a href="/" class="logo">BeBuilder</a>
                    <nav>
                        <a href="/" class="btn" style="background: #3498db;">Go Home</a>
                    </nav>
                </div>
            </header>
            
            <section class="error-hero">
                <div class="error-container">
                    <h1>500 - Server Error</h1>
                    <p>Something went wrong on our server. Our team has been notified and we're working to fix it.</p>
                    <a href="/" class="btn">Go Home</a>
                    <a href="javascript:location.reload()" class="btn" style="background: #3498db; margin-left: 10px;">Try Again</a>
                </div>
            </section>
            
            <div class="error-container">
                <div class="error-details">
                    <h2>Error Details</h2>
                    <p><strong>Message:</strong> ${err.message}</p>
                    <pre>${err.stack}</pre>
                </div>
            </div>
        </body>
        </html>
    `);
});


app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving static files from: ${path.join(__dirname, 'public')}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔗 Test CSS: http://localhost:${PORT}/test-css`);
    console.log(`🔗 Products page: http://localhost:${PORT}/products`);
});