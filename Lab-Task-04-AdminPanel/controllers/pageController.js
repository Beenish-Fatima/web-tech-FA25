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

    // Contact page
    contact: (req, res) => {
        res.render('contact', {
            title: 'Contact Us - BeBuilder',
            page: 'contact'
        });
    }
};

module.exports = pageController;