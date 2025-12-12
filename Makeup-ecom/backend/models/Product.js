const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ['lipstick', 'foundation', 'eyeshadow', 'mascara', 'blush', 'skincare', 'brushes'],
        required: true
    },
    shades: [{
        name: String,
        hexCode: String
    }],
    images: [String],
    stock: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);