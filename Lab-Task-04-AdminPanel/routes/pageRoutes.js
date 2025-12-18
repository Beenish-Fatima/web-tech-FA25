const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

// Define routes
router.get('/', pageController.home);
router.get('/about', pageController.about);
router.get('/services', pageController.services);
router.get('/testimonials', pageController.testimonials);
router.get('/contact', pageController.contact);

module.exports = router;