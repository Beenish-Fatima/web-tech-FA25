const pageController = {
    // Home page
    home: (req, res) => {
        res.render('index', {
            title: 'Home - BeBuilder',
            page: 'home',
            heroTitle: 'We Build Beautiful Experiences',
            heroSubtitle: 'Professional design and development that brings your brand to life.'
        });
    },

    // About page
    about: (req, res) => {
        res.render('about', {
            title: 'About Us - BeBuilder',
            page: 'about'
        });
    },

    // Services page
    services: (req, res) => {
        const services = [
            {
                id: 1,
                title: 'Web Design',
                description: 'Clean, modern designs optimized for performance and usability.',
                image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=500&q=60'
            },
            {
                id: 2,
                title: 'Development',
                description: 'Full-stack solutions built with precision and scalability in mind.',
                image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=60'
            },
            {
                id: 3,
                title: 'Marketing',
                description: 'Creative campaigns that connect your brand with your audience.',
                image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=500&q=60'
            }
        ];

        res.render('services', {
            title: 'Our Services - BeBuilder',
            page: 'services',
            services
        });
    },

    // Testimonials page
    testimonials: (req, res) => {
        const testimonials = [
            {
                text: '"BeBuilder transformed our online presence — highly recommended!"',
                author: 'Sarah J., CEO of BrightCo'
            },
            {
                text: '"Professional, creative, and responsive throughout the entire process."',
                author: 'David M., Startup Founder'
            }
        ];

        res.render('testimonials', {
            title: 'Testimonials - BeBuilder',
            page: 'testimonials',
            testimonials
        });
    },


// Add this to your pageController exports:
products: async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;
        
        // Build filter object
        const filter = {};
        
        // Category filter
        if (req.query.category && req.query.category !== 'all') {
            filter.category = req.query.category;
        }
        
        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) {
                filter.price.$gte = parseFloat(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                filter.price.$lte = parseFloat(req.query.maxPrice);
            }
        }
        
        // Search by name
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' };
        }
        
        // Get products with filters
        const products = await Product.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        
        // Get total count for pagination
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);
        
        // Get unique categories for filter dropdown
        const categories = await Product.distinct('category');
        
        res.render('products', {
            title: 'Our Products - BeBuilder',
            page: 'products',  // THIS IS MISSING - ADD THIS LINE
            heroTitle: 'Our Products',
            heroSubtitle: 'Discover amazing products for your needs',
            products: products,
            currentPage: page,
            totalPages: totalPages,
            totalProducts: totalProducts,
            categories: categories,
            query: req.query
        });
        
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).render('500', {
            title: 'Server Error - BeBuilder',
            page: 'error'  // Add page variable here too
        });
    }
},
    // Contact page
    contact: (req, res) => {
        res.render('contact', {
            title: 'Contact Us - BeBuilder',
            page: 'contact'
        });
    }
};

module.exports = pageController;