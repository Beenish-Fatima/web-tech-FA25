// Middleware to check if user is admin
const adminOnly = (req, res, next) => {
    // For demo purposes, we'll use a simple check
    // In a real app, you'd have proper authentication
    
    // Check if user is logged in as admin
    if (req.session.user && req.session.user.isAdmin) {
        return next();
    }
    
    // For demo, we can check query params
    if (req.query.admin === 'true') {
        req.session.user = { isAdmin: true };
        return next();
    }
    
    // Check for admin email (from your login form)
    if (req.query.email === 'admin@shop.com' || 
        (req.session.user && req.session.user.email === 'admin@shop.com')) {
        req.session.user = { 
            email: 'admin@shop.com', 
            isAdmin: true 
        };
        return next();
    }
    
    // If using your admin login form
    if (req.query.username === 'admin' && req.query.password === 'password') {
        req.session.user = { 
            username: 'admin',
            isAdmin: true 
        };
        return next();
    }
    
    // Redirect to admin login
    res.redirect('/admin/login?error=Admin access required');
};

module.exports = { adminOnly };